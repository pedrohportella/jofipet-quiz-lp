# Jofi Pet — Quiz Campaign Design System v1.0

> **Owner:** `design-sys-eng` · Diana (Token Guardian)
> **Posicionamento:** April Dunford → Apoio para tutor que paga vet avulso
> **Brand soul:** Emily Heyward → "Plano de gente. Não é app."
> **Direção visual:** Sagi Haviv → 60/30/10 · Coral âncora · Cream canvas · Nunito disciplinado
> **Stack:** Next.js 14 + Tailwind 3 + Framer Motion · `projects/jofipet-quiz-lp/`

---

## 0. Filosofia desta entrega

Token-first, sempre. **Toda decoração lê de `tokens.json`.** Hardcoded `#FF7A59` em componente é bug, não feature. Se você precisou de um valor que não existe, **adicione ao token**, não ao componente.

Três regras que governam tudo abaixo:

1. **A consistência é a marca.** Repetição fiel de poucas decisões > soma de decisões interessantes.
2. **Uma âncora coral por viewport.** Se o CTA é coral, a headline não é. Se a headline tem palavra grifada, o CTA é ghost.
3. **Mobile é canon.** Toda peça é desenhada em 360px e cresce. Desktop é otimização, não default.

---

## 1. Arquitetura do sistema

```
projects/jofipet-quiz-lp/
├── design-system/
│   ├── tokens.json          ← Source of truth (DTCG-style, two-tier)
│   └── README.md            ← Este arquivo (specs + templates)
├── tailwind.config.ts       ← Consumo dos tokens via Tailwind theme.extend
├── src/app/globals.css      ← Consumo dos tokens via CSS vars + classes utilitárias
└── src/components/          ← Componentes consomem APENAS o que está nos arquivos acima
```

**Fluxo de mudança:** `tokens.json` → `tailwind.config.ts` + `globals.css` → componente.
**Nunca:** componente → hardcoded → "depois eu refatoro".

### Camadas de token (two-tier obrigatório)

| Camada | Onde vive | Quem lê | Exemplo |
|---|---|---|---|
| **Primitive** | `color.primitive.*` | Apenas a camada semantic | `coral.500 = #FF7A59` |
| **Semantic** | `color.semantic.*` | Componentes | `action.primary → coral.500` |

Componente que importa primitive direto = bug. Refatore: crie um semantic ou use um existente.

---

## 2. Tokens — referência rápida

Para o catálogo completo veja `tokens.json`. Resumo operacional abaixo:

### 2.1 Cor — proporção 60/30/10 (regra Haviv)

| Faixa | Token | Uso |
|---|---|---|
| **60%** | `bg-canvas` (Cream `#FFF7F0`) | Fundo de toda peça |
| **30%** | `text-primary` (Warmblack `#2D2520`) | Tipografia |
| **10%** | `action-primary` (Coral `#FF7A59`) | UMA âncora por peça |
| **+1-3%** | `feedback-warning` (Amarelo) **OU** `feedback-success` (Verde) | Pontual, nunca os dois juntos |

**Cor por tier de resultado** (reforça veredito sem palavra):

| Tier | Token de cor dominante | CTA |
|---|---|---|
| 🔥 Quente | `tier.hot` (coral) | `action.whatsapp` (verde WhatsApp) |
| 🟡 Morno | `tier.warm` (amarelo) | `action.primary` (coral) |
| 🔵 Frio  | `tier.cold` (verde calma) | Ghost neutro |

**Combinações proibidas:**
- ❌ Coral + Verde-marca justapostos
- ❌ Coral + Amarelo em proporção igual
- ❌ Branco puro `#FFFFFF` como fundo (use `bg-canvas`)
- ❌ Preto puro `#000000` em texto (use `text-primary`)

### 2.2 Tipografia — Nunito, 3 pesos, ponto

| Text style | Peso | Mobile | Desktop | Quando usar |
|---|---|---|---|---|
| `displayHero` / `h1` | 800 | 32px | 40px | Hero, resultado |
| `h2` | 700 | 24px | 28px | Pergunta do quiz, seção |
| `h3` | 700 | 20px | 20px | Card title |
| `lead` | 400 | 18px | 20px | Subheadline |
| `body` | 400 | 16px | 17px | Texto corrido |
| `bodyEmphasis` | 700 | 16px | 17px | Palavra grifada inline |
| `label` | 700 | 16px | 16px | CTA button label |
| `caption` | 600 | 12-14px | 13-14px | Microcopy, redutor de fricção |
| `kicker` | 700 CAPS | 14px | 14px | Eyebrow acima do H1 |
| `price` | 800 tabular | 24-28px | 24-28px | `R$49,90`, `R$280,00` |

**Regras absolutas:**
- Pesos 300/500/900 **proibidos** (não estão no token).
- Itálico **proibido** (Nunito itálico é fraco).
- CAPS **só** em kicker e CTA labels (≤3 palavras).
- Headline termina em **ponto final**, não exclamação. ("Antes do próximo susto." > "Antes do próximo susto!")

### 2.3 Spacing — escala 4px

`0 / 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 32` (× 4px)

Não interpolar. Se precisa de algo "entre 16 e 24", use `5` (20px) — está no token.

### 2.4 Radius

| Token | Valor | Quando usar |
|---|---|---|
| `radius.sm` | 8px | Chip, badge |
| `radius.md` | 12px | Input |
| `radius.lg` | 16px | Card padrão |
| `radius.xl` | 24px | Hero card, modal, result card |
| `radius.pill` | 9999px | Botões, sempre |

### 2.5 Elevation

| Token | Quando | Visual |
|---|---|---|
| `elevation.1` | Card em repouso | Quase plano |
| `elevation.2` | Card hover, CTA primário | Lift sutil |
| `elevation.3` | CTA destacado, modal | Lift evidente |
| `elevation.focus` | `:focus-visible` | Anel coral 32% |

**Anti-pattern:** drop-shadow azul-cinza estilo SaaS. A Jofi usa sombra **quente**, baseada em warmblack rgba.

### 2.6 Motion

- **Durations:** `instant 80ms` · `fast 150ms` · `base 280ms` · `slow 480ms`
- **Easings:** `out` (default) · `in` (saída) · `spring` (entrada de QuizOption selecionada)
- **Stagger:** `tight 60ms` · `normal 80ms` · `loose 120ms`

**Regra:** se você está prestes a usar uma animação > 480ms, está errado.

---

## 3. Componentes-chave — contratos e variações

> Cada componente abaixo tem: **contrato (props/variantes)**, **regras de aplicação**, e **classe Tailwind/CSS canônica**. Componentes consomem tokens — não inventam valores.

### 3.1 Button — `Button` / `.jofi-btn`

```tsx
type ButtonProps = {
  variant: 'primary' | 'whatsapp' | 'ghost';
  size?: 'md' | 'lg';   // md = 48px, lg = 56px (default)
  fullWidth?: boolean;  // mobile = sempre true
  children: ReactNode;
};
```

**Variantes:**

| Variant | Background | Texto | Quando |
|---|---|---|---|
| `primary` | `action.primary` (coral) | `#FFF` | CTA principal de qualquer tela |
| `whatsapp` | `action.whatsapp` (verde plataforma) | `#FFF` | EXCLUSIVO do CTA "Falar agora no WhatsApp" |
| `ghost` | transparent · borda 1.5px | `text.link` | CTA secundário ("Prefere email primeiro?") |

**Regras absolutas:**
- Mínimo 56px de altura em mobile (`size.tapComfort`). Abaixo disso, fail acessibilidade.
- Radius **sempre** `pill` (9999px). Botão quadrado em consumer brand é frio.
- Um CTA primário por viewport. Segundo CTA = sempre `ghost`.
- Sombra: `elevation.2` repouso → `elevation.3` hover. Botão sem sombra parece desativado.

**Snippet canônico (Tailwind):**
```tsx
<button className="jofi-btn jofi-btn--primary w-full">
  Fazer o quiz (2 min)
</button>
```

### 3.2 Hero — `<Hero />`

Composição vertical em 6 slots fixos, na ordem. Pular um slot = quebrar o ritmo do hero.

```
┌─────────────────────────────────┐
│ [logo top-left, h=24px]         │
│                                 │
│ KICKER · 14px CAPS              │  ← slot 1: kicker (opcional, mas aumenta CTR)
│                                 │
│ Headline com palavra-âncora.    │  ← slot 2: H1, 32-40px, ponto final
│                                 │
│ Subheadline em 1-2 linhas       │  ← slot 3: lead, 18-20px
│ que explica sem repetir.        │
│                                 │
│ [   CTA primário, full-width  ] │  ← slot 4: button primary
│                                 │
│ 🐾 Prova social curta           │  ← slot 5: caption
│                                 │
│ Microcopy redutor de fricção    │  ← slot 6: text.muted, 13px
└─────────────────────────────────┘
```

**Regras:**
- Background: **sempre** `bg-canvas`. Branco puro = morte da marca.
- Padding mobile: `px-4 py-10` (16px lateral · 40px vertical).
- Padding desktop: `px-6 py-16` (24px lateral · 64px vertical).
- A palavra-âncora coral aparece **uma vez** no H1 e **só lá**. Sugestão atual: a palavra **"susto"** em coral, resto em `text-primary`.
- Logo top-left, 24-32px de altura, `space-{size.tap}` de área de proteção em volta.

**Aplicado ao copy da Emily (`config/content.json`):**
```tsx
<section className="bg-cream-50 px-4 py-10 md:px-6 md:py-16">
  <Logo size={32} variant="compact" />

  <p className="jofi-kicker mt-8">QUIZ JOFI · 2 MIN · SEM CARTÃO</p>

  <h1 className="jofi-h1 mt-3">
    Antes do próximo <span className="jofi-anchor-word">susto</span> no vet,
    descubra em 2 minutos o seu plano.
  </h1>

  <p className="jofi-lead mt-4">
    Sem cartão. Sem ligação. Em 2 minutos a gente te diz o plano certo
    pra você — ou se você nem precisa de plano agora.
  </p>

  <Button variant="primary" size="lg" fullWidth className="mt-6">
    Fazer o quiz (2 min)
  </Button>

  <p className="text-sm font-semibold text-neutral-700 mt-4">
    🐾 +2.000 tutores já descobriram. Gente de verdade do seu lado.
  </p>

  <p className="text-xs text-neutral-500 mt-2">
    Sem custo. Sem compromisso. Você só vê seu plano quando terminar.
  </p>
</section>
```

### 3.3 Cards — 4 variações canônicas

| Variant | Token estrutural | Usa onde |
|---|---|---|
| `value` | `radius.lg` · `elevation.1` · padding 24 | Bullets "O que você descobre" |
| `differentiator` | `radius.lg` · `elevation.1` · padding 24-32 | "Por que somos diferentes" (3 cols desktop, stack mobile) |
| `result-tier` | `radius.xl` · `elevation.2` · `border-top` 4px tier color · padding 32x24 | Tela de resultado (quente/morno/frio) |
| `faq` | `radius.md` · sem sombra · `bg-muted` · padding 16-24 · accordion | "FAQ honesto" |

**ResultCard contrato:**

```tsx
type ResultCardProps = {
  tier: 'hot' | 'warm' | 'cold';
  icon: '🔥' | '🟡' | '🔵';
  headline: string;          // com {nome} interpolado
  subheadline: string;
  bullets: Array<{ icon: string; text: string }>;
  primaryCta: { label: string; variant: 'primary' | 'whatsapp' };
  secondaryCta?: { label: string };
  highlightBlock?: { tone: 'urgency' | 'offer'; text: string };
};
```

**Tone do highlight block:**
- `urgency` (tier hot): background `coral-50`, borda esquerda 4px coral.
- `offer` (tier warm): background `yellow-300`, texto `text-on-yellow`.

### 3.4 Banner / Meta Ad — sistema de 3 layouts mestres

Todos os 3 banners abaixo derivam dos **mesmos tokens**, com proporção 60/30/10 mantida. PP/DM cria 12+ variações apenas trocando copy + foto, **nunca** tokens.

| Layout | Aspect ratio | Quando |
|---|---|---|
| **A · Headline-first** | 1:1 (1080×1080) feed | Headline ocupa 65% · imagem/ilustração 25% · logo+CTA 10% |
| **B · Image-first** | 1:1 (1080×1080) feed | Foto tutor+pet 60% · headline embaixo 30% · logo+CTA 10% |
| **C · Story** | 9:16 (1080×1920) | Logo topo (dentro de safe-area 220px) · H1 grande no meio · CTA pin no rodapé (acima de safe-area 280px) |

**Especificação visual (tokens reais):**

```
┌─ Meta Feed 1080x1080 (Layout A · Headline-first) ─┐
│ Background: var(--jofi-bg-canvas) #FFF7F0           │
│ Padding: 64px (use spacing.16) em todos lados       │
│                                                     │
│ Logo: 48px height · top-left                        │
│                                                     │
│ Kicker: jofi-kicker · 32px (escalado +1 step)       │
│ "QUIZ JOFI · 2 MIN"                                 │
│                                                     │
│ H1: 72px (escalado +1 step do desktop) · weight 800 │
│ line-height 1.1                                     │
│ "Antes do próximo [susto] no vet."                  │
│ — palavra "susto" em coral, resto em warmblack-900  │
│                                                     │
│ Body: 28px (lead size grande) · weight 400          │
│ "Quiz honesto de 2 min. Sem cartão."                │
│                                                     │
│ Visual: ilustração single-stroke ou crop foto       │
│ posicionado bottom-right · max 35% da peça          │
│                                                     │
│ NÃO incluir CTA visual — Meta sobrepõe botão nativo │
└─────────────────────────────────────────────────────┘
```

**Story 1080x1920 — safe area sagrada:**

```
┌─ Story 1080x1920 ─────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← 220px safe-area topo (UI Insta cobre)
│ [Logo top-center, 56px]       │
│                               │
│       BLOCO DE CONTEÚDO       │ ← área útil ~1420px
│   (1420px de altura útil)     │
│                               │
│   Kicker · H1 grande · CTA    │
│                               │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← 280px safe-area rodapé
└───────────────────────────────┘
```

### 3.5 QuizOption (já existe — formalizar contrato)

O componente `src/components/quiz/QuizOption.tsx` já está aderente. Apenas formalizo aqui o contrato canônico:

| Estado | Background | Border | Texto | Motion |
|---|---|---|---|---|
| `default` | `bg-surface` (white) | 1px `border.subtle` | `text-primary` | — |
| `hover` | `bg-surface` | 1px `border.default` | `text-primary` | `duration.fast` |
| `selected` | `action-primary-soft` (coral 100) | 2px `border.selected` (coral) | `text-primary` | `duration.fast` `easing.spring` |
| `disabled` | `bg-surface` opacity 40% | `border.subtle` | `text-muted` | — |
| `pressed` | herda `selected` | herda | herda | `transform: scale(0.98)` `duration.instant` |

Min-height: 56px (`size.tapComfort`). Padding: 16px (`spacing.4`). Radius: 16px (`radius.lg`).

### 3.6 Input + ProgressBar

**Input (text/tel/email/CEP):**
- Height: 52px (`size.inputHeight`)
- Radius: 12px (`radius.md`)
- Border: 1.5px `border.subtle` → 2px `border.focus` em focus
- Padding: 16px lateral (`spacing.4`)
- Label acima, 14px peso 700

**ProgressBar:**
- Track: 4px height, `bg-muted`, radius pill
- Fill: 4px height, `action.primary` (coral), radius pill
- Transition: `width var(--jofi-duration-base) var(--jofi-ease-out)`
- Topo da viewport quiz, sticky com z-index `sticky` (100)

---

## 4. Templates — o que ir pra produção

> "Templates" aqui = peças mestras testáveis. PP/DM duplicam estes layouts e trocam **só copy + imagem**. Tokens NUNCA mudam entre variações.

### 4.1 Template `LP-HERO` (web)

**Onde:** `src/app/page.tsx` (já existe — refatorar para consumir copy de `config/content.json` da Emily, conforme story 2.1).

**Anatomia:**
1. Logo top-left
2. Hero (anatomia §3.2)
3. Banda 2 — "O que essa página é, em 1 frase" (`bg-muted`, padding 32-48 vertical)
4. Founder story (3 frases, padding 48 vertical, `text-secondary`)
5. Value bullets (3 cards `value`, stack mobile / grid 3-cols desktop)
6. CTA âncora 2 (`Button primary fullWidth`)
7. Differentiators (3 cards `differentiator`, stack mobile / grid 3-cols ≥768px)
8. FAQ (3 itens, accordion)
9. CTA âncora 3 (footer)
10. Footer institucional (`bg-inverse`, `text-on-accent`, padding 48 vertical, logo símbolo + LGPD links)

### 4.2 Template `RESULT-TIER` (web)

**Onde:** `src/app/resultado/[tier]/page.tsx` (story 3.1, schema já em `config/results.json`).

**Anatomia:**
1. Logo top-left compacta
2. Card `result-tier` (anatomia §3.3) — ocupa o viewport inteiro mobile, max-width 600 desktop
3. Slot inferior:
   - Tier `hot` → `whatsapp` button + ghost "email primeiro?"
   - Tier `warm` → `primary` button "Quero o Sereninho" + ghost "manda por email"
   - Tier `cold` → `primary` button "Quero os 5 sinais" + texto "Já recebo, fechar"
4. Footer minimalista — só logo símbolo + 1 link LGPD

### 4.3 Template `META-AD-FEED-A` (social)

**Dimensão:** 1080×1080 · Headline-first · ver §3.4 layout A.

**Variação por copy** (12 criativos da Emily, todos no mesmo template):
- Headline #1 — "Antes do próximo susto"
- Headline #2 — "A roleta do vet"
- Headline #4 — "2 min sem cartão"
- Headline #8 — "Talvez você nem precise"

**Variação por palavra-âncora coral** (apenas UMA por peça):
- "susto" · "roleta" · "honestamente" · "gente"

### 4.4 Template `META-AD-FEED-B` (social · image-first)

**Dimensão:** 1080×1080 · Image-first · ver §3.4 layout B.

**Image specs:**
- Crop tutor adulto (30-50) + pet adulto/idoso, mãos visíveis tocando o pet
- Iluminação natural lateral, golden hour
- Pós-produção: dessaturar verde ambiente, manter pele/pelo natural
- Chapa overlay `bg-canvas` com 92% opacidade no terço inferior, onde a headline mora

### 4.5 Template `STORY/REELS-COVER` (social)

**Dimensão:** 1080×1920 · ver §3.4 layout C com safe-area.

**Estrutura:**
- Frame 1 (cover): Logo + H1 grande (`fontSize.6xl` = 56px+ escalado)
- Frame 2-3: 1 ideia por frame, fundo `bg-canvas`, texto centralizado
- Frame final: CTA único "Fazer o quiz" + URL `jofi.com.br/quiz`

### 4.6 Template `CARROSSEL-INSTA` (social)

**Dimensão:** 1080×1350 (4:5) · 5-7 slides

**Estrutura por slide:**
- Slide 1 (capa): headline grande + 1 visual + logo top-left
- Slides 2-4: 1 ideia por slide, padding 80px lateral, fundo `bg-canvas`
- Slide 5+ (CTA final): "Fazer o quiz" + URL + logo central

**Regra inviolável:** todos os slides usam **a mesma paleta** (cream + warmblack + 1 acento). Mudar paleta entre slides é o erro #1 de carrossel.

### 4.7 Template `OG-IMAGE` (social meta)

**Dimensão:** 1200×630.

Mesma estrutura do feed-A, escalada. Para preview WhatsApp/Twitter/LinkedIn quando alguém compartilha o link da LP.

---

## 5. Cheat sheet visual (cole no Notion da DC)

```
┌────────────────────────────────────────────────────────────────┐
│ JOFI DS v1.0 — RÉGUA DE PRODUÇÃO                               │
├────────────────────────────────────────────────────────────────┤
│ COR (60/30/10)                                                 │
│   60% bg-canvas    Cream  #FFF7F0  → fundo, respiração         │
│   30% text-primary Warmbk #2D2520  → tipografia                │
│   10% action       Coral  #FF7A59  → UMA âncora por peça       │
│   +acento 1-3%     Amarelo OU Verde (nunca os dois)            │
│                                                                │
│ TIPOGRAFIA                                                     │
│   Nunito · 400 / 700 / 800 · APENAS                            │
│   H1 32-40px ExtraBold · Body 16-17px Regular                  │
│   Sentence case · ponto final · sem itálico                    │
│                                                                │
│ ESPAÇO                                                         │
│   Escala 4px · não interpolar · padding hero 16-24 / 40-64     │
│                                                                │
│ RADIUS                                                         │
│   Card 16 · ResultCard 24 · Botão pill 9999 · Input 12         │
│                                                                │
│ MOTION                                                         │
│   fast 150 · base 280 · slow 480 · jamais > 480ms              │
│                                                                │
│ MARK                                                           │
│   Top-left LP/feed · Top-center story · 24px mín web           │
│   Área de proteção = altura do "J"                             │
│   PROIBIDO: rotação, sombra, gradiente, distorção              │
│                                                                │
│ TIER → COR                                                     │
│   🔥 hot: coral domina · CTA WhatsApp                          │
│   🟡 warm: amarelo destaque · CTA coral                        │
│   🔵 cold: verde calmo · CTA neutro                            │
│                                                                │
│ TESTE FINAL ("essa peça é Jofi de longe?")                     │
│   1. Cobre o logo. Ainda parece Jofi?                          │
│   2. Olhe a 2m no celular. Vê hierarquia?                      │
│   3. Lado a lado com Petlove. É inconfundível?                 │
│   4. Imprima B&W. Sustenta-se?                                 │
│                                                                │
│ PROIBIDO                                                       │
│   #FFF · #000 · itálico · CAPS em parágrafo · 2ª tipografia    │
│   coral+verde juntos · múltiplos CTAs · countdowns · selos     │
│   "OFERTA!" · emoji 🚀 ✨ · stock photo de pet sozinho        │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Migração — código atual vs. canônico

A `src/app/page.tsx` atual tem 4 desvios do DS que **devem ser corrigidos** na próxima revisão (ou na story 2.1, AC#4):

| Linha | Código atual | Correção |
|---|---|---|
| 6-8 | `<span className="text-6xl">🐾</span>` solto | Logo Jofi (top-left, 32px), não emoji-hero |
| 11 | `"Seu pet merece o melhor cuidado."` | Headline da Emily: `"Antes do próximo susto no vet, descubra em 2 minutos o seu plano."` com `<span className="jofi-anchor-word">susto</span>` |
| 14-17 | Body com 💛 | `jofi-lead` da Emily, sem emoji decorativo |
| 25-28 | Botão `bg-primary text-white` inline | `<Button variant="primary" size="lg" fullWidth>` (componente a criar) |

**Story sugerida:** `2.1.1.refactor-hero-to-ds.story.md` — escopo pequeno (1-2h), trocar markup hardcoded por consumo dos tokens + copy do `content.json`.

---

## 7. Handoff — quem faz o quê

| Para | Entrega | Como aplica |
|---|---|---|
| **PP (copy ops)** | `config/content.json` + `config/results.json` (já entregue pela Emily) | Cola no projeto, abre PR. Tokens visuais já estão atrelados. |
| **DM (design visual)** | `tokens.json` + cheat sheet §5 + templates §4 | Constrói as 12 variações de Meta Ad usando layouts A/B do template, copy da Emily. UMA palavra-âncora coral por peça. |
| **@dev** | `tailwind.config.ts` + `globals.css` atualizados + spec §3 de componentes | Cria `<Button />`, `<Hero />`, `<ResultCard />` consumindo `jofi-btn`, `jofi-card`, `jofi-h1`, etc. Refatora `page.tsx` conforme §6. |
| **DC Conteúdo** | Templates §4.5 (Reels) e §4.6 (Carrossel) | Mesma régua visual da campanha paga, alimenta funil orgânico sem dissonância. |
| **@qa** | Cheat sheet §5 + critério "teste final" | Smoke test visual: toda peça passa nos 4 testes antes de ir ao ar. |

---

## 8. O que eu me recuso a aceitar (Token Guardian rule)

1. ❌ **Hardcoded `#FF7A59` em componente.** Use `bg-primary` ou `var(--jofi-action-primary)`.
2. ❌ **Nova fonte introduzida "para o título".** Nunito é suficiente. Variar peso, não família.
3. ❌ **`borderRadius: 14px`** porque "ficou mais bonito". Use 12 ou 16. Não invente steps.
4. ❌ **Sombra azul-cinza estilo SaaS.** A elevação Jofi é warmblack rgba. Está nos tokens.
5. ❌ **Coral em mais de uma âncora por viewport.** Headline OU CTA, nunca ambos.
6. ❌ **Branco puro `#FFFFFF` como fundo de página.** Use `bg-canvas` (cream).
7. ❌ **Patinha 🐾 colada no logo.** Marca tem identidade própria, não precisa de muleta.
8. ❌ **Animação > 480ms.** Microinteração é sentida, não exibida.
9. ❌ **Cor adicional "porque a campanha pediu".** A campanha pede consistência, não novidade.

Se a peça quebra qualquer item acima — refazer antes de aprovar. Não há atalho.

---

## 9. Roadmap pós-v1.0 (não-bloqueantes para esta campanha)

1. **Figma library sync** — gerar arquivo Figma a partir de `tokens.json` via Style Dictionary ou Tokens Studio. (Story futura: `DS-2.0.figma-sync`.)
2. **Dark mode tokens** — atualmente apenas light. Adicionar `color.semantic.dark.*` quando produto pedir.
3. **Variantes de Button** — adicionar `size.sm` (40px) para CTAs em cards. Hoje só `md`/`lg`.
4. **Iconografia** — definir set canônico (lucide-react já em uso). Documentar quando virem 30+ ícones na codebase.

---

**Última coisa.** O design não vai salvar uma campanha mal posicionada. Mas pode matar uma campanha bem posicionada — através de incoerência. Este DS é uma promessa de **disciplina**, não de ousadia.

A força da identidade vem da repetição fiel. Fim.

— Diana, Token Guardian.
