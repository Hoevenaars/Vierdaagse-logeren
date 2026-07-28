---
import BaseLayout from '../../layouts/BaseLayout.astro';
import InfoCard from '../../components/InfoCard.astro';
import { useTranslations } from '../../i18n/utils';

const locale = 'de' as const;
const t = useTranslations(locale);
---

<BaseLayout
  title="Vierdaagse Logeren — Rechtzeitig eine Unterkunft für den Vierdaagse"
  description="Finde rechtzeitig eine Unterkunft für den Vierdaagse Nijmegen: Camping, Privatunterkunft oder Hotel."
  locale={locale}
>
  <section class="hero">
    <h1>{t('home.h1')}</h1>
    <p class="intro">{t('home.intro')}</p>
  </section>

  <section class="cards" aria-label="Art der Unterkunft">
    <InfoCard title={t('card.camping.title')} text={t('card.camping.text')} href="/de/camping" />
    <InfoCard title={t('card.particulier.title')} text={t('card.particulier.text')} href="/de/particuliere-verhuur" />
    <InfoCard title={t('card.hotels.title')} text={t('card.hotels.text')} href="/de/hotels-bb" />
  </section>

  <section class="urgency">
    <h2>Wann solltest du buchen?</h2>
    <p>
      Campingplätze und zentral gelegene Unterkünfte sind meist als Erstes ausgebucht, oft
      schon Monate vor der Veranstaltung. Fang früh an — das spart Geld und Stress.
    </p>
    <a href="/de/gids/wanneer-boeken">Zum vollständigen Ratgeber &rarr;</a>
  </section>
</BaseLayout>

<style>
  .hero {
    text-align: center;
    max-width: 40rem;
    margin: 0 auto var(--space-6);
  }
  .hero h1 {
    font-size: var(--font-size-2xl);
    color: var(--color-primary);
  }
  .intro {
    font-size: var(--font-size-lg);
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }
  .urgency {
    background: var(--color-secondary);
    padding: var(--space-5);
    border-radius: var(--radius-base);
  }
  .urgency h2 {
    color: var(--color-accent-1);
    margin-top: 0;
  }
</style>
