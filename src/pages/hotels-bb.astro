---
import ContentPage from '../layouts/ContentPage.astro';
import AanmeldFormulier from '../components/AanmeldFormulier.astro';
import hotelsData from '../data/hotels.json';
import data from '../data/pages/hotels-bb.json';
import { linkify } from '../i18n/utils';

const hotels = hotelsData.hotels;
const locale = 'nl' as const;
function v(field: Record<string, string>) { return field[locale]?.trim() ? field[locale] : field.nl; }
function vArr(field: Record<string, string[]>) { return field[locale]?.length ? field[locale] : field.nl; }
const links = { campingPath: '/camping', particulierPath: '/particuliere-verhuur' };
---

<ContentPage title={v(data.paginaTitel)} description={v(data.seoBeschrijving)} locale={locale} h1={v(data.titel)}>
  <p>{v(data.intro)}</p>

  <h2>{v(data.verwachtTitel)}</h2>
  <p>{v(data.verwachtTekst)}</p>

  <h2>{v(data.waarTitel)}</h2>
  <ul>
    {vArr(data.waarItems).map((item: string) => <li>{item}</li>)}
  </ul>

  {hotels.length > 0 ? (
    <>
      <h2>{v(data.lijstTitel)}</h2>
      <div class="location-list">
        {hotels.map((h: any) => (
          <div class="location-card">
            <h3>{h.naam} — {h.plaats}</h3>
            <p class="location-type">{h.type}</p>
            <p>{h.beschrijving}</p>
            <p class="location-contact">Contact: {h.contact}</p>
          </div>
        ))}
      </div>
    </>
  ) : (
    <>
      <h2>{v(data.leegTitel)}</h2>
      <p class="callout callout--tip">{v(data.leegTekst)}</p>
    </>
  )}

  <AanmeldFormulier
    categorie="hotel"
    typeOpties={['Hotel', 'B&B', 'Anders']}
    titel={v(data.aanmeldTitel)}
    introtekst={v(data.aanmeldIntro)}
  />

  <h2>{v(data.slotTitel)}</h2>
  <p set:html={linkify(v(data.slotTekst), links)} />
</ContentPage>

<style>
  .location-list { display: grid; gap: var(--space-4); margin-bottom: var(--space-5); }
  .location-card { border: 1px solid var(--color-border); border-radius: var(--radius-base); padding: var(--space-4); }
  .location-card h3 { color: var(--color-primary); margin: 0 0 var(--space-1); }
  .location-type { font-weight: 600; color: var(--color-accent-1); margin: 0 0 var(--space-2); }
  .location-contact { font-size: var(--font-size-sm); opacity: 0.8; }
</style>
