# LP `/oferta` — Conteúdo a Substituir

A LP `/oferta` está deployada com **placeholders inteligentes**. Tudo
abaixo deve ser substituído por conteúdo real Jofi antes de rodar
campanha paga em volume.

Cada item tem **status** + **onde editar** + **prioridade**.

---

## 🔴 ALTA prioridade (afeta conversão diretamente)

### 1. Detalhamento dos 4 planos
**Onde:** `src/lib/plans/catalog.ts`
**O que substituir:**
- Bullets de cada plano (Sereninho/Sereno/Parceiro/Melhor Amigo)
- Carências em dias
- Confirmar preços (Sereninho R$49,90 / Sereno R$79,90 / Parceiro R$169,90 / Melhor Amigo R$269)
- Persona alvo (`targetPersona`)

**Por que importa:** se o lead clica "Quero o Parceiro" baseado em bullets errados e a Nicole vende algo diferente, gera atrito. Reduz NPS.

**Como atualizar:**
```ts
// catalog.ts, item Parceiro:
{
  id: 'parceiro',
  name: 'Parceiro',
  bullets: [
    // SUBSTITUIR pelos bullets REAIS da Jofi
    'Internação 24h em rede credenciada',
    'Cirurgias eletivas + emergenciais',
    // ...
  ],
  waitingDays: 60, // CONFIRMAR
  ...
}
```

---

### 2. Testemunhos reais
**Onde:** `src/components/oferta/Testimonials.tsx`
**O que substituir:** array `TESTIMONIALS`

**Formato mínimo:**
```ts
{
  name: 'Camila R.', // ou nome completo, com autorização LGPD
  city: 'Recife/PE',
  plan: 'Plano Sereno',
  rating: 5,
  initial: 'C', // primeira letra do nome
  body: 'Frase curta (~3 linhas, ~200 chars).',
}
```

**Por que importa:** social proof real é o #1 fator de credibilidade em LP long-form (CXL Institute research). Testemunhos genéricos performam ~40% pior que reais com foto + nome + cidade.

**Sugestões pra Jofi pedir aos clientes:**
- "Conta em 3 frases por que escolheu a Jofi"
- "Qual problema você resolveu com nosso plano?"
- "Foto do pet (opcional) + autorização LGPD pra usar na LP"

Ideal: **3 testemunhos**, 1 por tier (Sereninho/Sereno/Parceiro). Melhor Amigo é mais premium — pode ficar pra depois.

---

### 3. Vídeo institucional (30 segundos)
**Onde:** Vercel env var `NEXT_PUBLIC_JOFI_VIDEO_URL`
**O que setar:** URL do embed do YouTube ou Vimeo

**Exemplo de valor:**
```
NEXT_PUBLIC_JOFI_VIDEO_URL=https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Onde criar:** Vercel Dashboard → Project `jofipet-quiz-lp` → Settings → Environment Variables → Add → Production

**Por que importa:** vídeo aumenta tempo na página em ~80% e taxa de conversão em ~15-25% (Wistia data). Sem vídeo, a LP funciona — só não capitaliza esse vetor.

**O vídeo pode ser:**
- Explainer 30s da Nicole se apresentando + 3 motivos pra escolher Jofi
- Casos reais de tutores narrados
- Time da Jofi em ação na clínica

Enquanto não tem, aparece um placeholder visual com "Vídeo institucional em breve 🐾" — feio mas funcional.

---

## 🟡 MÉDIA prioridade (visual + branding)

### 4. Foto real de pet no Hero
**Onde:** `src/components/oferta/Hero.tsx` (linha ~88-101)

Hoje tem um placeholder com emoji 🐶🐱 num gradiente. Trocar por **foto real Jofi** (1:1 quadrado, 600x600 px ou maior).

**Como atualizar:**
1. Adicionar imagem em `public/hero-pet.webp` (formato WebP pra performance)
2. Substituir o `<div placeholder>` por `<Image>` do `next/image`:

```tsx
import Image from 'next/image';

<Image
  src="/hero-pet.webp"
  alt="Cãozinho feliz com tutor"
  width={600}
  height={600}
  priority
  className="aspect-square w-full max-w-md rounded-3xl object-cover shadow-xl"
/>
```

**Por que importa:** imagens reais de pets criam conexão emocional. Placeholder com emoji passa "amador".

---

### 5. CNPJ Jofi no footer
**Onde:** `src/components/oferta/Footer.tsx` (linha ~46)

```tsx
// Trocar "CNPJ a confirmar" pelo CNPJ real
© {year} Jofi Pet · CNPJ XX.XXX.XXX/0001-XX
```

**Por que importa:** trust signal legal. Procon e usuários técnicos olham.

---

### 6. Logos de parceiros (opcional)
**Onde:** ainda não tem section dedicada. Se Jofi tiver parceiros (vets credenciados, certificações, mídias) — vale criar uma seção `<Partners />` entre `Guarantee` e `FAQ`.

**Por que importa:** "as seen on" / "parceiros credenciados" aumenta credibilidade. Não obrigatório no MVP.

---

## 🟢 BAIXA prioridade (refinamento)

### 7. Revisar bullets de problema/solução
**Onde:** `src/components/oferta/Problem.tsx` e `Solution.tsx`

Copy escrito no tom Nicole baseado no que a memory do projeto tem. Vale a Nicole bater olho e validar se "fala como Jofi fala" ou ajustar.

### 8. FAQ — adicionar perguntas reais
**Onde:** `src/components/oferta/FAQ.tsx` array `FAQ_ITEMS`

Hoje tem 7 perguntas genéricas mas plausíveis. Idealmente:
- Adicionar 2-3 perguntas baseadas em **dúvidas reais que a Nicole recebe** no WhatsApp
- Remover ou ajustar respostas que não batem com o que a Jofi pratica (ex: "30 dias pra cancelar" — confirmar se é esse o prazo)

---

## ⚙️ Configuração técnica

### Env vars adicionais necessárias na Vercel

```bash
# JÁ EXISTENTES — sem mudança
NEXT_PUBLIC_JOFI_WHATSAPP=558007779745
NEXT_PUBLIC_META_PIXEL_ID=749747629712639
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
META_CAPI_ACCESS_TOKEN=EAAxxx (rotacionado)
RD_STATION_PUBLIC_TOKEN=xxx
KV_* (auto Upstash)

# NOVA — opcional, pra ativar vídeo
NEXT_PUBLIC_JOFI_VIDEO_URL=https://www.youtube.com/embed/XXX
```

---

## 🧪 Como validar a LP no ar

1. Abre `https://jofipet-quiz-lp.vercel.app/oferta` (modo anônimo)
2. Verifica:
   - [ ] Hero abre rápido (LCP <2s)
   - [ ] Botão "Falar com Nicole" abre WhatsApp com mensagem genérica
   - [ ] Scroll por todas as 11 seções sem layout quebrado
   - [ ] Cada um dos 4 cards de plano abre WhatsApp com mensagem **mencionando o plano clicado**
   - [ ] FAQ abre e fecha cada item
   - [ ] Sticky CTA aparece após scroll
   - [ ] Footer com CNPJ placeholder
3. Em DevTools → Network → verifica `gtag/collect` (GA event `lp_oferta_view`)
4. Em Meta Events Manager → Visão geral → procura `ViewContent` com `content_name: lp_oferta` aparecendo

---

## 🎯 Rodar A/B test com Quiz

### Setup no Meta Ads Manager

**Campanha:** "Lead Generation — Jofi Plano Pet"
**Ad Sets:** 2 com mesmo público, budget igual, **mesma criativa**

```
Ad Set A: Quiz                 Ad Set B: Oferta LP
─────────────────              ────────────────────
URL: https://jofipet-          URL: https://jofipet-quiz-lp.
quiz-lp.vercel.app/            vercel.app/oferta
?utm_source=meta               ?utm_source=meta
&utm_medium=cpc                &utm_medium=cpc
&utm_campaign=ab_test          &utm_campaign=ab_test
&utm_content=quiz              &utm_content=oferta_lp
```

### Métricas pra comparar (após 7-14 dias)

| KPI | Quiz | Oferta LP | Vencedor |
|-----|------|-----------|----------|
| CPL (custo por lead) | R$ ? | R$ ? | menor |
| CTR LP→Lead | ?% | ?% | maior |
| EAQ médio | 9.3 | ?.? | similar/maior |
| % leads quentes | ?% | n/a | quiz vence aqui (sem segmentação na LP) |
| Conversão Lead→Venda (Nicole) | ?% | ?% | maior |
| Taxa de WhatsApp resposta | ?% | ?% | maior |
| CAC final | R$ ? | R$ ? | menor |

### Decisão pós-teste

- **Quiz CPL maior mas conversão maior:** Quiz vence (mais qualificado)
- **Oferta CPL menor mas conversão menor:** Oferta vence se o ganho de volume > queda de qualidade
- **Pareto:** rodar ambos paralelamente, segmentar por persona (Quiz pra "exploradores", Oferta pra "decididos")

---

## 📊 Tracking events implementados (pra dashboard GA4)

Todos os eventos da LP /oferta carregam `variant: 'oferta_lp'`:

| Evento GA4 | Quando dispara |
|------------|----------------|
| `lp_oferta_view` | Mount da página |
| `lp_oferta_scroll` | 25/50/75/100% do scroll |
| `lp_oferta_video_play` | Play no vídeo |
| `lp_oferta_plan_click` | Clique em "Quero esse plano" |
| `lp_oferta_wa_click` | Qualquer botão WhatsApp (hero/mid/final/sticky) |
| `lp_oferta_faq_open` | Abrir item do FAQ |

Comparável com eventos do quiz funnel:
- `quiz_start` / `quiz_step_view` / `quiz_complete` / `generate_lead`

No GA4 Explore, criar relatório com filtro `variant = oferta_lp` vs `variant = quiz` lado a lado.
