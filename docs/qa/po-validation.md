# PO Master Validation — Jofi Pet Quiz LP

**Gerado por:** @po (via aiox-master), 2026-04-17
**Workflow:** greenfield-ui (Phase 5)
**Artefatos avaliados:** [brief.md](../brief.md), [prd.md](../prd.md), [front-end-spec.md](../front-end-spec.md), [architecture.md](../architecture.md)

---

## Veredito Global

**GO ✅** (score 9/10). Artefatos são consistentes, rastreáveis, e prontos para implementação. Único gap é resolver as 7 open questions registradas — 0 bloqueia o início do Epic 1; 5 precisam ser resolvidas antes do merge das stories que as dependem.

---

## Checklist (10 pontos)

### 1. Brief ↔ PRD: rastreabilidade de goals

✅ **Passa.** Todos os 6 goals do brief (Exec Summary, Problem, KPIs) reaparecem nos Goals do PRD §1. Métricas (≥55% completion, -40% leads frios, 500 contatos RD/30d, 30% morno→Sereninho) estão em ambos com os mesmos números.

### 2. PRD: FRs completos vs MVP Scope do brief

✅ **Passa.** MVP Scope do brief lista 10 core features. Contadas 21 FRs no PRD que cobrem todas: hero (FR1), quiz engine (FR2–6), scoring (FR7–8), captura (FR9–10), RD Station (FR11–13), resultado (FR14–16), tracking (FR17–18), segurança (FR19), A/B (FR20), admin (FR21). **Sem feature órfã** (FR sem base no brief) nem **feature faltante**.

### 3. PRD: NFRs cobrem constraints do brief

✅ **Passa.** Constraints do brief (budget <R$50, LCP <2s, WCAG AA, custo mensal, LGPD) mapeiam 1:1 em NFR1, NFR2, NFR4, NFR11, NFR10. **NFR13** (TypeScript strict) adicionado pelo PRD como constraint de dev — alinhado com `.aiox-core` standard.

### 4. PRD: Epics sequenciados corretamente

✅ **Passa.** Epic 1 entrega foundation **+ valor** (quiz navegável deployable). Tracking **não** está no final como cross-cutting — está foundational no Epic 1. Epic 2 entrega captura + integração. Epic 3 fecha funnel. Epic 4 é campaign-ready. Cada epic é deployable independentemente.

### 5. Stories: vertical slices e tamanho AI-agentes

⚠️ **Passa com observação.** 16 stories de ~4–7 AC cada. Tamanho adequado para "2–4h de dev junior". **Nota:** Story 2.3 (RD Station proxy) tem 8 AC e pode precisar ser observada pelo @sm no momento da execução — se exceder 4h, shard em 2.3a (happy path + mapping) + 2.3b (rate limit + turnstile + logging). Não altero agora pois depende de execução real.

### 6. UX Spec ↔ PRD: telas e componentes

✅ **Passa.** UX lista 9 telas que cobrem todos os fluxos do PRD. 8 componentes core especificados mapeiam 1:1 com necessidades do PRD (Button, QuizOption, ProgressBar, Input, Checkbox, Toast, Card, Modal). Wireframes ASCII suficientes para DM gerar Figma sem ambiguidade.

### 7. Architecture ↔ PRD: decisões técnicas justificadas

✅ **Passa.** Stack do PRD §4 (Next.js 14 + TS + Tailwind + shadcn + RHF + Zod + Vercel KV + Turnstile) aparece intacto na Architecture §2. Cada escolha tem rationale. **Sem invenção** de libs não mencionadas (ex.: Zustand foi rejeitado; useReducer+Context cobre — alinhado com critical rule 1 do Constitution AIOX).

### 8. Architecture: contratos executáveis

✅ **Passa.** Zod schema `LeadPayloadSchema` é implementável direto. Mapper RD Station gera payload válido do RD Marketing API. API route `/api/leads` está completo — um dev consegue copiar como boilerplate da Story 2.3. Schema dos 4 config JSONs permite ao dev popular `/config` sem consultar mais ninguém.

### 9. A11y + Performance: gate automatizado

✅ **Passa.** Story 4.4 cria Lighthouse CI como **required status check** com barras explícitas (perf 85, a11y 95). ESLint `jsx-a11y` configurado. Axe em dev. Lint bloqueia `console.log` em prod. Barras estão em §7 (UX) e §9 (Architecture) consistentes.

### 10. LGPD/Segurança: coverage

✅ **Passa.** PRD FR19 (captcha), NFR6 (token server-only), NFR10 (LGPD). Architecture §14 detalha: rate limit, Turnstile, HMAC opt-out, security headers, CSP. Story 4.3 implementa política + cookie banner + opt-out funcional. **Cobertura completa.**

---

## Open Questions (não bloqueantes, registradas)

| # | Questão | Bloqueia | Resolver antes de |
|---|---|---|---|
| 1 | RD Station API token vs OAuth2 | Story 2.3 | merge 2.3 |
| 2 | Payload RD aceita custom fields sem config prévio? | Story 2.3 | merge 2.3 |
| 3 | Número WhatsApp Jofi + copy aprovada | Story 3.2 | merge 3.2 |
| 4 | URL exata Sereninho | Story 3.3 | merge 3.3 |
| 5 | CEPs/cidades cobertura rede parceira | Story 1.3 | merge 1.3 |
| 6 | Domínio final (`quiz.` vs `qualifica.`) | Story 1.1 | deploy 1.1 |
| 7 | Paleta/tipografia final confirmada por DM | Story 1.1 | Epic 1 merge |

---

## Riscos Residuais

1. **Taxa de conclusão do quiz <40%** — risco de ROI. Mitigado por Story 4.1 (funil de abandono) que permite iterar.
2. **RD Station rate limit em picos** — mitigado por Story 2.4 (queue + retry).
3. **Cobertura geográfica ruim** — mitigado por scoring ajustável (cep skipped → score neutro 5, config em `scoring.json`).

## Próximos Passos

1. Shard do PRD em 16 arquivos de story individuais em `docs/stories/` (executado em conjunto com este doc)
2. @sm pega `1.1.bootstrap-next-vercel.md` como primeira story ativa
3. @dev implementa em YOLO mode (preferência Pedro)
4. @qa gate story-a-story conforme `.claude/rules/story-lifecycle.md`
5. @devops cria repo GitHub + Vercel project (parte da Story 1.1, via delegação)

## Handoff para @sm

```
@sm ative. As 16 stories estão em docs/stories/ prontas para draft status.
Ordem de execução: 1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 3.2 → 3.3 → 3.4 → 4.1 → 4.2 → 4.3 → 4.4.
Dependências rígidas: 1.2 depende de 1.1; 2.2 depende de 2.1; 2.3 depende de 2.2 + 1.3; 2.4 depende de 2.3;
3.x dependem de 2.3; 4.1 depende de 1.4; 4.2 depende de 2.4; 4.4 fecha Epic 4.
Modo sugerido: Pre-Flight (validar AC + Dev Notes antes de começar cada story).
```
