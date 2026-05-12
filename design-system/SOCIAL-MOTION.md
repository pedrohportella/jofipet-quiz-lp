# Social Motion Spec — Jofi Pet Campaign v1.0

> **Owner:** motion-eng (Matt)
> **Para:** DM (motion design) e DC Conteúdo (Reels orgânico)
> **Escopo:** versões animadas de Meta Ad, Reels cover, Story interativo, video ad de feed.
> **Régua compartilhada:** `MOTION-SPEC.md` (web). Aqui é a tradução para vídeo.

---

## §1 — Princípios para social

1. **2x mais rápido que web.** O usuário scrolla. Animações de 280ms na LP viram 140ms em Reels.
2. **Primeiros 1.5s são ouro.** Frame 0 já tem que comunicar o "susto". Sem preamble.
3. **Sem áudio dependency.** 80% dos usuários veem stories/feed mudo. Toda mensagem é visual.
4. **Loop perfeito.** Reels e Stories repetem. Frame final ≈ frame inicial — sem cuts visíveis no replay.
5. **Texto on-screen 1s mínimo por palavra-chave.** Headline com 6 palavras = 6s mínimo. Comprimir mata leitura.
6. **Uma palavra-âncora coral por peça.** Mesma regra Haviv da web. Em motion, ela **pisca uma vez** e fica.

---

## §2 — Hierarquia de timing (cheat sheet)

| Elemento | Entrada | Hold | Saída |
|---|---|---|---|
| Hook visual (foto/emoji) | 200ms popIn | 1.0s | — |
| Headline | 280ms fadeUp | 1.5s mínimo | 200ms fadeOut |
| Anchor word color flash | 280ms color | hold permanente | — |
| Body / subheadline | 220ms fadeUp + delay 200ms | 1.0s mínimo | 200ms fadeOut |
| Logo + CTA frame | 280ms popIn | hold final | — |

**Total mínimo de uma peça:** 4.5s. **Máximo Reels orgânico:** 7s. **Máximo Story:** 15s (o limite da plataforma é mais alto, mas a atenção não).

---

## §3 — Reels Cover animado (1080×1920, 0–6s)

Capa-thumb que abre o Reel. Loop infinito até o usuário tocar.

```
Frame 0.0s ┃ cream bg + emoji 🐾 grande no centro (estático)
Frame 0.0s ┃ palavra "susto?" abaixo do emoji (warmblack-900)
Frame 0.5s ┃ palavra "susto?" muda pra coral-500 (200ms color transition)
Frame 1.0s ┃ subheadline "responda 6 perguntas" entra (fadeUp 220ms)
Frame 2.5s ┃ logo Jofi entra topo (fadeIn 200ms)
Frame 3.0s ┃ CTA "Começar quiz →" entra (popIn spring.bouncy)
Frame 4.0s ┃ pulse no CTA (1x scale 1 → 1.04 → 1, 400ms)
Frame 5.5s ┃ tudo crossfade para frame 0 (loop seamless)
```

**Spec técnica:**
- Container: 1080×1920, cream-50 bg.
- Safe-area: 220px topo (Insta header) + 280px rodapé (caption + ações).
- Conteúdo total entre 220 e 1640 (1420px de altura útil).
- Export: MP4 H.264, 30fps, ≤8MB, sem áudio.
- After Effects/Motion: usar comp 1080×1920 30fps, render H.264 main profile.

---

## §4 — Meta Ad video (1:1 feed, 0–6s)

Peça de aquisição paga. Primeiro 1.5s carrega 60% da decisão de continuar assistindo.

```
Frame 0.0s ┃ foto/ilustração do pet com expressão de susto
           ┃   (frame estático full-bleed, sem texto ainda)
Frame 1.5s ┃ overlay coral entra de baixo (fadeUp + slide 280ms)
           ┃   - texto "Esse susto..." (warmblack-900)
Frame 2.3s ┃ palavra "susto" pisca pra coral (color flash 280ms)
Frame 3.0s ┃ texto desliza, dá lugar a "...vira plano de proteção"
           ┃   (slide horizontal x: 0 → -1080 + entrada do x: 1080 → 0, 320ms)
Frame 4.5s ┃ fundo crossfade pra cream
Frame 4.8s ┃ logo Jofi (fadeIn 200ms)
Frame 5.0s ┃ CTA pill coral "Quero o plano →" (popIn spring.bouncy)
Frame 5.3s ┃ pulse no CTA 1x
Frame 6.0s ┃ end card (estático últimos 0.5s — Meta usa esse frame como thumb)
```

**Variações para A/B test:**
- **Variant A — Headline-first:** começa com texto "Esse susto..." sobre cream, foto do pet entra no frame 1.5s.
- **Variant B — Image-first** (especificado acima): começa com foto, texto overlay depois.
- **Variant C — Question:** começa com "Seu pet sabe se cuidar?" estático 1.5s, depois mesma sequência.

**Export:** MP4 H.264, 30fps, 1080×1080, ≤4MB. Closed captions burned-in (Meta penaliza vídeos sem cap em mobile).

---

## §5 — Story interativo (1080×1920, 0–7s)

Para tráfego orgânico (DC Conteúdo) e ads. Termina em swipe-up (CTA "Arraste pra cima").

```
Frame 0.0s ┃ frame de tensão: foto pet com medo, escurecida 30%
Frame 0.5s ┃ texto frame 1 entra (fadeUp): "5 segundos. É o tempo que..."
Frame 2.0s ┃ texto frame 1 sai (fadeOut + x: -200, 280ms)
Frame 2.3s ┃ texto frame 2 entra (fadeUp): "...um pet sumido vira drama."
           ┃   palavra "drama" pisca coral 280ms
Frame 4.0s ┃ texto frame 2 sai
Frame 4.3s ┃ frame solução: foto pet feliz, fundo cream
Frame 4.6s ┃ logo Jofi entra (fadeIn 200ms)
Frame 5.0s ┃ CTA "Arraste pra cima ↑" entra (popIn)
Frame 5.5s ┃ arrow ↑ bounce loop (y: 0 → -8 → 0, 600ms ease-out, infinite)
Frame 7.0s ┃ end (story repete via Insta nativo)
```

**Sticker interativo (opcional):** poll "Seu pet sabe voltar?" Sim/Não nos últimos 3s. Aumenta retenção orgânica em ~2x conforme benchmark Meta.

---

## §6 — Carrossel Insta (1080×1350, 4–6 slides estáticos)

**Não animar slide-by-slide** — o Instagram já faz a transição com seu próprio motion. Garantir:

- Cada slide tem **um único foco visual** (regra Haviv).
- Slide 1 = hook visual (foto pet + headline).
- Slide 2-4 = differentiators (1 por slide).
- Slide 5 = CTA + QR / link na bio.
- Slide 6 (opcional) = depoimento.

> **Pegadinha técnica:** se exportar com diferente aspect ratio do primeiro slide, Insta crop-a o outro. Manter 1080×1350 em todos.

---

## §7 — Templates AfterEffects / Figma → Motion

Para DM produzir consistente com a régua web:

### §7.1 Comp setup (After Effects ou Figma Smart Animate)

| Setting | Valor |
|---|---|
| Resolution | 1080×1920 (Story/Reels) ou 1080×1080 (Feed) |
| Frame rate | 30fps |
| Duration | varia por peça (§3-§5) |
| Color space | sRGB |
| BG color | `#FFF7F0` (cream-50) — exceto Variant B do Meta Ad |

### §7.2 Easing curves (mapeamento)

| Token web | Equivalente AE / Motion |
|---|---|
| `ease-out` | Bezier (0.4, 0, 0.2, 1) → AE custom (0.4 0% 20% 100%) |
| `ease-in` | Bezier (0.4, 0, 1, 1) |
| `ease-spring` | Bezier (0.34, 1.4, 0.64, 1) — overshoot 12% |
| Spring snappy | AE expression: `spring(amp=0.05, freq=8, decay=12)` |
| Spring gentle | AE expression: `spring(amp=0.04, freq=4, decay=10)` |
| Spring bouncy | AE expression: `spring(amp=0.10, freq=5, decay=8)` |

### §7.3 Cores (consumo direto)

```
Coral-500    #FF7A59   → CTA, anchor word, alerta
Cream-50     #FFF7F0   → bg padrão (NÃO use #FFFFFF)
Yellow-500   #FFD66B   → highlight de palavra (≤3% da peça)
Green-500    #4CAF82   → tier cold, sucesso
WarmBlack-900 #2D2520  → texto canônico (NÃO use #000)
```

---

## §8 — Loop seamless (regra obrigatória)

Reels e Stories repetem automaticamente. Cortes visíveis no replay matam a peça.

**Receita:** últimos 500ms da peça = crossfade + scale 1.0 → 1.0 (estático) que combina com primeiro frame.

```
Frame final - 0.5s ┃ todos elementos atingem opacity 0 EXCETO bg cream
Frame final        ┃ apenas cream visível
Frame 0 (replay)   ┃ cream visível → continua
Frame 0.0s         ┃ primeiro elemento entra do estado cream
```

> **Não use cross-dissolve longo (1s+).** Vira morta-cosmética. 500ms é o teto.

---

## §9 — Validação (DM antes de mandar pra DC Campanhas)

Checklist por peça:

- [ ] **Frame 0–1.5s comunica o conflito** (sem precisar áudio)
- [ ] **Uma palavra-âncora coral** apenas, e ela pisca **1x** (não loop)
- [ ] **Logo aparece nos últimos 2s** (não no início — distrai do hook)
- [ ] **CTA tem pulse 1x apenas** (não loop infinito)
- [ ] **Texto on-screen ≥1s por bloco** (testa lendo em 1.25x speed mental)
- [ ] **Loop seamless** (último frame ≈ primeiro)
- [ ] **Safe area Story respeitada** (220px topo + 280px rodapé)
- [ ] **Export ≤8MB Reels / ≤4MB feed** (Meta entrega melhor abaixo desses pesos)
- [ ] **Closed captions burned-in** (texto de imagem, não SRT — Meta corta SRT em Reels)
- [ ] **Versão estática** existe (capa do Reel, fallback Stories)

---

## §10 — Anti-padrões (nunca fazer)

- ❌ **Texto entrando letra por letra** (typewriter). Lento, ansioso, marca não-acolhedora.
- ❌ **Bounce em todo elemento.** Bouncy é só pop celebrativo. Em headline, vira clown.
- ❌ **Música overlay obrigatória.** 80% assistem mudo; música deve ser bonus, não compulsória.
- ❌ **Logo gigante frame 0.** Logo é assinatura, não headline.
- ❌ **CTA piscando em loop após entrada.** Pulse 1x e fica. Loop infinito de CTA = ad de loja chinesa.
- ❌ **Mais de 3 cores no frame.** Cream + 1 cor primária + texto warmblack. Pronto.
- ❌ **Foto do pet com filtro azul/cinza.** Marca é warm. Tons frios contradizem o sistema.
- ❌ **Stinger/whoosh nos primeiros 1.5s.** Mata o hook visual.

---

*Social Motion Spec v1.0 — Matt, motion-eng. Próxima revisão após primeiro batch de peças DM.*
