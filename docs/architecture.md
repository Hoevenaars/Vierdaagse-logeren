# Architectuur — VierdaagseLogeren.nl

De publieke site blijft Astro (NL/EN/DE) op Vercel. De specificatie noemt Next.js als groeneveld-stack; deze repo had al een live Astro-site, i18n en Decap CMS. Fase 0/1 hergebruikt die schil en isoleert domeinlogica in packages.

```text
Handmatige providerdata (seed)
        ↓
packages/database (types)
        ↓
pricing-engine  +  ranking-engine
        ↓
Astro pages (matchflow, /campings, detail, vergelijk)
        ↓
Leads / booking alerts / click tracking
```

## Scheiding

- UI-componenten bevatten geen prijs- of rankingformules.
- `packages/pricing-engine` is deterministisch. LLM’s mogen nooit totalen verzinnen.
- `packages/ranking-engine` is reproduceerbaar (vaste gewichten).
- `packages/mutation-policy` is de poort tussen toekomstige agents en de database.
- Frontend leest in fase 1 uit `src/data/providers.ts`. Dezelfde types volgen het Supabase-schema.

## Supabase

Migratie: `supabase/migrations/20260912100000_vierdaagse_platform.sql`.

Deze migratie is nog niet op een bestaand project gezet: de beschikbare Supabase-projecten horen bij andere producten. Koppel een dedicated Vierdaagse-project voordat je seedt.

Agents (fase 2+) schrijven nooit rechtstreeks productierijen bij. Flow:

```text
Agent proposal → schema-validatie → mutation policy → auto apply of review_queue → change_log
```

## Feature flags

`src/lib/feature-flags.ts` houdt autonome agents uit totdat logging en review queue in productie staan.
