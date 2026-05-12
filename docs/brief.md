# Project Brief: Jofi Pet Quiz LP — Qualificação de Leads

**Status:** Draft v1.0
**Owner:** Pedro Portella (Double Check)
**Gerado por:** @analyst (via aiox-master), 2026-04-16
**Workflow:** greenfield-ui
**Inputs usados:** `skills/clientes/jofipet-operacao.skill`, `skills/agencia/dc-ofertas.skill`, padrões DC OS

---

## Executive Summary

**Produto:** Landing page mobile-first com quiz interativo de 6–8 perguntas que qualifica tutores de pet como leads **quentes / mornos / frios** para a Jofi Pet (planos de assinatura saúde pet) e roteia cada perfil para a ação de conversão mais provável (WhatsApp humano, oferta Sereninho R$49,90, ou nutrição).

**Problema que resolve:** Hoje as campanhas Meta Ads da Jofi mandam tráfego direto para WhatsApp de atendimento (`[JOFI] [MSG]`), sem qualificação prévia. Resultado: atendimento humano sobrecarregado com leads frios (curiosos sem pet, sem orçamento, fora de cobertura), enquanto leads quentes (tutor ansioso com pet adulto/idoso, insatisfeito com o status quo) competem por tempo de resposta.

**Mercado-alvo:** Tutores de cão/gato no Brasil com disposição a gastar R$50–R$200/mês com o pet, impactados por anúncios Meta da Jofi ou indicação (programa "Amigo + banho grátis").

**Proposta de valor:**
- Para a **Jofi:** Atendentes WhatsApp recebem apenas leads pré-qualificados com contexto (espécie, idade, gasto atual, urgência), elevando taxa de conversão lead→assinatura e liberando banda.
- Para o **tutor:** Quiz gamificado ("Que tipo de tutor você é?") entrega diagnóstico personalizado + oferta encaixada no perfil, em vez de "mais um formulário".

---

## Problem Statement

### Situação atual
- Campanhas Meta Ads ativas (`[JOFI] [MSG] [Novos criativos] [02]`, `[JOFI] [MSG] [WHAT] [Amigo + Banho grátis]`, `[JOFI] [RMKT +1%] [AD+]`, `[JOFI] [MSG] [Novos criativos] [01] [Pethaus]`) levam 100% do tráfego para o WhatsApp da Jofi.
- Não há filtro: curiosos, estudantes, pessoas sem pet e tutores fora da cobertura da rede parceira (Pethaus + veterinários) chegam ao mesmo atendimento que um decisor pronto para contratar.
- A editoria orgânica já testa engajamento via quiz ("Que tipo de tutor você é?") — há sinal de que o formato converte em atenção, mas nada está capturado para o CRM.

### Impacto
- **Custo por lead qualificado alto:** CPL bruto do Meta é baixo, mas o lead útil (que vira conversa e proposta) está diluído.
- **Tempo de atendente desperdiçado** em conversas que morrem no primeiro "qual o peso do seu pet?".
- **Sem dados para segmentação de RD Station:** hoje não entra nada no CRM com contexto estruturado (espécie, idade, gasto, urgência).
- **Remarketing cego:** RMKT roda sobre quem clicou, não sobre quem demonstrou intenção real via quiz.

### Por que soluções existentes falham
- Formulários estáticos (Typeform padrão) têm baixa taxa de conclusão em mobile com tráfego frio de Meta.
- Chatbots WhatsApp (ManyChat) são custosos e fogem do tom "acolhedor" da marca.
- LPs tradicionais de assinatura pet (concorrentes) pedem cartão de crédito antes de gerar vínculo.

### Urgência
- Campanhas `[Jofi Pet] - Campanhas Meta Ads - Abril.26` estão com status **"a fazer"** — oportunidade de lançar o quiz como destino dos novos criativos já neste ciclo.
- Alerta da skill: "CRM e automação pendente (Pedro)" — este projeto é o primeiro passo concreto de automação de CRM para Jofi.

---

## Proposed Solution

### Conceito
LP mobile-first Next.js hospedada em Vercel, com 3 seções:
1. **Hero** — headline emocional + CTA "Descobrir meu plano ideal"
2. **Quiz** — 6–8 perguntas com progress bar, transições suaves, micro-interações
3. **Resultado personalizado** — diagnóstico + recomendação + CTA específico por tier

### Lógica de qualificação (scoring)
Cada resposta pontua em 4 eixos (ajustável pós-MVP):
| Eixo | O que mede | Peso |
|---|---|---|
| Pet ativo | Tem pet? Espécie? | Eliminatório (sem pet → lead frio informativo) |
| Perfil de gasto | Gasto/mês atual + plano pet atual (sim/não) | Alto |
| Dor/urgência | Última ida ao vet + "o que te preocupa hoje?" | Alto |
| Cobertura | CEP/cidade (match com rede Pethaus+parceiros) | Médio |

Score final → classifica em:
- **🔥 Quente** — pet adulto/idoso, gasto >R$100/mês, sem plano, preocupação ativa, cobertura OK
- **🟡 Morno** — pet jovem saudável OU gasto médio OU cobertura parcial
- **🔵 Frio** — curioso, sem pet, fora de cobertura, ou já cliente Jofi

### Roteamento por tier
| Tier | Destino | Racional |
|---|---|---|
| Quente | WhatsApp atendente Jofi com mensagem pré-preenchida contendo nome+espécie+idade+urgência | Fila humana só recebe quem converte |
| Morno | Página oferta **Sereninho R$49,90** (produto de entrada já existente) + email nutrição | Ticket baixo destrava a primeira compra |
| Frio | Conteúdo educativo ("5 sinais que seu pet precisa de atenção") + opt-in newsletter | Longo prazo via email |

### Diferenciadores
- **Tom Jofi:** "tutores", linguagem simples, emojis pet (🐾 🐶 🐱 💛), zero jargão veterinário
- **Diagnóstico como recompensa:** ao invés de "cadastre-se para ver o plano", o quiz devolve análise personalizada antes de pedir dados
- **Captura progressiva:** telefone/email só na penúltima tela, com o contexto já formado (aumenta taxa de conclusão)
- **Tracking profundo:** cada pergunta dispara evento Meta/GA4, permite funil de abandono por pergunta

---

## Target Users

### Primary Segment: "Tutor Preocupado com Pet Adulto"
- **Perfil:** 28–55 anos, classe B/C, mora em cidade média/grande, cão ou gato de 3–12 anos
- **Comportamento atual:** Já levou o pet ao vet pelo menos 1x nos últimos 6 meses; paga avulso por consultas/exames (R$80–R$250/consulta); sente ansiedade com "e se der algo grave?"
- **Dor:** Cada visita ao vet é imprevista e dolorosa no orçamento
- **Meta:** Previsibilidade financeira + tranquilidade de ter quem chamar
- **Canal de descoberta:** Meta Ads (Instagram stories/feed), indicação de amigo

### Secondary Segment: "Tutor de Primeira Viagem"
- **Perfil:** 22–35 anos, adotou pet jovem (<2 anos) recentemente
- **Comportamento:** Pesquisa muito no Google/Instagram, compara preços, ainda não tem rotina vet consolidada
- **Dor:** Medo de fazer errado + orçamento apertado
- **Meta:** Entender o que é "normal" cuidar bem de um pet sem quebrar
- **Canal de descoberta:** Meta Ads "Amigo + Banho grátis" (indicação), orgânico educativo

---

## Goals & Success Metrics

### Business Objectives
- Reduzir em **≥40% o volume de leads frios** chegando ao WhatsApp humano em 60 dias pós-lançamento
- Atingir **taxa de conclusão do quiz ≥55%** (start→resultado) em tráfego Meta
- Gerar **≥30% dos leads mornos convertendo em Sereninho R$49,90** em 90 dias (produto de entrada)
- Criar base RD Station com **≥500 contatos qualificados e tagueados** nos primeiros 30 dias

### User Success Metrics
- Tempo médio de conclusão do quiz: 90s–180s
- Taxa de respostas "me identifico" no resultado (self-reported via pergunta opcional): ≥70%
- Taxa de clique no CTA do resultado: ≥60% (quente), ≥35% (morno)

### KPIs
- **CPL qualificado:** CPL Meta / % leads quentes+mornos — meta: reduzir 30% vs CPL bruto atual
- **Quiz completion rate:** starts / finishes — meta: 55%
- **Lead→Sereninho (morno):** opt-in → compra — meta: 30%
- **Lead→Atendimento efetivo (quente):** clique WhatsApp → conversa respondida pelo tutor — meta: 80%
- **Custo de manutenção:** <R$50/mês (Vercel hobby + RD Station já contratado)

---

## MVP Scope

### Core Features (Must Have)
- **Hero da LP:** Headline + sub + CTA + social proof (selo "+X tutores já usaram"), mobile-first
- **Engine de quiz:** Componente reutilizável com 6–8 perguntas configuráveis, progress bar, animações de transição, botão "voltar", resposta múltipla e única
- **Captura de lead:** Tela pré-resultado com nome + WhatsApp (obrigatório, com máscara BR) + email (opcional) + consent LGPD
- **Scoring engine:** Lógica client-side determinística (pesos configuráveis em JSON) que classifica em quente/morno/frio
- **Resultado personalizado:** Template dinâmico com nome do tutor, diagnóstico em 3 bullets, CTA específico por tier
- **Integração RD Station:** POST para `/platform/conversions` com identificador do evento, tags (`lead-quente`|`lead-morno`|`lead-frio`), payload completo das respostas em custom fields
- **Tracking:** Meta Pixel (PageView, ViewContent por pergunta, Lead no envio, InitiateCheckout no CTA), GA4 events, preservação de UTMs em todas as etapas
- **Roteamento final:** Redirect para wa.me com mensagem pré-preenchida (quente) / LP Sereninho (morno) / página educativa (frio)
- **Fallback offline:** Se RD Station API falhar, salva lead em queue (Supabase ou Vercel KV) e retenta
- **Admin mínimo:** Página protegida com lista dos últimos 100 leads + filtro por tier (feature flag, pode ser pós-MVP)

### Out of Scope for MVP
- A/B test nativo de variações de quiz (fazer via Meta Ads variants + UTMs primeiro)
- Integração WhatsApp Business API (usa wa.me direto no MVP)
- Painel de analytics customizado (usa GA4 + Meta Events Manager + RD dashboard)
- Multi-idioma (PT-BR only)
- Login/área do tutor
- Checkout embarcado (Sereninho redireciona para checkout existente da Jofi)
- Gamificação elaborada (ranking, badges)

### MVP Success Criteria
- Publicado em `quiz.jofipet.com.br` (ou subdomínio a definir) com HTTPS, PageSpeed mobile ≥85
- Processa 1000 leads/dia sem degradação
- 0 leads perdidos em janela de 7 dias (medição via log de queue)
- Pedro consegue ajustar pesos do scoring editando 1 arquivo JSON sem redeploy manual (via Vercel env ou commit → auto-deploy)

---

## Post-MVP Vision

### Phase 2 Features
- A/B test de variações de quiz via Vercel Edge Config
- Integração WhatsApp Business API (ao invés de wa.me) com primeira resposta automática contextualizada
- Quiz secundário pós-compra Sereninho → upsell para plano completo
- Retargeting Meta com públicos customizados por tier (quentes que não fecharam em 72h)

### Long-term Vision
Quiz como porta de entrada padrão de todas as campanhas pagas Jofi — substitui 100% dos destinos `[MSG]` atuais. Base RD Station vira ativo estratégico para lookalikes e nurture.

### Expansion Opportunities
- White-label do engine de quiz para outros clientes DC (Vitanuts, Doka, Dulce) — cada um com scoring próprio mas mesma base técnica
- Versão "indicação" do quiz: tutor atual convida amigo, ambos ganham benefício (amarra com programa "Amigo + banho grátis" já existente)

---

## Technical Considerations

### Platform Requirements
- **Target Platforms:** Web mobile-first (≥70% do tráfego Meta é mobile)
- **Browser/OS Support:** Safari iOS 15+, Chrome Android 100+, desktop evergreen
- **Performance Requirements:** LCP <2s (4G), CLS <0.1, TTI <3s, PageSpeed mobile ≥85

### Technology Preferences
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion (transições)
- **Backend:** Next.js API Routes (Edge Runtime) para proxy RD Station (proteção de token)
- **Database (opcional MVP):** Vercel KV ou Supabase (só para queue de fallback e admin)
- **Hosting/Infrastructure:** Vercel (preview por branch, domínio custom via DNS Jofi)

### Architecture Considerations
- **Repository Structure:** Monorepo leve Next.js (`projects/jofipet-quiz-lp/`) dentro do workspace AIOX; pode ser extraído para repo próprio GitHub no passo de deploy pelo @devops
- **Service Architecture:** Client-heavy (quiz é UX), único API route serverless como proxy RD Station (evita CORS + esconde token)
- **Integration Requirements:** RD Station Marketing API (eventos de conversão), Meta Pixel (standard events), GA4 (gtag), wa.me links
- **Security/Compliance:**
  - LGPD: consent explícito antes de submit, política de privacidade linkada
  - Token RD Station nunca no client — só em env var server-side
  - Rate limiting no API route (prevenir spam/abuse)
  - Captcha invisível (hCaptcha ou Cloudflare Turnstile) na submissão

---

## Constraints & Assumptions

### Constraints
- **Budget:** Custo mensal <R$50 (Vercel hobby + domínio já da Jofi + RD já contratado)
- **Timeline:** MVP ship em 2–3 semanas (alinhado ao ciclo "Campanhas Abril.26" a fazer)
- **Resources:** 1 dev (Gabriel ou externo), direção de arte DM para assets, copy PP
- **Technical:** Deve integrar com RD Station já contratado pela Jofi (nenhum novo CRM); Vercel preferido por stack familiar da agência

### Key Assumptions
- Jofi já tem conta RD Station ativa com permissão de criar tokens de API Marketing
- Cobertura da rede parceira (Pethaus + veterinários) tem dados estruturados por CEP/cidade — se não tiver, o eixo "cobertura" vira pergunta auto-declarada
- Produto Sereninho R$49,90 tem página de checkout própria e pública que pode receber redirect
- Atendimento WhatsApp humano tem capacidade para absorver leads quentes filtrados (premissa central do ROI)

---

## Risks & Open Questions

### Key Risks
- **Baixa taxa de conclusão do quiz:** Se ≤40%, o projeto não entrega ROI. **Mitigação:** prototipar 2 versões (6 vs 8 perguntas), A/B test desde semana 2
- **RD Station API rate limit:** Em picos de campanha, pode estourar. **Mitigação:** queue assíncrona + retry com backoff
- **Cobertura veterinária incompleta:** Se rede parceira é muito limitada geograficamente, muitos leads viram "frio por cobertura" injustamente. **Mitigação:** permitir cadastro mesmo sem cobertura + flag para expansão futura
- **LGPD/consent:** Captura de WhatsApp exige cuidado com opt-in explícito. **Mitigação:** texto claro + checkbox não pré-marcado + política de privacidade

### Open Questions
- Qual o token/endpoint exato do RD Station Marketing (instância Jofi)?
- Existe domínio/subdomínio reservado? (`quiz.jofipet.com.br`? `qualifica.jofipet.com.br`?)
- Quais os CEPs/cidades com cobertura confirmada da rede parceira?
- Pedro quer admin panel no MVP ou aceita só Meta/GA dashboards?
- Perguntas do quiz são aprovadas com cliente Jofi ou decisão interna DC?

### Areas Needing Further Research
- Benchmark de conclusão de quizzes em mobile-first para nicho pet BR (buscar cases Petlove, Petz, DogHero)
- Documentação oficial RD Station Marketing — endpoint de conversões e campos customizados
- Melhores práticas Meta Pixel + CAPI (server-side) para reduzir dependência de cookies 3rd-party

---

## Appendices

### A. Research Summary
- **Tom de voz Jofi (de `skills/clientes/jofipet-operacao.skill`):** próximo, acolhedor, leve; "tutores" (não "donos"); emojis 🐾 🐶 🐱 💛; sem jargão vet; foco em cuidado preventivo + economia
- **Editoria "Que tipo de tutor você é?"** já existe no calendário orgânico — premissa validada de que o formato engaja
- **Oferta de entrada Sereninho R$49,90** — produto já vivo, serve como destino de morno
- **Programa "Amigo + banho grátis"** — base para ramificação pós-MVP de quiz de indicação
- **Padrões dc-ofertas aplicáveis:** naming, tracking UTM, contingência de checkout

### B. Stakeholder Input
- Pedro (decisor): confirmou stack Next.js + Vercel + RD Station em 2026-04-16
- Paulo Portella (copy): a envolver em revisão de copy do quiz e headline da LP
- David Miranda (arte): a envolver em design/criação de assets pós-wireframes

### C. References
- Skill: `skills/clientes/jofipet-operacao.skill`
- Skill: `skills/agencia/dc-ofertas.skill`
- Memória: `project_jofi_pet.md` (Jofi usa RD Station)
- RD Station Marketing API: https://developers.rdstation.com/reference/post_platform-conversions

---

## Next Steps

### Immediate Actions
1. Validar com Pedro: domínio reservado, token RD Station, cobertura veterinária por CEP
2. @pm assume: gerar PRD detalhado com user stories, fluxo do quiz pergunta-por-pergunta, lógica de scoring em JSON, critérios de aceite por tela
3. @ux-design-expert: wireframes mobile-first (hero, cada tela de pergunta, captura, resultado por tier)
4. @architect: documento de arquitetura Next.js + contrato API RD Station + estratégia de tracking + fallback queue
5. @po: valida PRD + arquitetura, sharda em stories
6. @sm/@dev/@qa: ciclo de desenvolvimento
7. @devops: cria repo GitHub dedicado (se extrair do monorepo), configura Vercel project + DNS

### PM Handoff
Este Project Brief fornece o contexto completo para **Jofi Pet Quiz LP**. Próxima fase: **@pm assume em modo PRD Generation** e trabalha seção por seção do PRD, clarificando:
- Perguntas exatas do quiz (aprovadas com cliente ou propostas DC)
- Pesos finais do scoring
- Copy do resultado por tier
- Acceptance criteria por componente
