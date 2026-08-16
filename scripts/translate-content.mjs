#!/usr/bin/env node
/**
 * Vertaal-concepten genereren voor nieuwe/gewijzigde NL-content.
 *
 * Werkwijze (bewuste keuze, zie 23_DECISION_LOG.md — restyle juli 2026,
 * bijgewerkt: overstap Anthropic API → DeepL API Free, zie overdracht):
 * - Dit script vertaalt NOOIT stilzwijgend naar live tekst. Het zet een concept
 *   klaar in hetzelfde databestand, met vertaalstatus "concept".
 * - Een veld wordt alleen vertaald als de status "leeg" is. Wil je een veld
 *   opnieuw laten vertalen (bijvoorbeeld na een NL-wijziging), zet de status
 *   dan zelf terug naar "leeg" in het CMS — dat is de bewuste trigger.
 * - Velden met status "vastgelegd-niet-vertalen" (zoals de footer-disclosure,
 *   een compliance-tekst) worden nooit aangeraakt.
 * - "gecontroleerd" betekent: een mens heeft het gelezen en goedgekeurd. Dit
 *   script overschrijft nooit een gecontroleerde vertaling.
 *
 * Bekende trade-off (geaccepteerd bij de overstap naar DeepL): DeepL vertaalt
 * letterlijk en kent geen merktoon-instructies — de eerdere Claude-aanpak
 * stuurde expliciet op een informele, geruststellende "buurtgenoot"-stijl.
 * Concepten uit DeepL zijn generieker en vragen mogelijk iets meer
 * handmatige bijschaving bij de controle-stap vóór publicatie.
 *
 * Gebruik: node scripts/translate-content.mjs
 * Vereist: DEEPL_API_KEY als environment variable (Free-tier key, herkenbaar
 * aan de ":fx"-suffix, gebruikt daarom het api-free.deepl.com-endpoint).
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const GEBIEDEN_DIR = path.join(ROOT, 'src/data/gebieden');
const SITE_STRINGS_FILE = path.join(ROOT, 'src/data/site-strings.json');

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// DeepL Free heeft een streng rate-limit. Kleine pauze + retries bij 429.
const REQUEST_GAP_MS = 350;
const MAX_RETRIES = 6;

const DEEPL_TARGET_LANG = {
  de: 'DE',
  en: 'EN-US',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translate(text, targetLanguage) {
  if (!text || !text.trim()) return '';

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0 || REQUEST_GAP_MS > 0) {
      // Eerste call: korte gap. Retries: exponentieel + eventuele Retry-After.
      const backoff = attempt === 0 ? REQUEST_GAP_MS : Math.min(30_000, REQUEST_GAP_MS * 2 ** attempt);
      await sleep(backoff);
    }

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: 'NL',
        target_lang: DEEPL_TARGET_LANG[targetLanguage],
      }),
    });

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(30_000, 1000 * 2 ** attempt);
      console.warn(
        `  DeepL rate-limit (429) voor ${targetLanguage} — poging ${attempt + 1}/${MAX_RETRIES + 1}, wacht ${Math.round(waitMs / 1000)}s`
      );
      await sleep(waitMs);
      lastError = new Error(`DeepL API-fout (429) bij vertalen naar ${targetLanguage}`);
      continue;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '(kon foutinhoud niet lezen)');
      throw new Error(
        `DeepL API-fout (${response.status}) bij vertalen naar ${targetLanguage}: ${body}`
      );
    }

    const data = await response.json();
    const translation = data?.translations?.[0]?.text;

    if (!translation) {
      throw new Error(
        `DeepL gaf een onverwacht antwoord terug (geen vertaling gevonden) voor taal ${targetLanguage}: ${JSON.stringify(data)}`
      );
    }

    return translation.trim();
  }

  throw lastError ?? new Error(`DeepL rate-limit bleef 429 na ${MAX_RETRIES + 1} pogingen`);
}

/**
 * Vertaalt een object met nl/de/en + vertaalstatus in-place (site-strings).
 */
async function translateField(field, label) {
  if (!field || typeof field !== 'object') return false;
  let changed = false;
  const status = field.vertaalstatus ?? {};

  for (const lang of ['de', 'en']) {
    if (status[lang] === 'vastgelegd-niet-vertalen' || status[lang] === 'gecontroleerd') {
      continue;
    }
    if (status[lang] === 'leeg' || (!status[lang] && !field[lang]?.trim())) {
      const vertaling = await translate(field.nl, lang);
      if (vertaling) {
        field[lang] = vertaling;
        status[lang] = 'concept';
        changed = true;
        console.log(`  [${lang}] concept gegenereerd voor "${label}"`);
      }
    }
  }

  field.vertaalstatus = status;
  return changed;
}

async function processGebieden() {
  const files = (await readdir(GEBIEDEN_DIR)).filter((f) => f.endsWith('.json'));
  const veldNamen = ['titel', 'seoBeschrijving', 'intro', 'afstand', 'typeVerblijf', 'praktisch'];

  for (const file of files) {
    const filePath = path.join(GEBIEDEN_DIR, file);
    const data = JSON.parse(await readFile(filePath, 'utf-8'));
    let anyChanged = false;
    const rootStatus = { ...(data.vertaalstatus ?? {}) };

    for (const lang of ['de', 'en']) {
      if (rootStatus[lang] === 'gecontroleerd' || rootStatus[lang] === 'vastgelegd-niet-vertalen') {
        continue;
      }

      let langChanged = false;
      for (const veld of veldNamen) {
        const field = data[veld];
        if (!field?.nl?.trim()) continue;

        const forceRefresh = rootStatus[lang] === 'leeg';
        if (!forceRefresh && field[lang]?.trim()) continue;

        const vertaling = await translate(field.nl, lang);
        if (vertaling) {
          field[lang] = vertaling;
          langChanged = true;
          anyChanged = true;
          console.log(`  [${lang}] concept gegenereerd voor "${data.naam} — ${veld}"`);
        }
      }

      if (langChanged || rootStatus[lang] === 'leeg') {
        rootStatus[lang] = 'concept';
        anyChanged = true;
      }
    }

    if (anyChanged) {
      data.vertaalstatus = rootStatus;
      await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      console.log(`Bijgewerkt: ${file}`);
    }
  }
}

async function processSiteStrings() {
  const data = JSON.parse(await readFile(SITE_STRINGS_FILE, 'utf-8'));
  let anyChanged = false;

  for (const item of data.strings) {
    const changed = await translateField(item, item.key);
    anyChanged = anyChanged || changed;
  }

  if (anyChanged) {
    await writeFile(SITE_STRINGS_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log('Bijgewerkt: site-strings.json');
  }
}

async function main() {
  if (!process.env.DEEPL_API_KEY) {
    console.error('DEEPL_API_KEY ontbreekt — vertaalstap overgeslagen.');
    process.exit(1);
  }
  console.log('Vertaalconcepten genereren...');
  await processGebieden();
  await processSiteStrings();
  console.log('Klaar.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
