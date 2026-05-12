# Jofi Pet Quiz LP Product Requirements Document (PRD)

**Status:** Draft v1.0
**Source Brief:** [docs/brief.md](brief.md)
**Gerado por:** @pm (via aiox-master), 2026-04-16
**Workflow:** greenfield-ui (Phase 2)

---

## 1. Goals and Background Context

### Goals

- Entregar LP mobile-first com quiz interativo que qualifica leads Jofi Pet em 3 tiers (quente / morno / frio)
- Reduzir em ≥40% o volume de leads frios chegando ao WhatsApp humano em 60 dias
- Atingir taxa de conclusão do quiz ≥55% em tráfego pago Meta
- Gerar ≥500 contatos estruturados no RD Station Marketing em 30 dias pós-lançamento
- Converter ≥30% dos leads mornos em Sereninho R$49,90 em 90 dias
- Ship MVP em 2–3 semanas, alinhado ao ciclo "Campanhas Abril.26"
- Criar base reutilizável (quiz engine) para aplicar em outros clientes DC no Phase 2

### Background Context

Hoje todas as campanhas Meta Ads Jofi (`[JOFI] [MSG] [*]`) direcionam tráfego diretamente ao WhatsApp de atendimento, sem qualquer filtro. O atendente humano dissipa tempo em conversas com curiosos, pessoas sem pet, ou tutores fora da cobertura da rede veterinária parceira (Pethaus + rede), enquanto leads genuinamente prontos para assinar esperam. A editoria orgânica "Que tipo de tutor você é?" já demonstra engajamento para o formato quiz — este PRD transforma esse sinal em motor de qualificação paga.

A solução é uma LP Next.js com quiz que pontua o lead em 4 eixos (pet ativo, perfil de gasto, dor/urgência, cobertura geográfica), integra com RD Station Marketing (CRM oficial da Jofi — confirmado 2026-04-16, **não é Martz**), e roteia cada tier para o destino de maior probabilidade de conversão: WhatsApp humano (quente), oferta Sereninho R$49,90 (morno), nutrição educativa (frio).

### Change Log

| Date | Version | Description | Author |
|---|---|---|---|
| 2026-04-16 | 1.0 | Initial PRD draft from brief | @pm (aiox-master) |

---

## 2. Requirements

### Functional (FR)

- **FR1:** A LP deve exibir um hero mobile-first com headline, subheadline, selo de social proof e CTA primário "Descobrir meu plano ideal" que inicia o quiz.
- **FR2:** O quiz deve apresentar 6 a 8 perguntas configuráveis via arquivo JSON (`config/quiz.json`) — sem hardcode no componente.
- **FR3:** O quiz deve suportar tipos de pergunta: single-choice (radio), multiple-choice (checkbox), scale (1–5), input livre curto (ex.: CEP).
- **FR4:** Uma progress bar deve indicar a pergunta atual de N, atualizada a cada avanço.
- **FR5:** O tutor deve poder navegar para trás sem perder respostas já dadas dentro da sessão.
- **FR6:** A primeira pergunta é eliminatória ("Você tem pet?"): resposta "Não" deve pular direto para tela final de agradecimento informativo (sem pedir captura).
- **FR7:** O scoring deve aplicar pesos configuráveis (JSON) sobre as respostas em 4 eixos (pet ativo, gasto, dor/urgência, cobertura) e classificar o resultado como `quente`, `morno`, ou `frio`.
- **FR8:** A lógica de scoring deve ser 100% determinística e executar client-side (sem chamada de rede).
- **FR9:** Uma tela de captura antes do resultado deve coletar: nome (obrigatório), WhatsApp com máscara BR (obrigatório), email (opcional), consent LGPD (checkbox não pré-marcado, obrigatório).
- **FR10:** O WhatsApp deve ser validado em formato (DDD + 9 dígitos) antes de permitir submit.
- **FR11:** A captura deve ser submetida para um API route `/api/leads` que atua como proxy seguro do RD Station Marketing (token server-side).
- **FR12:** A submissão ao RD Station deve enviar payload incluindo: email, nome, telefone, tag `lead-{tier}`, e campos customizados com todas as respostas do quiz + UTMs.
- **FR13:** Se a API do RD Station falhar, o lead deve ser persistido em queue (Vercel KV) e re-enviado por cron serverless a cada 5 minutos (retry exponencial até 12h).
- **FR14:** A tela de resultado deve renderizar um diagnóstico personalizado em 3 bullets referenciando as respostas do tutor + nome do pet + espécie.
- **FR15:** Cada tier tem CTA distinto: quente → `https://wa.me/55{numero-jofi}?text={mensagem-preenchida-com-nome-pet-urgencia}`, morno → página de checkout Sereninho, frio → página de conteúdo educativo + opt-in newsletter.
- **FR16:** Todas as UTMs presentes na URL inicial devem ser preservadas e passadas para o destino final de redirect.
- **FR17:** Meta Pixel deve disparar eventos `PageView` (hero), `ViewContent` (cada pergunta), `Lead` (submit captura), `InitiateCheckout` (clique no CTA do resultado).
- **FR18:** GA4 deve disparar eventos equivalentes via `gtag`, com labels identificáveis no Debug View.
- **FR19:** Um captcha invisível (Cloudflare Turnstile) deve proteger a submissão contra spam.
- **FR20:** A LP deve suportar um rastreio opcional por parâmetro `?variant=A|B` para permitir A/B test via Meta Ads.
- **FR21:** Uma página `/admin` protegida por senha (env var) deve listar os últimos 100 leads com filtro por tier (MVP mínimo).

### Non Functional (NFR)

- **NFR1:** LCP mobile <2s em 4G (Lighthouse), CLS <0.1, TTI <3s.
- **NFR2:** PageSpeed Insights mobile score ≥85.
- **NFR3:** A LP deve funcionar em Safari iOS 15+, Chrome Android 100+, Chrome/Edge/Firefox desktop evergreen.
- **NFR4:** Acessibilidade WCAG AA (contraste, navegação teclado, aria-labels nos inputs do quiz).
- **NFR5:** Bundle JS inicial <150KB (gzip) na rota do quiz.
- **NFR6:** Todas as chamadas ao RD Station devem ocorrer via API route server-side — token nunca exposto ao client.
- **NFR7:** Rate limiting de 10 submissões por IP / 10 minutos no API route de captura.
- **NFR8:** Logs de erro de integração RD Station devem ser capturados (Vercel logs) com correlation ID retornado ao client.
- **NFR9:** Deploy automático na Vercel a cada push em `main`; preview deployment por branch.
- **NFR10:** Conformidade LGPD: consent explícito + política de privacidade linkada + endpoint de opt-out disponível.
- **NFR11:** Custo mensal total do projeto <R$50 (Vercel hobby/pro individual + domínio já pago pela Jofi).
- **NFR12:** Queue de fallback (Vercel KV) não deve perder leads por janela de 7 dias — medido via telemetria.
- **NFR13:** Código deve passar em ESLint + Prettier + TypeScript strict mode sem warnings ignorados.

---

## 3. User Interface Design Goals

### Overall UX Vision

Experiência de quiz **rápida, gamificada e acolhedora** — inspirada em Typeform/BuzzFeed mas com identidade Jofi (tom acolhedor, linguagem simples, emojis pet 🐾). O tutor deve sentir que está **recebendo algo** (diagnóstico personalizado) antes de ser convidado a **dar algo** (contato). Cada transição entre perguntas é suave (framer-motion), com feedback visual imediato à seleção da resposta.

### Key Interaction Paradigms

- **One question per screen** — foco total, sem scroll
- **Auto-advance em single-choice** — tocou → vai para próxima (com 200ms de delay para feedback visual)
- **Multi-choice e scale exigem botão "Próxima"** — evita avanço acidental
- **Swipe horizontal ou botão "Voltar"** — retorna sem perder contexto
- **Progress bar sempre visível** no topo — expectativa de esforço
- **Haptic feedback em mobile** (vibração curta na seleção) quando suportado
- **Input de telefone com máscara BR ao digitar** — reduz erro de formato
- **Mensagens de erro inline e gentis** — nunca modais bloqueantes

### Core Screens and Views

1. **Hero / Landing** — headline, sub, selo de social proof, CTA primário
2. **Tela de pergunta (N variantes)** — 6–8 telas dinâmicas, uma por pergunta
3. **Tela de captura** — nome, WhatsApp, email, consent LGPD
4. **Tela de resultado — Quente** — diagnóstico + CTA WhatsApp
5. **Tela de resultado — Morno** — diagnóstico + CTA Sereninho
6. **Tela de resultado — Frio** — diagnóstico educativo + newsletter opt-in
7. **Tela de agradecimento (sem pet)** — para quem respondeu "não tenho pet"
8. **Página `/privacidade`** — política de privacidade LGPD
9. **Página `/admin`** — lista de leads (protegida)

### Accessibility: WCAG AA

- Contraste mínimo 4.5:1 em texto regular, 3:1 em texto grande
- Todos os inputs com label associada (aria-label onde o visual dispensa label textual)
- Navegação por teclado completa (Tab, Enter, Esc)
- Foco visível em todos os elementos interativos
- Screen reader announcements para mudança de progresso do quiz

### Branding

- **Paleta Jofi** — definir com DM (direção de arte) na Phase 3 baseado no manual de marca atual
- **Tipografia** — adequada ao tom acolhedor (sans-serif arredondada, ex.: Nunito, Poppins)
- **Emojis pet** 🐾 🐶 🐱 💛 usados em headings e micro-momentos
- **Ilustrações** — pets amigáveis, flat/minimal, sem fotos de banco de imagens genéricas
- **Tom dos textos** — "tutores" (não "donos"), sem jargão veterinário, direto e leve
- **Micro-copy** nas perguntas deve usar linguagem coloquial: "Qual a espécie do seu pequeno?" ao invés de "Indique a espécie do animal"

### Target Device and Platforms: Web Responsive (mobile-first)

Mobile-first hard. Desktop funcional mas não otimizado. Target primário: Safari iOS + Chrome Android (≥70% do tráfego Meta).

---

## 4. Technical Assumptions

### Repository Structure: Monorepo (subpasta do workspace AIOX)

Código vive em `projects/jofipet-quiz-lp/` dentro deste workspace AIOX. Pode ser extraído para repo GitHub próprio pelo @devops no passo de deploy (recomendado para isolar ciclo de vida e simplificar Vercel Git integration).

### Service Architecture

**Serverless monolito Next.js** — páginas estáticas + SSR + API Routes (Edge Runtime preferencialmente). Sem backend separado. Integrações externas via API Routes que atuam como proxies seguros (RD Station).

### Testing Requirements

**Unit + Integration** (sem E2E no MVP para preservar velocidade):

- **Unit:** Vitest + React Testing Library para componentes do quiz, scoring engine, máscaras, validações
- **Integration:** Mocks de API Routes com MSW para testar fluxo captura → RD Station (happy path + fallback)
- **Manual QA:** Checklist em `docs/qa/manual-checklist.md` cobrindo device matrix (iOS Safari, Android Chrome, desktop)
- **Lighthouse CI** no PR: barra mínima LCP <2s, a11y ≥95, PWA best practices ≥90
- E2E (Playwright) **pós-MVP** quando volume justificar

### Additional Technical Assumptions and Requests

- **Framework:** Next.js 14 (App Router), TypeScript strict mode
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste, não package) + Framer Motion para transições
- **Forms/validation:** React Hook Form + Zod
- **Mask:** `react-imask` ou `use-mask-input` para WhatsApp BR
- **Hosting:** Vercel (hobby ou pro individual)
- **Queue fallback:** Vercel KV (Redis serverless) — inclui em qualquer tier Vercel
- **Captcha:** Cloudflare Turnstile (gratuito, sem friction visual)
- **Analytics:** Meta Pixel direto (sem GTM no MVP para reduzir peso); GA4 via `@next/third-parties/google`
- **RD Station API:** endpoint `/platform/conversions` (Marketing), autenticação via `client_id` + `client_secret` OAuth2 ou API token (a confirmar com Jofi)
- **Content JSON:** quiz + scoring config em `config/quiz.json` e `config/scoring.json` versionados no repo — editáveis sem alterar código
- **Feature flags:** via env vars na Vercel (ex.: `ADMIN_PANEL_ENABLED`)
- **Monitoring:** Vercel Analytics (performance) + Sentry (erros JS + API) — Sentry já está em `.env.example` do workspace
- **Domínio:** sugerir `quiz.jofipet.com.br` a Pedro; fallback `qualifica.jofipet.com.br`
- **i18n:** PT-BR only, sem biblioteca de i18n

---

## 5. Epic List

1. **Epic 1: Foundation, Quiz Engine & Tracking Base** — Setup Next.js + Vercel + canary deploy; constrói quiz engine configurável (JSON-driven), scoring engine determinístico, e base de tracking (Meta Pixel + GA4 PageView).
2. **Epic 2: Lead Capture & RD Station Integration** — Hero da LP + captura com LGPD + máscara BR + captcha; API route serverless proxy para RD Station Marketing; fallback queue com retry.
3. **Epic 3: Personalized Results & Routing** — Tela de resultado dinâmica por tier com diagnóstico personalizado; roteamento para WhatsApp pré-preenchido (quente), Sereninho (morno), e educativo (frio); preservação de UTMs.
4. **Epic 4: Campaign Readiness & Admin** — Eventos granulares por pergunta (funil de abandono); `Lead` e `InitiateCheckout` conversions completos; página `/admin` mínima com lista de leads; política de privacidade; Lighthouse CI no PR.

---

## 6. Epic Details

### Epic 1: Foundation, Quiz Engine & Tracking Base

**Goal:** Estabelecer a infraestrutura do projeto (Next.js + Vercel + CI/CD mínimo), entregar o motor de quiz reutilizável (perguntas + navegação + progress), o engine de scoring determinístico, e tracking base (PageView + eventos por pergunta). Ao final, é possível deployar uma versão navegável do quiz que não captura lead ainda mas já tem scoring calculado em console + eventos disparando em Meta/GA4.

#### Story 1.1: Bootstrap Next.js + Vercel + canary

**As a** dev,
**I want** inicializar o projeto Next.js 14 com TypeScript e deployar em Vercel com uma canary page,
**so that** há base funcional com CI/CD automático para acelerar iterações.

**Acceptance Criteria:**
1. `projects/jofipet-quiz-lp/` contém projeto Next.js 14 App Router + TypeScript strict + Tailwind + ESLint + Prettier
2. `/` renderiza canary page com headline "Jofi Pet Quiz — em construção" e timestamp de build
3. Deploy Vercel funciona via git push; preview deployment por branch habilitado
4. Domínio custom (`quiz.jofipet.com.br` ou placeholder Vercel) acessível com HTTPS
5. Lighthouse CI configurado em `.github/workflows/` com barras: a11y ≥95, perf mobile ≥85
6. README do projeto documenta setup local e scripts disponíveis (`dev`, `build`, `lint`, `test`)

#### Story 1.2: Quiz engine configurável (JSON-driven)

**As a** tutor de pet,
**I want** responder perguntas encadeadas com progress visível e poder voltar,
**so that** consigo completar o quiz sem frustração ou medo de perder respostas.

**Acceptance Criteria:**
1. Componente `<Quiz>` lê `config/quiz.json` e renderiza dinamicamente 6–8 perguntas
2. Suporta tipos: `single-choice`, `multi-choice`, `scale`, `text-input`
3. Progress bar fixa no topo mostra "pergunta N de M"
4. Botão "Voltar" preserva respostas anteriores dentro da sessão (state em React)
5. Single-choice auto-avança 200ms após seleção; demais tipos exigem botão "Próxima"
6. Primeira pergunta `pet-ativo` é eliminatória: resposta "Não" redireciona para rota `/obrigado-sem-pet`
7. Transições entre perguntas usam Framer Motion (fade + slide, 250ms)
8. State do quiz persiste em `sessionStorage` para resistir a reload acidental (não em localStorage — evitar contaminação cross-sessão)

#### Story 1.3: Scoring engine determinístico

**As a** Pedro (decisor),
**I want** poder ajustar pesos e regras de scoring editando um único JSON,
**so that** posso iterar o modelo sem redeploy de código.

**Acceptance Criteria:**
1. `config/scoring.json` define pesos por pergunta/resposta em 4 eixos (pet_ativo, gasto, dor, cobertura)
2. Função pura `calculateTier(answers, config)` retorna `{ tier: 'quente'|'morno'|'frio', score: number, breakdown: {...} }`
3. Thresholds de classificação configuráveis no JSON (ex.: `quente >= 70`, `morno 40–69`, `frio < 40`)
4. Testes unitários (Vitest) cobrem: respostas perfeitas → quente, médias → morno, mínimas → frio, eliminação por "sem pet"
5. `calculateTier` executa 100% client-side, sem fetch
6. Breakdown por eixo disponível no resultado final para debugging e para renderização do diagnóstico personalizado

#### Story 1.4: Tracking base — Meta Pixel + GA4

**As a** Pedro (decisor),
**I want** ver eventos PageView e ViewContent disparando em Meta Events Manager e GA4,
**so that** posso confirmar que a LP está instrumentada antes de começar a investir em tráfego.

**Acceptance Criteria:**
1. Meta Pixel instalado no `layout.tsx` raiz com ID em env var `NEXT_PUBLIC_META_PIXEL_ID`
2. GA4 instalado via `@next/third-parties/google` com ID em env var `NEXT_PUBLIC_GA_ID`
3. `PageView` dispara automaticamente em toda navegação
4. Cada avanço de pergunta dispara `ViewContent` com parâmetro `content_name: 'quiz_question_N'`
5. UTMs presentes na URL são capturadas e armazenadas em `sessionStorage` ao entrar na LP
6. Debug View do GA4 e Test Events do Meta confirmam eventos em preview deployment

---

### Epic 2: Lead Capture & RD Station Integration

**Goal:** Entregar o funil de captura completo: hero da LP com entrada do quiz, tela de captura com validações BR e LGPD, API route serverless que envia conversão ao RD Station Marketing com tags por tier, e queue de fallback que garante zero leads perdidos mesmo sob falha da API externa. Ao final do epic, um lead completa o quiz, informa dados, e aparece no RD Station com tags e campos customizados — mas ainda não vê resultado personalizado (isso vem no Epic 3).

#### Story 2.1: Hero + entrada do quiz

**As a** tutor visitando a LP vinda de anúncio Meta,
**I want** entender em 3 segundos o que a página oferece e iniciar o quiz com um toque,
**so that** decido continuar ou abandonar sem fricção.

**Acceptance Criteria:**
1. Hero renderiza headline, subheadline, selo de social proof ("+X tutores já descobriram"), e CTA primário
2. CTA "Descobrir meu plano ideal" inicia o quiz (transição suave para a primeira pergunta)
3. Hero carrega em <1s em 4G (critical CSS inline, imagens otimizadas com `next/image`)
4. Copy do hero extraído de `config/content.json` (editável sem deploy de código)
5. UTMs são preservadas no state global do quiz ao iniciar
6. Mobile Safari e Chrome Android renderizam sem shift de layout (CLS <0.05 na fold)

#### Story 2.2: Tela de captura com validação BR e LGPD

**As a** tutor que completou o quiz,
**I want** informar meus dados em um formulário simples e confiável,
**so that** recebo meu resultado personalizado e posso ser contatado.

**Acceptance Criteria:**
1. Formulário com campos: nome (obrigatório, mín 2 chars), WhatsApp (obrigatório, máscara `(XX) XXXXX-XXXX`), email (opcional, validado se preenchido), consent LGPD (checkbox obrigatório, não pré-marcado)
2. Validação inline com mensagens em PT-BR acolhedoras (ex.: "Ops, o WhatsApp parece incompleto 🐾")
3. Botão de submit desabilitado até todas as validações passarem
4. Cloudflare Turnstile invisível integrado ao submit
5. Sem dados = sem submit; LGPD desmarcado = submit bloqueado com tooltip explicativo
6. Link "Política de privacidade" abre `/privacidade` em nova aba
7. Após submit bem-sucedido, transição para rota de resultado (`/resultado/{tier}` ou similar)
8. React Hook Form + Zod para schema de validação

#### Story 2.3: API route proxy RD Station Marketing

**As a** Pedro (decisor),
**I want** que cada lead capturado apareça no RD Station com tag do tier e todas as respostas do quiz como campos customizados,
**so that** consigo segmentar automações e usar os dados em lookalikes Meta.

**Acceptance Criteria:**
1. Endpoint `POST /api/leads` recebe payload `{ name, whatsapp, email?, consent, tier, answers, utms, turnstile_token }`
2. Valida Turnstile token server-side; rejeita se inválido
3. Rate limit 10 req/IP/10min usando Vercel KV como counter
4. Chama RD Station Marketing `/platform/conversions` com: `event_type: CONVERSION`, `event_family: CDP`, `payload: { conversion_identifier: 'jofipet-quiz-{tier}', email, name, mobile_phone, tags: [`lead-{tier}`, `quiz-jofipet`], custom_fields: {...answers, ...utms, score_breakdown } }`
5. Token RD Station lido de env var server-side `RD_STATION_TOKEN` — nunca exposto
6. Retorna `{ success: true, leadId, correlationId }` em 200 ou `{ success: false, reason, correlationId }` em 4xx/5xx
7. Logs estruturados em Vercel (JSON) com correlationId para rastreamento
8. Mocks MSW cobrem happy path + falha 500 em testes de integração

#### Story 2.4: Fallback queue + retry worker

**As a** Pedro (decisor),
**I want** garantia de que nenhum lead é perdido mesmo se o RD Station ficar fora,
**so that** o investimento em tráfego pago nunca é desperdiçado por instabilidade de terceiros.

**Acceptance Criteria:**
1. Se chamada ao RD Station falhar com 5xx ou timeout (5s), lead é salvo em Vercel KV com chave `queue:lead:{leadId}` e TTL de 7 dias
2. Response ao client continua retornando `{ success: true, queued: true, correlationId }` — usuário não percebe falha
3. Cron serverless `/api/cron/retry-leads` executa a cada 5 minutos (Vercel Cron)
4. Worker itera todos os leads em queue, tenta re-submit com backoff exponencial (máx 6 tentativas por lead)
5. Sucesso → remove da queue; 6 falhas → move para `queue:dead:{leadId}` + alerta via Sentry
6. Endpoint `/api/admin/queue-stats` (protegido por senha env) retorna contadores: active, dead, last24h_processed
7. Teste de integração simula falha RD Station → confirma entrada em queue → simula worker bem-sucedido → confirma submit

---

### Epic 3: Personalized Results & Routing

**Goal:** Fechar o loop de conversão do MVP. Cada tier recebe uma tela de resultado personalizada referenciando suas próprias respostas, nome do pet, e espécie; em seguida é roteado para o destino de maior conversão (WhatsApp pré-preenchido com contexto para quentes, checkout Sereninho para mornos, nutrição educativa para frios). Todas as UTMs iniciais são preservadas no redirect final.

#### Story 3.1: Tela de resultado — estrutura + diagnóstico dinâmico

**As a** tutor que completou o quiz,
**I want** ver um diagnóstico que reflita o que respondi e inclua o nome do meu pet,
**so that** sinto que foi feito para mim e não é mais um resultado genérico.

**Acceptance Criteria:**
1. Rota `/resultado` lê tier + answers + leadId do state (ou query params fallback)
2. Template por tier em `config/results.json` com placeholders `{pet_name}`, `{pet_species}`, `{top_concern}`, `{monthly_spend}`
3. Render inclui headline customizado + 3 bullets de diagnóstico + CTA do tier
4. Se tier = `quente` → ilustração 🔥 + copy de urgência; `morno` → ilustração 🟡 + copy de economia; `frio` → ilustração 🔵 + copy educativa
5. Fallback gracioso se respostas específicas não foram dadas (template sem placeholder quebrado)
6. Evento Meta Pixel `InitiateCheckout` dispara ao renderizar resultado com tier quente ou morno; `ViewContent` para frio

#### Story 3.2: Roteamento quente — WhatsApp pré-preenchido

**As a** tutor classificado como quente,
**I want** ir direto para uma conversa WhatsApp com a Jofi, já com meu contexto escrito,
**so that** não preciso repetir informações e o atendente entende minha situação em segundos.

**Acceptance Criteria:**
1. CTA "Falar com a Jofi agora" gera URL `https://wa.me/55{JOFI_WHATSAPP}?text={encoded_message}`
2. Mensagem template configurável em `config/messages.json`, com placeholders substituídos: nome do tutor, nome do pet, espécie, principal preocupação, UTM source
3. Número do atendimento Jofi em env var `NEXT_PUBLIC_JOFI_WHATSAPP` (formato E.164 sem "+")
4. Clique abre WhatsApp em nova aba/app; mantém LP aberta com tela de "te esperamos na conversa 🐾"
5. Evento `Lead` do Meta Pixel dispara no clique do CTA (além do `Lead` já disparado na captura)
6. UTMs iniciais são incluídas no texto da mensagem para atendente saber origem

#### Story 3.3: Roteamento morno — Sereninho R$49,90

**As a** tutor classificado como morno,
**I want** conhecer o Sereninho como primeira experiência com a Jofi por um ticket acessível,
**so that** posso testar o serviço antes de assinar um plano maior.

**Acceptance Criteria:**
1. CTA "Conhecer o Sereninho por R$49,90" redireciona para URL de checkout existente da Jofi
2. URL do checkout em env var `NEXT_PUBLIC_SERENINHO_CHECKOUT_URL`
3. UTMs originais + `utm_content=quiz-morno` são adicionadas à URL do checkout
4. Evento `InitiateCheckout` Meta Pixel dispara no clique
5. Fallback se checkout URL não configurada → mostra mensagem "em breve" + opt-in de email
6. Página de resultado morno também exibe link secundário "ou receba dicas por email" que adiciona tag `newsletter-jofi` no RD Station (fire and forget)

#### Story 3.4: Roteamento frio — conteúdo educativo + newsletter

**As a** tutor classificado como frio,
**I want** receber conteúdo útil mesmo não sendo prioritário agora,
**so that** a Jofi constrói relacionamento comigo para quando eu precisar no futuro.

**Acceptance Criteria:**
1. Tela de resultado frio exibe 3 artigos/posts educativos (título + link + thumb) configurados em `config/content.json`
2. CTA secundário "Receber o guia da Jofi por email" adiciona tag `newsletter-jofi` ao lead no RD Station (novo conversion_identifier `jofipet-newsletter`)
3. Se tutor respondeu "sem pet", rota `/obrigado-sem-pet` mostra conteúdo genérico + CTA para compartilhar com amigo que tenha pet
4. Todos os links externos abrem em nova aba com `rel="noopener"`
5. UTMs preservadas nos links de conteúdo para atribuição correta

---

### Epic 4: Campaign Readiness & Admin

**Goal:** Preparar o MVP para receber tráfego pago de verdade: eventos granulares suficientes para construir funil de abandono no Meta/GA4, conversions configuradas corretamente, política de privacidade publicada, admin panel mínimo para Pedro auditar leads, e Lighthouse CI gate bloqueando regressões de performance/a11y no PR.

#### Story 4.1: Funil de abandono — eventos por pergunta

**As a** Pedro (decisor),
**I want** ver no GA4 e Meta o funil pergunta-por-pergunta,
**so that** identifico qual pergunta está matando a conclusão e itero copy/formato.

**Acceptance Criteria:**
1. Cada resposta dada dispara evento `quiz_answer` com parâmetros `{ question_id, answer_value, step_number, variant }`
2. Abandono (inatividade >60s sem avanço OU fechamento de tab) dispara `quiz_abandon` com última pergunta + step
3. Conclusão de quiz (antes da captura) dispara `quiz_complete` com tier calculado
4. Submit bem-sucedido dispara `Lead` + `CompleteRegistration` no Meta; `generate_lead` no GA4
5. Custom definitions configuradas no GA4 para os parâmetros de `quiz_answer`
6. Documento `docs/tracking-plan.md` mapeia todos os eventos, parâmetros, e destinos (Meta + GA4)

#### Story 4.2: Admin panel mínimo

**As a** Pedro (decisor),
**I want** uma página que lista os últimos 100 leads com filtro por tier,
**so that** posso auditar leads sem entrar no RD Station e validar que o pipeline funciona.

**Acceptance Criteria:**
1. Rota `/admin` protegida por basic auth com credenciais em env vars `ADMIN_USER` + `ADMIN_PASSWORD`
2. Lista os últimos 100 leads lidos de Vercel KV (onde são gravados em paralelo ao envio RD)
3. Cada linha: timestamp, nome, WhatsApp (mascarado: `(11) *****-1234`), tier, top 3 respostas
4. Filtro dropdown por tier (quente/morno/frio/todos) + busca por nome
5. Botão "Reenviar para RD" por lead (chama retry manual no API route)
6. Feature flag via env var `ADMIN_PANEL_ENABLED` — se `false`, rota retorna 404

#### Story 4.3: Política de privacidade LGPD + opt-out

**As a** Jofi,
**I want** conformidade LGPD documentada e funcional,
**so that** não geramos passivo legal nem comprometemos reputação.

**Acceptance Criteria:**
1. Rota `/privacidade` publica política escrita com cláusulas LGPD (dados coletados, base legal, retenção, direitos do titular, contato DPO)
2. Texto da política revisado por Pedro (placeholder inicial com TODO de revisão jurídica)
3. Endpoint `/api/opt-out?email={email}&token={hmac}` remove lead do RD Station e adiciona tag `opt-out`
4. Email enviado ao tutor pós-captura (fire and forget via RD Station) inclui link de opt-out assinado (HMAC)
5. Cookie banner mínimo (apenas para cookies de tracking) com aceitar/recusar — recusar bloqueia Meta Pixel e GA4
6. Link "Política de privacidade" visível no footer de toda a LP e na tela de captura

#### Story 4.4: Lighthouse CI + quality gates no PR

**As a** dev,
**I want** PR bloqueado automaticamente se performance ou a11y regredir,
**so that** qualidade não degrada silenciosamente entre iterações.

**Acceptance Criteria:**
1. GitHub Action `.github/workflows/lighthouse.yml` executa Lighthouse CI em preview Vercel de cada PR
2. Barras: Performance mobile ≥85, Accessibility ≥95, Best Practices ≥90, SEO ≥90
3. Falha em qualquer barra bloqueia merge (required status check)
4. Testes Vitest também obrigatórios no PR com coverage mínimo 70% para arquivos em `src/lib/`
5. README documenta como rodar Lighthouse local + como ajustar barras

---

## 7. Checklist Results Report

_Pendente:_ executar `pm-checklist` após aprovação deste PRD. Populado antes do handoff para @architect.

---

## 8. Next Steps

### UX Expert Prompt

> @ux-design-expert ative. Leia [docs/brief.md](brief.md) e [docs/prd.md](prd.md). Gere `docs/ux-spec.md` com: (1) wireframes mobile-first de todas as 9 telas listadas em §3 (hero, 6–8 perguntas-exemplo, captura, resultado por tier, obrigado-sem-pet, privacidade, admin); (2) especificação de interações (animações, transições, haptic feedback, estados de erro/loading); (3) paleta de cores Jofi derivada da marca (alinhar com David Miranda); (4) tipografia e spacing tokens; (5) variações críticas mobile vs desktop onde houver. Foco: tom acolhedor, tutores, emojis pet. Mode: YOLO (Pedro prefere).

### Architect Prompt

> @architect ative. Leia [docs/brief.md](brief.md), [docs/prd.md](prd.md), e (quando pronto) [docs/ux-spec.md](ux-spec.md). Gere `docs/architecture.md` cobrindo: (1) estrutura de diretórios Next.js 14 App Router; (2) componentes React do quiz engine (diagrama de estado, props, fluxo de dados); (3) schema JSON de `config/quiz.json`, `config/scoring.json`, `config/results.json`, `config/content.json`; (4) contrato da API route `/api/leads` (request/response TS types); (5) estratégia RD Station Marketing (OAuth/token, payload exato, error handling); (6) estratégia Vercel KV queue (chaves, TTL, worker cron); (7) plano de tracking (Meta Pixel + GA4 events taxonomy + custom definitions); (8) segurança (rate limit, Turnstile, HMAC opt-out, LGPD); (9) estratégia de deploy (envs, branching, preview). Mode: YOLO. Pressupor stack do PRD §4 — não re-abrir decisões.
