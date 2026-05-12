# Jofi Pet — Quiz LP de Qualificação de Leads

Landing page mobile-first com quiz interativo que qualifica tutores de pet em tiers (quente/morno/frio) e os roteia para WhatsApp humano, oferta Sereninho R$49,90 ou conteúdo educativo.

**Cliente:** Jofi Pet (via Double Check)
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui · Vercel · RD Station Marketing API
**Workflow AIOX:** `greenfield-ui`
**Status:** Phase 6 em execução — Story 1.1 (bootstrap) em validação

## Setup local

**Pré-requisitos:** Node.js 20+ (testado em 20 LTS e 25)

```bash
# na raiz deste projeto (projects/jofipet-quiz-lp/)
npm install
cp .env.example .env.local    # preencher as vars
npm run dev                   # localhost:3000
```

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Dev server com Turbopack em `localhost:3000` |
| `npm run build` | Build de produção |
| `npm start` | Roda build local |
| `npm run lint` | ESLint + `eslint-plugin-jsx-a11y` |
| `npm run lint:fix` | Autofix do ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (usado no CI) |
| `npm test` | Vitest watch |
| `npm run test:ci` | Vitest run + coverage |
| `npm run lhci` | Lighthouse CI local |

## Quality Gates (PR)

- **CI** (`.github/workflows/ci.yml`): lint + typecheck + format + test com coverage ≥70% em `src/**`
- **Lighthouse** (`.github/workflows/lighthouse.yml`): roda contra preview Vercel em cada PR
  - Performance mobile ≥85 · Accessibility ≥95 · Best Practices ≥90 · SEO ≥90
- Para ajustar barras LH, edite `lighthouserc.json`.

## Docs

- [Project Brief](docs/brief.md) — visão, problema, MVP, KPIs, riscos
- [PRD](docs/prd.md) — FRs/NFRs, 4 Epics, 16 stories
- [UX Spec](docs/front-end-spec.md) — wireframes, IA, user flows, tokens de design
- [Architecture](docs/architecture.md) — stack, structure, TS contracts, RD Station, KV queue, security
- [docs/stories/](docs/stories/) — 16 stories em Draft/InProgress
- [docs/qa/po-validation.md](docs/qa/po-validation.md) — PO master validation (GO 9/10)

## Contexto Jofi (referências no workspace)

- Skill cliente: `skills/clientes/jofipet-operacao.skill`
- Skill agência: `skills/agencia/dc-ofertas.skill`
- CRM: **RD Station Marketing** (ver memória `project_jofi_pet.md`)

## Delegações @devops (não-dev)

- `gh repo create` + primeiro push remoto
- `vercel link` + `vercel --prod`
- DNS CNAME `quiz.jofipet.com.br` → `cname.vercel-dns.com`
- GitHub branch protection (required status checks: CI + Lighthouse)
- Secrets do repo (`RD_STATION_TOKEN`, `TURNSTILE_SECRET_KEY`, `CRON_SECRET`, `HMAC_SECRET`, `ADMIN_*`)
- Conectar Vercel KV store

## Open Questions (ver [po-validation](docs/qa/po-validation.md))

Domínio final, token RD, número WhatsApp Jofi, URL Sereninho, cobertura CEP, paleta Jofi, payload RD custom fields. Nenhum bloqueia Epic 1 — resolvidos antes do merge das stories específicas.
