#!/usr/bin/env node
/**
 * Vertaal-concepten genereren voor nieuwe/gewijzigde NL-content.
 *
 * Werkwijze (bewuste keuze, zie 23_DECISION_LOG.md — restyle juli 2026):
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
 * Gebruik: node scripts/translate-content.mjs
 * Vereist: ANTHROPIC_API_KEY als environment variable.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-5';
// Kwaliteit weegt hier zwaarder dan kosten: dit is merk-tekst die (ongecontroleerd)
// live kan komen te staan. Overweeg 'claude-haiku-4-5-20251001' alleen als het
// aantal strings sterk groeit en kosten een probleem worden.

const ROOT = path.resolve(import.meta.dirname, '..');
const GEBIEDEN_DIR = path.join(ROOT, 'src/data/gebieden');
const SITE_STRINGS_FILE = path.join(ROOT, 'src/data/site-strings.json');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Condensed uit brandbook-vierdaagse-logeren.md §8-13. Bij wijziging van de
// merktoon: hier bijwerken, dit script leest het brandbook zelf niet in.
const TONE_INSTRUCTIONS = `
Je vertaalt teksten voor Vierdaagse Logeren, een platform dat wandelaars en
bewoners langs de Vierdaagse-route in Nijmegen met elkaar verbindt voor een
slaapplek.

Merkpersoonlijkheid: een buurtgenoot die al jaren in de regio woont en weet wie
waar nog ruimte heeft. Geen accountmanager van een boekingsplatform, geen
enthousiaste festivalorganisator.

Regels voor de vertaling:
- Je/jij-vorm (of het informele equivalent in de doeltaal), geen formele aanspreekvorm.
- Korte zinnen, directe taal.
- Geruststellend zonder te bagatelliseren.
- Nooit salestaal: geen uitroeptekens als stijlmiddel, geen "boek nu", geen
  "geweldige deals", geen "ontdek", geen "dé oplossing".
- Vertaal betekenis en toon, niet woord-voor-woord. Een Nederlandse uitdrukking
  mag een natuurlijk klinkend Duits/Engels equivalent krijgen.
- Behoud opmaak (markdown, links, placeholders zoals "[Invullen: ...]" —
  vertaal de placeholder-tekst zelf gewoon mee, die is voor de redacteur).

Geef ALLEEN de vertaalde tekst terug, zonder aanhalingstekens, toelichting of
inleidende zin.
`.trim();

async function translate(text, targetLanguage) {
  if (!text || !text.trim()) return '';
  const langName = targetLanguage === 'de' ? 'Duits' : 'Engels';
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: TONE_INSTRUCTIONS,
    messages: [
      {
        role: 'user',
        content: `Vertaal de volgende Nederlandse tekst naar het ${langName}:\n\n${text}`,
      },
    ],
  });
  const block = response.content.find((b) => b.type === 'text');
  return block ? block.text.trim() : '';
}

/** Vertaalt een {nl, de, en, vertaalstatus} veldobject in-place. Retourneert of er iets is gewijzigd. */
async function translateField(field, label) {
  if (!field || typeof field !== 'object') return false;
  let changed = false;
  const status = field.vertaalstatus ?? {};

  for (const lang of ['de', 'en']) {
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

    for (const veld of veldNamen) {
      const changed = await translateField(data[veld], `${data.naam} — ${veld}`);
      anyChanged = anyChanged || changed;
    }

    if (anyChanged) {
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
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY ontbreekt — vertaalstap overgeslagen.');
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
