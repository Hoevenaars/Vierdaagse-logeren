# Datamodel

Single source of truth: Supabase (schema klaar). Fase 1 seedt 18 Vierdaagsecampings in TypeScript met hetzelfde model.

## Publieke tabellen

- `providers` — camping / tijdelijke camping / glamping / klein wandelverblijf
- `accommodation_types` — tent, caravan, camper, ingerichte tent, …
- `pricing_rules` — week, nacht, persoon, standplaats, arrangement
- `amenities` + `provider_amenities` — gestandaardiseerde voorzieningen met bron en confidence
- `availability` — available / limited / sold_out / not_open_yet / unknown

## Agent-klare tabellen (nog zonder autonome writers)

- `source_snapshots`
- `agent_runs`
- `change_log`
- `review_queue`

## Conversie

- `leads`
- `user_searches`
- `booking_alerts` — seintje bij openings van 2027-boekingen
- `tracking_events` — impression, result click, provider view, outbound click, lead

Prijzen en afstand worden nooit uit marketingtekst gehaald: de frontend toont alleen genormaliseerde velden plus een deterministisch berekend totaal.
