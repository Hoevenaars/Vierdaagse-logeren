---
import ContentPage from '../../../layouts/ContentPage.astro';

const gebiedenModules = import.meta.glob('../../../data/gebieden/*.json', { eager: true });
const areas = Object.values(gebiedenModules)
  .map((mod: any) => mod.default)
  .sort((a, b) => a.naam.localeCompare(b.naam));
---

<ContentPage
  title="Places to stay around Nijmegen — Vierdaagse Logeren"
  description="Overview of towns around Nijmegen where you can stay during the Four Days Marches."
  locale="en"
  h1="Places to stay around Nijmegen"
>
  <p>
    Nijmegen itself books up first during the Four Days Marches. The surrounding
    municipalities along the route often offer more availability at a similar travel time.
  </p>
  <ul>
    {areas.map((area: any) => (
      <li><a href={`/en/gebied/${area.slug}`}>{area.naam}</a></li>
    ))}
  </ul>
  <p class="callout callout--open">We're expanding this overview with more towns along the route.</p>
</ContentPage>
