# Vierdaagse Logeren

Astro-site (NL/EN/DE) die wandelaars helpt een slaapplek te vinden tijdens de Vierdaagse Nijmegen.

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

## Build

```sh
npm run build
npm run preview
```

## Content & CMS

- Pagina-teksten en listings: `src/data/`
- Decap CMS: `/admin` (GitHub OAuth via `api/auth.ts` + `api/callback.ts`)
- Config: `public/admin/config.yml` (spiegel van root `config.yml`)
- Media-uploads: `public/uploads/`

Listings (camping, hotels, particulier, blarenzorg) zijn alleen zichtbaar met status **gepubliceerd**.

## Environment variables

Zie `.env.example`:

| Variable | Gebruik |
| --- | --- |
| `RESEND_API_KEY` | Mail via contact- en aanmeldformulieren |
| `OWNER_EMAIL` | Ontvanger van die mails |
| `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET` | Inloggen in `/admin` |
| `DEEPL_API_KEY` | Vertaal-Action (`npm run translate`) |

## Scripts

```sh
npm run translate   # DeepL-concepten voor lege DE/EN-velden
```

## Documentatie

- Astro: https://docs.astro.build
- Live site: https://vierdaagselogeren.nl
