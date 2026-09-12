# Vierdaagse Logeren

Astro-site (NL/EN/DE) die Vierdaagselopers helpt de juiste camping te vinden: totale prijs, afstand tot de Wedren, vervoer en voorzieningen.

## Lokaal draaien

```sh
npm install
npm run dev
```

Dev-server: `http://localhost:4321`

Achtergrondmodus (zoals in deze omgeving):

```sh
astro dev --background
astro dev status
astro dev logs
astro dev stop
```

## Tests

```sh
npm test
```

Prijs- en rankingengines zijn deterministisch (`packages/pricing-engine`, `packages/ranking-engine`).

## Build

```sh
npm run build
npm run preview
```

## Product

- Keuzehulp op de homepage → `/campings`
- Providerdetail: `/campings/[slug]`
- Vergelijking (max. 3): `/vergelijk`
- Data: `src/data/providers.ts` (zelfde model als `supabase/migrations`)
- Agents nog uit: `src/lib/feature-flags.ts`

## Content & CMS

- Pagina-teksten: `src/data/`
- Decap CMS: `/admin`
- Campingvergelijking komt uit het gestandaardiseerde datamodel, niet uit Decap-listings

## Environment variables

Zie `.env.example`.

## Documentatie

- `docs/architecture.md`
- `docs/data-model.md`
- `docs/agent-rules.md`
- Live site: https://vierdaagselogeren.nl
