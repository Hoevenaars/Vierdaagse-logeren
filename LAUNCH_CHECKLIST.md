# Website launch checklist — Vierdaagse Logeren

Status van de launch-checklist voor [www.vierdaagselogeren.nl](https://www.vierdaagselogeren.nl).  
Legenda: ✅ gedaan in code/config · 🟡 operationeel (handmatig in hosting/DNS/tools) · ➖ niet van toepassing · ⚠️ aandachtspunt

## Absoluut niet vergeten vóór “live”

| Item | Status | Toelichting |
| --- | --- | --- |
| HTTPS werkt | ✅/🟡 | Vercel dwingt HTTPS af (HSTS-header toegevoegd in `vercel.json`) |
| Website staat niet op noindex | ✅ | Productiepagina’s hebben geen `noindex`; `/admin` wel + `X-Robots-Tag` |
| robots.txt blokkeert Google niet | ✅ | `Allow: /`, alleen `/admin` geblokkeerd |
| Sitemap werkt | ✅ | `@astrojs/sitemap` → `/sitemap-index.xml` (canonical: `https://www.vierdaagselogeren.nl`) |
| Search Console ingesteld | 🟡 | Property + sitemap indienen op www-URL |
| Formulieren komen aan | 🟡 | Resend + `RESEND_API_KEY` / `OWNER_EMAIL` op Vercel controleren |
| Back-ups werken | 🟡 | GitHub = bron; Vercel deployments behouden |
| Mobiele versie getest | ✅/🟡 | Responsive nav + forms; nog even op echte devices checken |
| Broken links gecontroleerd | 🟡 | Na deploy crawlen |
| Analytics werkt | ➖ | Bewust geen analytics/marketingcookies (zie privacy) |
| Cookie consent | ➖ | Geen trackingcookies → geen banner nodig |
| Privacyverklaring live | ✅ | `/privacy` (NL/EN/DE) |
| Belangrijkste CTA’s werken | ✅ | Home-cards + gids-CTA’s |
| 404-pagina werkt | ✅ | Huisstijl + links NL/EN/DE |
| Security gecontroleerd | ✅/🟡 | Headers in `vercel.json`; secrets alleen in env |
| Getest als uitgelogde bezoeker | 🟡 | Incognito na deploy |

## 1. Domein & hosting

| Item | Status |
| --- | --- |
| Domeinnaam + spelling | 🟡 Bevestig `vierdaagselogeren.nl` |
| DNS | 🟡 |
| Hosting (Vercel) | ✅ |
| Productie ≠ staging | 🟡 Preview-deploys vs Production in Vercel |
| SSL actief + HTTP→HTTPS | ✅ Vercel |
| www vs non-www | ✅ Canonical + `site` = **www**; apex redirectt naar www |
| Auto-renew SSL | ✅ Vercel |
| Serverlocatie/performance | 🟡 Kies EU-regio in Vercel indien gewenst |

## 2. Algemene content

| Item | Status |
| --- | --- |
| Definitieve content / geen lorem | ✅ |
| Geen “coming soon” / placeholder-CTA’s | ✅ |
| Bedrijfsnaam consistent | ✅ Vierdaagse Logeren |
| Adres / telefoon / openingstijden | ➖ Online platform, geen bezoekadres |
| E-mail | ✅ `contact@vierdaagselogeren.nl` |
| Prijzen / diensten | ✅ Richtlijnen op listingpagina’s |
| Spelling / stijl / jaartallen | ✅/🟡 Spot-check |
| Afbeeldingen op juiste pagina | ✅ Logo/OG/favicon |
| Geen testlistings zichtbaar als echt contact | ✅ Voorbeeld-e-mails (`@voorbeeld-…`) worden **niet** getoond |

## 3. Navigatie

| Item | Status |
| --- | --- |
| Hoofdmenu + footer | ✅ |
| Mobiel menu | ✅ Hamburger-toggle in `BaseLayout` |
| Logo → home | ✅ |
| Belangrijke pagina’s bereikbaar | ✅ |

## 4. Calls-to-action

| Item | Status |
| --- | --- |
| Duidelijke CTA’s op kernpagina’s | ✅ |
| Contact / aanmelden getest | 🟡 Met echte Resend-keys |

## 5. Formulieren

| Item | Status |
| --- | --- |
| Contact + aanmeldformulieren | ✅ |
| Verplicht + e-mailvalidatie | ✅ Client + server (`isValidEmail`) |
| Honeypot spamfilter | ✅ |
| Succesmelding | ✅ |
| Privacytoestemming | ✅ Checkbox + servercheck |
| Bevestigingsmail naar bezoeker | ➖ Alleen interne notificatie via Resend |

## 6. E-mail

| Item | Status |
| --- | --- |
| Zakelijk adres + Resend | 🟡 |
| SPF / DKIM / DMARC | 🟡 Bij domein + Resend instellen |
| Reply-To op contactformulier | ✅ |

## 7–8. SEO

| Item | Status |
| --- | --- |
| Unieke title/description | ✅ Per pagina |
| Eén H1 | ✅ |
| Canonical + hreflang | ✅ |
| robots.txt + sitemap | ✅ (www) |
| 404 | ✅ |
| Structured data | ✅ `WebSite` + `Organization` JSON-LD; FAQ-schema op FAQ |
| Admin niet indexeerbaar | ✅ |

## 9. Social & branding

| Item | Status |
| --- | --- |
| Open Graph + Twitter cards | ✅ |
| OG-image | ✅ `/og-image.png` |
| Favicon + apple-touch-icon + manifest | ✅ |
| Preview-tools | 🟡 Facebook/LinkedIn/WhatsApp debugger |

## 10–12. Mobiel, browsers, performance

| Item | Status |
| --- | --- |
| Responsive + touch targets menu | ✅ |
| Prefers-reduced-motion | ✅ |
| Self-hosted fonts | ✅ |
| Lighthouse / CWV | 🟡 Na deploy meten |
| Moderne images | 🟡 Vooral SVG/PNG nu |

## 13. Toegankelijkheid

| Item | Status |
| --- | --- |
| Skip-link, labels, focus states | ✅ |
| Alt op logo | ✅ |
| Formulierfouten begrijpelijk | ✅ |

## 14–16. Privacy, juridisch, security

| Item | Status |
| --- | --- |
| Privacyverklaring | ✅ |
| Cookiebeleid / banner | ➖ N.v.t. (geen tracking) |
| Algemene voorwaarden / webshop | ➖ Geen webshop |
| Security headers | ✅ |
| Geen secrets in repo | ✅ `.env.example` only |
| Admin via GitHub OAuth | ✅ |

## 17–19. Back-ups, analytics, broken links

| Item | Status |
| --- | --- |
| Back-up = git + Vercel | 🟡 Herstelprocedure documenteren |
| Analytics / GTM / pixels | ➖ |
| Broken-link crawl | 🟡 |

## 20–25. 404, zoek, shop, accounts, integraties

| Item | Status |
| --- | --- |
| Custom 404 | ✅ |
| Zoekfunctie | ➖ |
| Webshop / accounts | ➖ |
| Integraties | ✅ Resend + Decap/GitHub |

## 26. Lokale SEO

| Item | Status |
| --- | --- |
| Google Business Profile | ➖ Geen fysieke winkel |
| Gebiedspagina’s | ✅ |
| LocalBusiness-schema | 🟡 Optioneel later per aanbieder |

## 27–28. Conversie & FAQ

| Item | Status |
| --- | --- |
| Duidelijke value proposition | ✅ |
| FAQ + FAQ-schema | ✅ |

## 29–31. Monitoring & nazorg

| Item | Status |
| --- | --- |
| Uptime / GSC / 404-monitor | 🟡 |
| Formulierinzendingen checken | 🟡 |
| Eerste week/maand reviews | 🟡 |

## Codewijzigingen in deze branch

- Canonical/`site` op **https://www.vierdaagselogeren.nl**
- `robots.txt`: www-sitemap + `Disallow: /admin`
- Security headers + `X-Robots-Tag` voor admin in `vercel.json`
- Mobiel navigatiemenu
- Organization/WebSite JSON-LD, betere `og:locale`
- Footer copyright + contactmail
- Privacy-consent op contact- en aanmeldformulieren
- Strictere e-mailvalidatie + privacycheck in API’s
- Voorbeeldlistings tonen geen nep-contactadressen meer

## Resterende handmatige stappen (eigenaar)

1. Vercel: Production env `RESEND_API_KEY`, `OWNER_EMAIL`, GitHub OAuth secrets
2. Resend: domein verifiëren (SPF/DKIM/DMARC)
3. Google Search Console: www-property + sitemap
4. Contactformulier één keer live versturen
5. Social-preview debuggers verversen
6. Lighthouse op home + camping + contact
7. Incognito + mobiel netwerk spot-check
