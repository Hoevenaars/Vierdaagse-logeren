# Agentregels

Fase 1 bevat geen autonome agents. De policy-laag bestaat al zodat fase 2 (Verification Agent) geen herbouw nodig heeft.

## Autonomie

1. Volledig autonoom: hashes, last_verified, sitemap, deterministische prijsberekening.
2. Autonoom met logging: prijs/beschikbaarheid/voorzieningen bij hoge confidence.
3. Altijd review: nieuwe provider, verwijderen, commercie, juridische content, prijsdelta > 40%, confidence < 0.70.

## Verboden

Agents mogen nooit prijzen, beschikbaarheid, reviews of ontbrekende voorzieningen verzinnen. Ontbrekende waarden zijn `null`.

## Confidence

- meta description ≥ 0.80
- prijs ≥ 0.95 plus bron-URL
- beschikbaarheid ≥ 0.95 plus bron-URL
- provider verwijderen: nooit autonoom

Zie `packages/mutation-policy`.
