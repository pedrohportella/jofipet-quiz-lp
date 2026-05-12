# Motion Spec — Jofi Pet Quiz Campaign v1.0

> **Owner:** motion-eng (Matt)
> **Source of truth:** `design-system/tokens.json` → `motion.*`
> **Lê este arquivo:** @dev (implementação web), DM (motion social), DC Conteúdo (Reels/Stories), @qa (validação 60fps + reduced-motion)
> **Stack:** Framer Motion 11 + CSS transitions (hybrid). Decisão de roteamento abaixo.

---

## §0 — Princípios inegociáveis

1. **Spring > bezier sempre que houver movimento físico.** Toque, soltura, drag, drop — usam `motion.spring.*`. Beziers ficam para fade/cor, onde física não se aplica.
2. **60fps é religião.** Cada frame tem 16.6ms de budget. Animar `width`, `height`, `top`, `left` é proibido em loops — só `transform` e `opacity` rodam no compositor.
3. **Hybrid Engine.** WAAPI (CSS transitions / `animate()`) para o trivial; Framer Motion (rAF) para choreography com stagger, layout animations, AnimatePresence.
4. **Coreografia, não show.** Cada animação tem propósito: informar (progresso), guiar (foco no CTA), confirmar (tap feedback), celebrar (resultado). Sem decoração.
5. **Reduced-motion é mandatório.** Não há "essa animação é importante demais". Fades sobrevivem (informam estado); movimento espacial morre.
6. **Uma animação por viewport por vez.** Hierarquia de atenção: o pulse do CTA não compete com o reveal do tier card.

---

## §1 — Tokens consumidos (referência rápida)

| Token | Valor | Uso típico |
|---|---|---|
| `motion.duration.instant` | 80ms | tap feedback, micro-confirm |
| `motion.duration.fast` | 150ms | hover, color change, color-only fades |
| `motion.duration.base` | 280ms | step transition, card reveal, hero entry |
| `motion.duration.slow` | 480ms | progress fill, loading screen entre quiz/result |
| `motion.spring.snappy` | k:500 d:40 m:0.6 | toque, select, toggle |
| `motion.spring.gentle` | k:260 d:26 m:1 | hero entry, card reveal padrão |
| `motion.spring.bouncy` | k:400 d:18 m:1 | tier HOT, pop celebrativo |
| `motion.spring.soft` | k:180 d:30 m:1.2 | tier COLD, FAQ, calmante |
| `motion.stagger.tight\|normal\|loose` | 60/80/120ms | delay entre itens em listas |
| `motion.scroll.threshold` | 0.3 | dispara quando 30% visível |

---

## §2 — Hybrid Engine: roteamento de animação

> **Pergunta-chave:** "preciso animar valores compostos, sequências ou exit?" → Framer Motion. Senão → CSS.

| Caso | Engine | Razão |
|---|---|---|
| Hover de cor / sombra | **CSS transition** | WAAPI em compositor, zero JS overhead |
| `:active` press (scale 0.98) | **CSS transition** | Já implementado em `.jofi-btn:active` |
| QuizOption tap (whileTap) | **Framer Motion** | Spring snappy + haptic feedback acoplado |
| Quiz step-to-step | **Framer Motion (AnimatePresence)** | Exit animation impossível em CSS puro |
| Hero entry (stagger de filhos) | **Framer Motion (variants + staggerChildren)** | Coordena 5 elementos, sem CSS keyframes hand-rolled |
| Progress bar fill | **CSS transition em transform: scaleX** | GPU-only, transform-origin: left |
| Tier card reveal no result | **Framer Motion** | Spring por tier, useInView para trigger |
| Pulse do CTA (loop) | **CSS @keyframes + animation** | Loop infinito; Framer rAF é desperdício aqui |
| Anchor word color reveal | **CSS transition com delay** | 1 propriedade (color), sem coordenação |
| Shake de erro | **Framer Motion** | Sequência `[0,-6,6,-4,4,0]` é mais legível em variants |

---

## §3 — Hero (LP `/` e `/quiz/[step]`)

### §3.1 Anatomia animada

```
Frame 0ms     ┃ tudo opacidade 0
              ┃
Frame 0ms     ┃ container fade-in (kill bg flash)
Frame 60ms    ┃ ① pet emoji         → popIn (spring.bouncy)
Frame 140ms   ┃ ② kicker (eyebrow)  → fadeUp (spring.gentle)
Frame 220ms   ┃ ③ headline H1       → fadeUp (spring.gentle)
Frame 420ms   ┃   └ "susto" (anchor) → anchorHighlight (color, 280ms)
Frame 300ms   ┃ ④ lead              → fadeUp (spring.gentle)
Frame 380ms   ┃ ⑤ social proof      → fadeIn (280ms)
Frame 460ms   ┃ ⑥ CTA primário      → fadeUp (spring.gentle)
Frame 1000ms  ┃ ⑦ CTA pulse loop    → começa após 1s de quietude
```

**Regra:** stagger = `motion.stagger.normal` (80ms). Se reduzir, parece simultâneo (perde impacto). Se aumentar, parece lento.

### §3.2 Implementação (Framer Motion variants)

```tsx
// src/lib/motion/variants.ts (entregável §6)
import { Variants } from 'framer-motion';

export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,   // motion.stagger.normal
      delayChildren: 0.06,     // ~1 frame após mount
    },
  },
};

export const heroChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 26, mass: 1 },
  },
};

export const heroEmoji: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 18, mass: 1 },
  },
};
```

### §3.3 Anchor word ("susto")

A palavra-âncora **não** entra com escala, **não** balança. Ela faz uma coisa:
muda de `text-primary` (warmBlack-900) para `coral-500` com 200ms de delay
após o H1 aparecer. Isso cria o efeito de "olha aqui" sem teatro.

```tsx
<h1 className="jofi-h1">
  Esse{' '}
  <motion.span
    className="jofi-anchor-word"
    initial={{ color: 'var(--jofi-warmblack-900)' }}
    animate={{ color: 'var(--jofi-coral-500)' }}
    transition={{ delay: 0.42, duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
  >
    susto
  </motion.span>
  {' '}vai virar plano de proteção real.
</h1>
```

### §3.4 CTA pulse (loop)

CSS-only, registrado em `globals.css`. Loop começa **1s após mount** para não competir com o reveal:

```css
@keyframes jofi-pulse {
  0%, 100% { transform: scale(1); }
  10%      { transform: scale(1.015); }
  20%      { transform: scale(1); }
}
.jofi-btn--pulse {
  animation: jofi-pulse 5200ms var(--jofi-ease-out) 1000ms infinite;
}
```

> **Constraint:** apenas um `--pulse` por viewport. Se houver dois CTAs (raro), o secundário fica estático.

---

## §4 — Quiz flow (já parcialmente implementado)

### §4.1 Step transition (já existe — manter)

`QuizStep.tsx:116-122` já tem AnimatePresence + slide. **Aprovado**, com 1 ajuste:

| Atual | Mudar para | Motivo |
|---|---|---|
| `transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}` | `transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}` | Spring respeita physics da gestura swipe; bezier puro parece mecânico em mobile |

### §4.2 QuizOption tap (já existe — refinar)

`QuizOption.tsx:43-44` já tem `whileTap={{ scale: 0.98 }}`. Adicionar:

- **Selected state entry:** quando `selected` muda de `false → true`, usa `layout` prop do Framer + spring.snappy. O ring coral aparece com escala 0.96 → 1 (pop discreto). Hoje só muda cor (frio).
- **Auto-advance feedback:** durante os 200ms de `pendingAdvance`, o botão selecionado pulsa 1x (`scale: 1 → 1.02 → 1`) confirmando "registrado, indo".

```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  animate={selected ? { scale: [1, 1.02, 1] } : { scale: 1 }}
  transition={{
    scale: selected
      ? { duration: 0.2, times: [0, 0.5, 1], ease: [0.4, 0, 0.2, 1] }
      : { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }
  }}
  // ...
>
```

### §4.3 ProgressBar (refatorar — bug de performance)

`QuizProgressBar.tsx:30-32` anima `width` via Tailwind. **Isso causa layout em todo frame.** Refatorar:

```tsx
<div className="h-1 w-full overflow-hidden rounded-full bg-neutral-300">
  <motion.div
    className="h-full origin-left rounded-full bg-primary"
    initial={false}
    animate={{ scaleX: percent / 100 }}
    transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
    style={{ width: '100%' }}  // largura fixa; scaleX faz o trabalho
  />
</div>
```

Ganho: width muda → reflow do layout pai. scaleX → composite layer, GPU. **Em dispositivo mid-tier (Moto G9), essa mudança devolve ~4ms por frame.**

### §4.4 Validação de input (shake)

Quando `react-hook-form` reporta erro, o input recebe variant `shake`:

```tsx
<motion.input
  animate={errors.email ? 'shake' : 'idle'}
  variants={{
    idle: { x: 0 },
    shake: { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.32 } },
  }}
/>
```

Haptic feedback acompanha (`useHaptic('error')`).

---

## §5 — Result page (`/resultado`)

Página de maior peso emocional da campanha. Coreografia em 4 atos:

### §5.1 Loading screen (transição quiz → result)

Tela cheia, 480ms (`motion.duration.slow`):
- Frame 0: fundo cream + emoji 🐾 fade-in
- Frame 100ms: emoji começa um wiggle suave (`rotate: [-3°, 3°, -3°]` loop, 800ms cada)
- Frame 480ms: fade-out + push para result

> **Nunca exibir spinner SaaS.** A marca não é tech, é acolhimento. Spinner = ansiedade.

### §5.2 Tier card reveal

Spring varia por tier — cor reforça veredito **através do movimento**:

| Tier | Spring | Sensação |
|---|---|---|
| `hot` (coral) | `bouncy` (k:400 d:18) | Energia, urgência alegre |
| `warm` (amarelo) | `gentle` (k:260 d:26) | Convite firme, sem pressão |
| `cold` (verde) | `soft` (k:180 d:30 m:1.2) | Calma, "tá tudo bem" |

```tsx
const springsByTier = {
  hot:  { type: 'spring', stiffness: 400, damping: 18, mass: 1 },
  warm: { type: 'spring', stiffness: 260, damping: 26, mass: 1 },
  cold: { type: 'spring', stiffness: 180, damping: 30, mass: 1.2 },
};

<motion.div
  data-tier={tier}
  className="jofi-card jofi-card--tier"
  initial={{ opacity: 0, y: 24, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={springsByTier[tier]}
>
```

### §5.3 Stagger dos benefits (lista do plano)

Cada item da lista entra com `fadeUp` + stagger `loose` (120ms — dá tempo do leitor absorver):

```tsx
<motion.ul
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } },
  }}
>
  {benefits.map((b) => (
    <motion.li key={b.id} variants={heroChild}>{b.label}</motion.li>
  ))}
</motion.ul>
```

### §5.4 CTA WhatsApp

Mesmo pulse do hero, **mas com 2s de delay** (espera o usuário ler o tier card e benefits primeiro). Cor verde-WhatsApp, não coral.

---

## §6 — Microinterações canônicas

| Componente | Estado | Animação | Engine |
|---|---|---|---|
| `Button` | hover | `bg` + `box-shadow` 150ms ease-out | CSS |
| `Button` | active | `scale(0.98)` 80ms | CSS (`:active`) |
| `Button` | loading | spinner inline trocando label | Framer (AnimatePresence) |
| `QuizOption` | tap | `scale 0.98` whileTap | Framer |
| `QuizOption` | select | spring.snappy + bg coral-soft | Framer |
| `QuizOption` | autoAdvance pulse | `scale [1,1.02,1]` 200ms | Framer |
| `Card` | hover | `shadow-1 → shadow-2` 150ms | CSS |
| `Input` | focus | `box-shadow: jofi-focus` 150ms | CSS |
| `Input` | error | `shake` x 320ms | Framer |
| `Checkbox` | toggle | check icon scale 0.6 → 1 spring.snappy | Framer |
| `ProgressBar` | fill | `scaleX` 480ms ease-out | Framer/CSS |
| `Toast` | enter | `slideDown + fadeIn` spring.gentle | Framer |
| `Toast` | exit | `slideUp + fadeOut` 150ms ease-in | Framer |
| `Modal` | enter | overlay fade + content `popIn` | Framer |
| `Accordion` (FAQ) | expand | `height auto` via layout prop | Framer (layout) |

---

## §7 — prefers-reduced-motion (mandatório)

### §7.1 CSS layer (já existe — mantém)

`globals.css:228-237` força `animation-duration: 0.01ms` em tudo. **Isso cobre 80% dos casos automaticamente.**

### §7.2 Framer Motion layer

Para variants com `type: 'spring'`, CSS não alcança. Solução: hook + helper.

```tsx
// src/lib/motion/useReducedMotion.ts (entregável §10)
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  return useFramerReducedMotion() ?? false;
}

// helper para shortcircuitar variants
export function reduceVariants<T>(variants: T, reduced: boolean): T {
  if (!reduced) return variants;
  return {
    ...variants,
    transition: { duration: 0.01 },
  } as T;
}
```

### §7.3 Comportamento por componente em reduced-motion

| Componente | Comportamento normal | Comportamento reduzido |
|---|---|---|
| Hero entry | Stagger fadeUp em 5 elementos | Tudo fade-in instantâneo (opacity 0 → 1, 0ms) |
| Anchor word | Color transition 280ms | Cor coral aplicada de imediato |
| CTA pulse | Loop infinito | **Desligado** (sem animation) |
| Quiz step | Slide horizontal | Apenas crossfade 0ms (instant swap) |
| ProgressBar | Anima scaleX 480ms | Define width direto, sem transição |
| Tier reveal | Spring por tier | Estado final imediato |
| Loading screen | Wiggle do emoji | Emoji estático, fade-out 0ms |

> **Princípio matt:** preserve fades quando informarem estado (algo apareceu/sumiu); mate movimento espacial. Reduced-motion é respeito, não animação degradada.

---

## §8 — Performance budget

### §8.1 Frame budget

| Métrica | Target | Como medir |
|---|---|---|
| FPS durante hero entry | 60fps constante | Chrome DevTools Performance, Frame chart sem barras vermelhas |
| Largest Contentful Paint | < 1.8s (Moto G9 / 4G) | Lighthouse mobile |
| Total Blocking Time | < 200ms | Lighthouse mobile |
| Cumulative Layout Shift | < 0.05 | Animations não devem mover layout — `transform` only |

### §8.2 Regras de ouro

1. **Animou `width`/`height`?** Refatorar para `transform: scaleX/scaleY` com `transform-origin`.
2. **Animou `top`/`left`?** Refatorar para `transform: translate3d`.
3. **`will-change` permanente?** Remover. Aplicar só durante a animação, com cleanup.
4. **Loop infinito + opacity transitioning?** Opacity loop em compositor é OK; combinado com filter/blur, é morte.
5. **Mais que 8 springs simultâneos?** Cortar. Mid-tier mobile não aguenta.

### §8.3 Validação no @qa

Checklist obrigatório no QA Gate:

- [ ] `Performance > Record` durante hero entry — FPS chart sem dips abaixo de 55fps
- [ ] `Rendering > Layout Shift Regions` — nenhuma região vermelha durante animação
- [ ] DevTools `> ⋮ > More tools > Rendering > Paint flashing` — animações em transform/opacity não pintam
- [ ] Toggle `prefers-reduced-motion: reduce` (DevTools > Rendering) — toda animação espacial morre, fades viram 0ms
- [ ] CPU throttle 4x + Network 4G — interação ainda a 60fps

---

## §9 — Motion social (Reels / Stories / Carrossel)

> **Para DM (design visual) e DC Conteúdo.** Web e social compartilham régua, mas timing precisa ser **2x mais rápido em social** porque o usuário scrolla.

### §9.1 Reels cover (1080×1920, 0–3s)

```
0.0s  ┃ frame fixo: cream bg + texto "Seu pet com susto?"
0.3s  ┃ palavra "susto" muda para coral (color flash 200ms)
0.5s  ┃ pet emoji desce do topo (spring.bouncy, y: -200 → 0)
1.5s  ┃ texto desce: "responde 6 perguntas"
2.5s  ┃ CTA "Comece o quiz" entra (popIn)
3.0s  ┃ loop / hold final
```

**Export:** MP4 H.264, 30fps, 1080×1920, ≤8MB. Sem áudio (Reels usa stock music).

### §9.2 Stories animado (1080×1920, 0–7s)

Safe-area: 220px topo + 280px rodapé (já em tokens).

```
0.0s  ┃ headline frame 1 (em safe-area)
2.0s  ┃ headline desliza para fora (fadeOut + x:-200, 280ms)
2.3s  ┃ headline frame 2 entra (fadeUp)
4.5s  ┃ headline frame 2 sai
4.8s  ┃ CTA "Arraste pra cima" + arrow bounce loop
7.0s  ┃ end (story repete)
```

### §9.3 Carrossel Insta (1080×1350, slide-by-slide)

Estático na peça. **Animação acontece na transição** entre slides do carrossel — isso é nativo do Instagram, não precisa exportar. Garantir que cada slide tenha **um único foco de leitura** (texto não compete com imagem).

### §9.4 Meta Ad video (feed 1:1, 0–6s)

```
0.0s  ┃ pet com susto (foto/ilustração) — fica 1.5s estático para o usuário parar de scrollar
1.5s  ┃ overlay de texto entra: headline-A (Emily copy)
3.0s  ┃ palavra-âncora coral pisca 1x (color flash 280ms)
4.0s  ┃ logo Jofi + "responda 6 perguntas" frame final
5.5s  ┃ end card com CTA
```

> **Export:** MP4 H.264, 30fps, ≤4MB para feed (Meta limita a 30s e 4GB, mas peças performam melhor abaixo de 4MB).

---

## §10 — Entregáveis de código (para @dev)

Esta spec gera os seguintes arquivos prontos:

| Arquivo | Função |
|---|---|
| `src/lib/motion/variants.ts` | Variants nomeados (`heroContainer`, `heroChild`, `heroEmoji`, `tierReveal`, `shake`, `popIn`) — importa em qualquer componente |
| `src/lib/motion/springs.ts` | Spring configs nomeados (`snappy`, `gentle`, `bouncy`, `soft`) |
| `src/lib/motion/useReducedMotion.ts` | Hook + helper `reduceVariants` |
| `src/app/globals.css` (extends) | Adicionar `@keyframes jofi-pulse` e classes `.jofi-btn--pulse` |

Story sugerida: `2.1.2.refactor-motion-to-spec` (escopo ~3h):
1. Criar `lib/motion/*` (variants, springs, hook)
2. Refatorar Hero (`page.tsx`) para consumir `heroContainer` + `heroChild`
3. Refatorar `QuizProgressBar` (width → scaleX)
4. Adicionar tier reveal no `/resultado`
5. Adicionar pulse no CTA hero (CSS keyframe)

---

## §11 — Checklist de aceitação (@qa)

Toda peça/feature com motion passa por:

- [ ] **60fps no Moto G9** (CPU 4x throttle + Network 4G)
- [ ] **prefers-reduced-motion: reduce** desliga todo movimento espacial; fades viram 0ms
- [ ] **Foco visível** durante animações de entrada (focus ring nunca some)
- [ ] **Sem CLS** durante reveals (animações em transform/opacity only)
- [ ] **Aria-live regions** em mudanças importantes (ex: tier revealed) — TalkBack/VoiceOver anuncia
- [ ] **Tap targets** mantêm 44px+ durante todo o ciclo de animação (scale 0.98 ainda passa em 56px × 0.98 = 54.8px)
- [ ] **Haptic feedback** acompanha todo press confirmador (`useHaptic('light')` já está pronto)
- [ ] **Sem `will-change` permanente** — só durante a animação
- [ ] **Bundle size** — Framer Motion já está; não adicionar lottie/gsap

---

## §12 — Exemplos de "não fazer"

- ❌ **Bounce em tudo.** Spring bouncy só onde celebração faz sentido (tier HOT, success). Em hero, vira clown.
- ❌ **Animar `box-shadow` em hover de card 60fps.** Box-shadow paints, não compõe. Use opacity em pseudo-element se precisar.
- ❌ **Stagger > 200ms.** Usuário desiste antes do último item entrar.
- ❌ **CTA com pulse + bounce + shadow loop.** Um efeito por elemento. CTA pulsa OU brilha, nunca os dois.
- ❌ **Page transition full-screen.** App Router do Next 14 já tem skeleton; adicionar overlay de loading fora do `/resultado` é fricção.
- ❌ **Anchor word piscando em loop.** Coral entra **uma vez** e fica. Loop infinito de cor cansa em 3s.
- ❌ **Reduced-motion com "exceção".** Não há exceção. Se a animação é "essencial", design está errado.

---

*Motion Spec v1.0 — Matt, motion-eng. Próxima revisão após primeiro Lighthouse run em produção.*
