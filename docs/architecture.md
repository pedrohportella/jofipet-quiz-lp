# Jofi Pet Quiz LP Architecture Document

**Status:** Draft v1.0
**Source:** [brief.md](brief.md), [prd.md](prd.md), [front-end-spec.md](front-end-spec.md)
**Gerado por:** @architect (via aiox-master), 2026-04-17
**Workflow:** greenfield-ui (Phase 4)

---

## 1. Template and Framework Selection

**Starter:** `create-next-app@14` com template TypeScript + Tailwind + App Router.

Comando de bootstrap canônico:
```bash
npx create-next-app@latest jofipet-quiz-lp \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --eslint
```

Sem starter de UI kit (shadcn/ui é copy-paste, integrado manualmente). Sem starter customizado da agência DC.

### Change Log

| Date | Version | Description | Author |
|---|---|---|---|
| 2026-04-17 | 1.0 | Initial architecture draft | @architect (aiox-master) |

---

## 2. Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|---|---|---|---|---|
| Framework | Next.js | 14.2.x | App Router + SSR + API Routes | LCP baixo, Edge Runtime, deploy Vercel nativo, padrão DC OS |
| Language | TypeScript | 5.4.x | Tipagem estática | Strict mode; reduz bugs AI-gen |
| UI Library | React | 18.3.x | Componentes | Padrão ecossistema Next.js |
| Component Library | shadcn/ui | latest | Primitivos Radix + Tailwind | Acessível, copy-paste, zero lock-in |
| Styling | Tailwind CSS | 3.4.x | Utility-first + tokens | Velocidade, design tokens consistentes |
| State Management | React useReducer + Context | built-in | Estado do quiz (session-scoped) | Suficiente; evita dependência externa |
| Routing | Next.js App Router | built-in | File-based routing | Nativo ao framework |
| Build Tool | Turbopack (dev) / Webpack (prod) | built-in | Bundle | Padrão Next.js 14 |
| Form Handling | React Hook Form | 7.51.x | Captura + validação | Performático, API minimalista |
| Schema Validation | Zod | 3.23.x | Schema forms + API contracts | Type-inference integrada com RHF |
| Animation | Framer Motion | 11.x | Transições quiz, stagger | Dynamic import p/ reduzir bundle |
| Input Masking | use-mask-input | 3.x | Máscara WhatsApp BR + CEP | Leve, hook-based |
| Icons | lucide-react | latest | Ícones funcionais | Padrão shadcn |
| Testing (Unit) | Vitest | 1.6.x | Test runner | Rápido, compatível Vite ecosystem |
| Testing (DOM) | React Testing Library | 15.x | Component tests | Padrão React |
| Testing (API mocks) | MSW | 2.x | Mock service worker | Testa integração com RD sem rede |
| E2E (pós-MVP) | Playwright | 1.44.x | E2E em CI | Multi-browser |
| Observability | Vercel Analytics + Sentry | latest | Performance + erros | Vercel nativo; Sentry já no `.env.example` workspace |
| Captcha | Cloudflare Turnstile | latest | Proteção spam | Gratuito, invisível |
| Queue/KV | Vercel KV | latest | Fallback RD + rate limit | Redis serverless, baixo custo |
| Cron | Vercel Cron Jobs | latest | Worker retry RD | Integrado ao `vercel.json` |
| Analytics | Meta Pixel + GA4 | latest | Tracking conversão | Requisito campanha |
| Analytics SDK | @next/third-parties | 14.x | GA4 performático | Oficial Next.js |
| CI | GitHub Actions | — | Lint, test, Lighthouse CI | Padrão GitHub |
| Lighthouse | `@lhci/cli` | 0.13.x | Quality gate no PR | Bloqueia regressão perf/a11y |
| Lint | ESLint + `eslint-plugin-jsx-a11y` | 9.x | Lint + a11y | Next.js preset |
| Format | Prettier | 3.x | Formatação | Config via `.prettierrc` |
| Git Hooks | Husky + lint-staged | latest | Pre-commit | Roda lint+typecheck+test |

---

## 3. Project Structure

```
projects/jofipet-quiz-lp/
├── .env.example               # Vars públicas e placeholders privados
├── .env.local                 # (gitignored) Dev local
├── .eslintrc.json             # eslint-config-next + jsx-a11y
├── .gitignore
├── .prettierrc
├── README.md
├── next.config.mjs            # Headers de segurança, images, experimental
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts         # Tokens Jofi (cores, fontes, spacing)
├── tsconfig.json              # strict: true; paths: @/*
├── vercel.json                # Crons, headers, rewrites
├── vitest.config.ts
├── lighthouserc.json          # Barras Lighthouse CI
├── docs/
│   ├── brief.md
│   ├── prd.md
│   ├── front-end-spec.md
│   ├── architecture.md        # (este arquivo)
│   ├── tracking-plan.md       # Taxonomy Meta + GA4 (Epic 4)
│   ├── qa/
│   │   └── manual-checklist.md
│   └── stories/               # Stories shardeadas pelo @po
├── config/
│   ├── quiz.json              # Definição das perguntas
│   ├── scoring.json           # Pesos e thresholds dos tiers
│   ├── results.json           # Templates de copy por tier
│   ├── content.json           # Copy da LP (hero, microcopy, artigos)
│   └── messages.json          # Template WhatsApp + fallbacks
├── public/
│   ├── robots.txt             # Disallow /admin, /opt-out
│   ├── manifest.webmanifest   # PWA-lite (opcional)
│   └── images/
│       └── hero-pet.svg       # Ilustração hero
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root: fontes, Meta Pixel, GA4, Providers
│   │   ├── page.tsx           # Hero /
│   │   ├── globals.css        # Tailwind directives + reset + tokens
│   │   ├── providers.tsx      # QuizProvider, TrackingProvider
│   │   ├── quiz/
│   │   │   └── [step]/
│   │   │       └── page.tsx   # Tela de pergunta dinâmica
│   │   ├── captura/
│   │   │   └── page.tsx
│   │   ├── resultado/
│   │   │   └── [tier]/
│   │   │       └── page.tsx   # tier: quente|morno|frio
│   │   ├── obrigado-sem-pet/
│   │   │   └── page.tsx
│   │   ├── privacidade/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx       # Middleware protege com basic auth
│   │   │   └── actions.ts     # Server actions: reenviar lead
│   │   ├── api/
│   │   │   ├── leads/
│   │   │   │   └── route.ts   # POST captura
│   │   │   ├── cron/
│   │   │   │   └── retry-leads/
│   │   │   │       └── route.ts
│   │   │   ├── opt-out/
│   │   │   │   └── route.ts
│   │   │   └── admin/
│   │   │       ├── leads/route.ts        # GET list
│   │   │       ├── resend/route.ts       # POST reenviar
│   │   │       └── queue-stats/route.ts  # GET stats
│   │   └── middleware.ts      # Basic auth /admin, rate limit light
│   ├── components/
│   │   ├── ui/                # shadcn/ui generated (Button, Input, Checkbox, Toast)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── checkbox.tsx
│   │   │   └── toast.tsx
│   │   ├── quiz/              # Custom quiz components
│   │   │   ├── Quiz.tsx                # Orquestra steps
│   │   │   ├── QuizStep.tsx            # Uma pergunta
│   │   │   ├── QuizOption.tsx          # Card de opção
│   │   │   ├── QuizProgressBar.tsx
│   │   │   ├── QuizBackButton.tsx
│   │   │   ├── QuizScaleInput.tsx
│   │   │   ├── QuizTextInput.tsx
│   │   │   └── QuizMultiChoice.tsx
│   │   ├── hero/
│   │   │   └── Hero.tsx
│   │   ├── capture/
│   │   │   ├── CaptureForm.tsx
│   │   │   └── LgpdConsent.tsx
│   │   ├── result/
│   │   │   ├── ResultHot.tsx
│   │   │   ├── ResultWarm.tsx
│   │   │   ├── ResultCold.tsx
│   │   │   └── ResultBullets.tsx
│   │   └── shared/
│   │       ├── Logo.tsx
│   │       ├── Footer.tsx
│   │       └── CookieBanner.tsx
│   ├── lib/
│   │   ├── quiz/
│   │   │   ├── loader.ts               # Lê config/quiz.json
│   │   │   ├── scoring.ts              # calculateTier pura
│   │   │   ├── types.ts                # QuizConfig, Answer, Tier
│   │   │   └── scoring.test.ts
│   │   ├── rd-station/
│   │   │   ├── client.ts               # Wrapper fetch RD Station
│   │   │   ├── mapper.ts               # Lead → RD payload
│   │   │   ├── types.ts
│   │   │   └── mapper.test.ts
│   │   ├── kv/
│   │   │   ├── queue.ts                # Enqueue/dequeue leads
│   │   │   ├── rate-limit.ts
│   │   │   └── leads-store.ts          # Para /admin list
│   │   ├── tracking/
│   │   │   ├── meta-pixel.ts           # fbq wrapper
│   │   │   ├── ga4.ts                  # gtag wrapper
│   │   │   ├── events.ts               # Event taxonomy
│   │   │   └── utms.ts                 # Captura e preserva UTMs
│   │   ├── turnstile/
│   │   │   └── verify.ts               # Validação server-side
│   │   ├── hmac/
│   │   │   └── sign.ts                 # Assinar link opt-out
│   │   ├── validation/
│   │   │   ├── whatsapp.ts             # Regex BR
│   │   │   └── schemas.ts              # Zod schemas
│   │   └── utils/
│   │       ├── cn.ts                   # clsx + tailwind-merge
│   │       └── format.ts               # Format telefone, nome
│   ├── hooks/
│   │   ├── useQuizState.ts             # Hook do QuizContext
│   │   ├── useUtms.ts
│   │   ├── useTracking.ts
│   │   └── useHaptic.ts
│   ├── context/
│   │   ├── QuizContext.tsx             # Provider + reducer
│   │   └── TrackingContext.tsx
│   ├── types/
│   │   ├── quiz.ts                     # Shared types (re-export de lib)
│   │   ├── lead.ts
│   │   └── env.d.ts                    # process.env tipado
│   ├── styles/
│   │   └── tokens.css                  # CSS custom properties (fallback)
│   └── test/
│       ├── setup.ts
│       ├── msw/
│       │   ├── handlers.ts
│       │   └── server.ts
│       └── fixtures/
│           ├── quiz-config.ts
│           └── answers.ts
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint + typecheck + test
│       └── lighthouse.yml      # Lighthouse CI em PR
└── .husky/
    └── pre-commit
```

---

## 4. Component Standards

### 4.1 Component Template

```tsx
// src/components/quiz/QuizOption.tsx
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useHaptic } from '@/hooks/useHaptic';

export interface QuizOptionProps {
  id: string;
  label: string;
  emoji?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  variant?: 'single' | 'multi';
}

export function QuizOption({
  id,
  label,
  emoji,
  selected,
  disabled = false,
  onSelect,
  variant = 'single',
}: QuizOptionProps) {
  const haptic = useHaptic();

  const handleClick = () => {
    if (disabled) return;
    haptic('light');
    onSelect(id);
  };

  return (
    <motion.button
      type="button"
      role={variant === 'single' ? 'radio' : 'checkbox'}
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.08 }}
      className={cn(
        'w-full min-h-[56px] px-4 rounded-2xl border border-neutral-300',
        'flex items-center gap-3 text-left text-base font-medium',
        'bg-white transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
        selected && 'border-primary bg-primary/10',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {emoji && <span className="text-2xl" aria-hidden="true">{emoji}</span>}
      <span className="flex-1 text-neutral-900">{label}</span>
      {selected && variant === 'multi' && (
        <Check className="h-5 w-5 text-primary" aria-hidden="true" />
      )}
    </motion.button>
  );
}
```

### 4.2 Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Component file | PascalCase `.tsx` | `QuizOption.tsx` |
| Component export | Named export, same name as file | `export function QuizOption()` |
| Hook file | camelCase starting with `use` | `useQuizState.ts` |
| Utility file | kebab-case | `meta-pixel.ts` |
| Test file | `.test.ts` / `.test.tsx` next to source | `scoring.test.ts` |
| Config JSON | kebab-case in `/config` | `quiz.json` |
| Route folder | kebab-case | `obrigado-sem-pet` |
| Route file | `page.tsx` / `route.ts` / `layout.tsx` | (Next.js convention) |
| Type alias | PascalCase, singular | `type Tier`, `interface Lead` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Env var (public) | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_META_PIXEL_ID` |
| Env var (server) | UPPER_SNAKE | `RD_STATION_TOKEN` |
| API route handler | `POST`, `GET` exportados | `export async function POST()` |
| Server Action | `export async function verb()` camelCase | `resendLead` |

---

## 5. State Management

### 5.1 Store Structure

Único contexto de estado para o quiz — escopo de sessão. Não há estado global de usuário (sem auth). Admin usa server components com fetch direto do KV.

```
src/context/
├── QuizContext.tsx     # Provider + reducer + hooks exports
└── TrackingContext.tsx # Contexto de UTMs + wrapper de eventos
```

State persistido em `sessionStorage` via middleware do reducer — resistente a reload.

### 5.2 State Management Template

```ts
// src/context/QuizContext.tsx
'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import type { QuizConfig, Answer, Tier } from '@/types/quiz';
import { calculateTier } from '@/lib/quiz/scoring';

type QuizState = {
  config: QuizConfig;
  currentStep: number;
  answers: Record<string, Answer>;
  startedAt: number | null;
  finishedAt: number | null;
  tier: Tier | null;
};

type QuizAction =
  | { type: 'START' }
  | { type: 'ANSWER'; questionId: string; answer: Answer }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

const SESSION_KEY = 'jofi-quiz-state-v1';

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return { ...state, startedAt: Date.now(), currentStep: 0 };
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case 'NEXT':
      return { ...state, currentStep: state.currentStep + 1 };
    case 'BACK':
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case 'FINISH': {
      const result = calculateTier(state.answers, state.config.scoring);
      return { ...state, finishedAt: Date.now(), tier: result.tier };
    }
    case 'RESET':
      return initialState(state.config);
    default:
      return state;
  }
}

function initialState(config: QuizConfig): QuizState {
  return {
    config,
    currentStep: 0,
    answers: {},
    startedAt: null,
    finishedAt: null,
    tier: null,
  };
}

function loadPersisted(config: QuizConfig): QuizState {
  if (typeof window === 'undefined') return initialState(config);
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return initialState(config);
  try {
    return { ...JSON.parse(raw), config };
  } catch {
    return initialState(config);
  }
}

type QuizContextValue = {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
};

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({
  config,
  children,
}: {
  config: QuizConfig;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, config, loadPersisted);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuizState() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuizState must be used inside QuizProvider');
  return ctx;
}
```

---

## 6. API Integration

### 6.1 RD Station Client Template

```ts
// src/lib/rd-station/client.ts
import type { RdConversionPayload, RdResponse } from './types';

const RD_ENDPOINT =
  'https://api.rd.services/platform/conversions';

export class RdStationError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    public correlationId: string,
  ) {
    super(`RD Station error ${status}`);
    this.name = 'RdStationError';
  }
}

export async function sendConversion(
  payload: RdConversionPayload,
  opts: { token: string; correlationId: string; timeoutMs?: number },
): Promise<RdResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 5000,
  );

  try {
    const res = await fetch(RD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.token}`,
        'X-Correlation-Id': opts.correlationId,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new RdStationError(res.status, body, opts.correlationId);
    }

    return body as RdResponse;
  } finally {
    clearTimeout(timeout);
  }
}
```

### 6.2 `/api/leads` Route Handler

```ts
// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { sendConversion, RdStationError } from '@/lib/rd-station/client';
import { mapLeadToRdPayload } from '@/lib/rd-station/mapper';
import { enqueueLead, storeLead } from '@/lib/kv/queue';
import { verifyTurnstile } from '@/lib/turnstile/verify';
import { rateLimit } from '@/lib/kv/rate-limit';
import { LeadPayloadSchema } from '@/lib/validation/schemas';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const correlationId = randomUUID();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const rl = await rateLimit(`leads:${ip}`, { max: 10, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, reason: 'rate_limited', correlationId },
      { status: 429 },
    );
  }

  let parsed: z.infer<typeof LeadPayloadSchema>;
  try {
    const body = await req.json();
    parsed = LeadPayloadSchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      { success: false, reason: 'invalid_payload', correlationId },
      { status: 400 },
    );
  }

  const turnstileOk = await verifyTurnstile(parsed.turnstile_token, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { success: false, reason: 'turnstile_failed', correlationId },
      { status: 400 },
    );
  }

  const leadId = randomUUID();
  const rdPayload = mapLeadToRdPayload(parsed, { leadId });

  await storeLead({ ...parsed, leadId, correlationId, receivedAt: Date.now() });

  try {
    await sendConversion(rdPayload, {
      token: process.env.RD_STATION_TOKEN!,
      correlationId,
    });
    return NextResponse.json({
      success: true,
      leadId,
      correlationId,
      queued: false,
    });
  } catch (err) {
    if (err instanceof RdStationError && err.status < 500) {
      console.error(
        JSON.stringify({ event: 'rd_4xx', correlationId, status: err.status }),
      );
      // 4xx não vai para queue — bug nosso
      return NextResponse.json(
        {
          success: true, // usuário não percebe; logamos para fix
          leadId,
          correlationId,
          queued: false,
          warning: 'rd_rejected',
        },
        { status: 200 },
      );
    }
    await enqueueLead({ leadId, payload: rdPayload, correlationId });
    return NextResponse.json({
      success: true,
      leadId,
      correlationId,
      queued: true,
    });
  }
}
```

### 6.3 Zod Schema (API contract)

```ts
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const WhatsappSchema = z
  .string()
  .regex(/^\(\d{2}\)\s9\d{4}-\d{4}$/, 'WhatsApp inválido (use formato BR)');

export const LeadPayloadSchema = z.object({
  name: z.string().min(2).max(80),
  whatsapp: WhatsappSchema,
  email: z.string().email().optional(),
  consent: z.literal(true), // LGPD obrigatório
  tier: z.enum(['quente', 'morno', 'frio']),
  answers: z.record(
    z.union([z.string(), z.number(), z.array(z.string())]),
  ),
  utms: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
    })
    .partial(),
  turnstile_token: z.string().min(1),
  variant: z.string().optional(), // A/B
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;
```

### 6.4 RD Station Payload Mapping

```ts
// src/lib/rd-station/mapper.ts
import type { LeadPayload } from '@/lib/validation/schemas';
import type { RdConversionPayload } from './types';

export function mapLeadToRdPayload(
  lead: LeadPayload,
  ctx: { leadId: string },
): RdConversionPayload {
  return {
    event_type: 'CONVERSION',
    event_family: 'CDP',
    payload: {
      conversion_identifier: `jofipet-quiz-${lead.tier}`,
      name: lead.name,
      email: lead.email ?? `lead-${ctx.leadId}@no-email.jofipet.local`,
      mobile_phone: normalizePhoneBR(lead.whatsapp),
      cf_lead_id: ctx.leadId,
      cf_quiz_tier: lead.tier,
      cf_quiz_variant: lead.variant ?? 'default',
      cf_utm_source: lead.utms.utm_source ?? '',
      cf_utm_medium: lead.utms.utm_medium ?? '',
      cf_utm_campaign: lead.utms.utm_campaign ?? '',
      cf_utm_content: lead.utms.utm_content ?? '',
      cf_utm_term: lead.utms.utm_term ?? '',
      cf_quiz_answers: JSON.stringify(lead.answers),
      tags: [`lead-${lead.tier}`, 'quiz-jofipet'],
    },
  };
}

function normalizePhoneBR(masked: string): string {
  // "(11) 91234-5678" → "+5511912345678"
  const digits = masked.replace(/\D/g, '');
  return `+55${digits}`;
}
```

**Observação RD:** Quando email não for informado, geramos placeholder `lead-{uuid}@no-email.jofipet.local` para evitar bloqueio do RD (que exige email como identificador). Esse domínio é inexistente por design — RD envia como inválido mas mantém o registro com `mobile_phone` como identificador real. Confirmar comportamento em staging com Pedro.

---

## 7. Routing

### 7.1 Route Configuration

Next.js App Router cobre tudo via file-system. Middleware adicional:

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USER = process.env.ADMIN_USER ?? '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const ADMIN_ENABLED = process.env.ADMIN_PANEL_ENABLED === 'true';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!ADMIN_ENABLED) return NextResponse.rewrite(new URL('/404', req.url));

    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Basic ')) return unauthorized();

    const [user, pass] = atob(auth.slice(6)).split(':');
    if (user !== ADMIN_USER || pass !== ADMIN_PASSWORD) return unauthorized();
  }

  return NextResponse.next();
}

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="admin"' },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 7.2 Protected Routes

| Route | Protection |
|---|---|
| `/admin/*` | Basic Auth via middleware + feature flag `ADMIN_PANEL_ENABLED` |
| `/api/admin/*` | Basic Auth header obrigatório (mesmo esquema) |
| `/api/cron/retry-leads` | Vercel Cron assinado automaticamente + check `Authorization: Bearer $CRON_SECRET` |
| `/api/opt-out` | Token HMAC no query string; invalida se assinatura não bate |

---

## 8. Styling Guidelines

### 8.1 Styling Approach

**Tailwind CSS utility-first** como linguagem única. Tokens em `tailwind.config.ts` + fallback `tokens.css` para valores usados fora do Tailwind (ex.: inline styles de SVG gerados dinamicamente). shadcn/ui copy-paste mantém estilos via Tailwind — sem CSS-in-JS.

### 8.2 Tailwind Config (tokens Jofi)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A59', // Coral Jofi
          50: '#FFF1ED',
          100: '#FFE0D5',
          500: '#FF7A59',
          600: '#E3594A',
        },
        secondary: { DEFAULT: '#FFF7F0' },
        accent: { DEFAULT: '#FFD66B' },
        success: { DEFAULT: '#4CAF82' },
        warning: { DEFAULT: '#FFA83D' },
        error: { DEFAULT: '#E3594A' },
        whatsapp: { DEFAULT: '#25D366' },
        neutral: {
          100: '#F6F2EE',
          300: '#DDD4CE',
          500: '#8D847E',
          700: '#5C524C',
          900: '#2D2520',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', ...fontFamily.sans],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      maxWidth: {
        mobile: '420px',
        desktop: '600px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

### 8.3 Global Theme Variables

```css
/* src/styles/tokens.css */
:root {
  --color-primary: 255 122 89;
  --color-secondary: 255 247 240;
  --color-neutral-900: 45 37 32;
  --radius-card: 16px;
  --duration-fast: 150ms;
  --duration-base: 280ms;
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Testing Requirements

### 9.1 Component Test Template

```ts
// src/lib/quiz/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTier } from './scoring';
import quizConfig from '../../../config/scoring.json';

describe('calculateTier', () => {
  it('classifies perfect answers as quente', () => {
    const answers = {
      'pet-ativo': 'sim',
      'especie': 'cao',
      'idade': 'adulto',
      'ultima-vet': 'menos-1-mes',
      'gasto-mensal': '250',
      'preocupacao': 'saude',
      'plano-atual': 'nao',
      'cep': '01310-100',
    };
    const result = calculateTier(answers, quizConfig);
    expect(result.tier).toBe('quente');
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('skips scoring and marks eliminated for no pet', () => {
    const result = calculateTier({ 'pet-ativo': 'nao' }, quizConfig);
    expect(result.tier).toBe('frio');
    expect(result.eliminated).toBe(true);
  });

  it('is deterministic across runs', () => {
    const answers = { 'pet-ativo': 'sim', 'especie': 'gato', idade: 'filhote' };
    const a = calculateTier(answers, quizConfig);
    const b = calculateTier(answers, quizConfig);
    expect(a).toEqual(b);
  });
});
```

```tsx
// src/components/quiz/QuizOption.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuizOption } from './QuizOption';

describe('<QuizOption>', () => {
  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(
      <QuizOption id="cao" label="Cão" emoji="🐶" selected={false} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Cão' }));
    expect(onSelect).toHaveBeenCalledWith('cao');
  });

  it('applies selected styles when selected=true', () => {
    render(
      <QuizOption id="cao" label="Cão" selected={true} onSelect={() => {}} />,
    );
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('does not trigger onSelect when disabled', async () => {
    const onSelect = vi.fn();
    render(
      <QuizOption id="cao" label="Cão" disabled selected={false} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole('radio'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

### 9.2 Testing Best Practices

1. **Unit Tests:** Componentes em isolamento + lib functions puras (scoring, mappers, validation)
2. **Integration Tests:** Fluxo completo de captura → API → RD via MSW; funil de fallback → queue
3. **E2E (pós-MVP):** Playwright cobrindo happy path quente, morno, frio, eliminação
4. **Coverage Goals:** 80% overall, 95% em `src/lib/` (lógica crítica)
5. **Test Structure:** Arrange-Act-Assert obrigatório
6. **Mock External:** MSW para RD Station, Turnstile, Vercel KV (local mock via `ioredis-mock` se necessário)

---

## 10. Environment Configuration

### 10.1 `.env.example`

```bash
# Public (bundle-side, expostos ao client)
NEXT_PUBLIC_META_PIXEL_ID=000000000000000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_JOFI_WHATSAPP=5511900000000
NEXT_PUBLIC_SERENINHO_CHECKOUT_URL=https://checkout.jofipet.com.br/sereninho
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x0000000000000000
NEXT_PUBLIC_SITE_URL=https://quiz.jofipet.com.br

# Server-only (nunca expostos)
RD_STATION_TOKEN=                      # Token OAuth/API do RD Station Marketing
TURNSTILE_SECRET_KEY=
CRON_SECRET=                           # Gerado no Vercel, bate com header do cron
ADMIN_USER=pedro
ADMIN_PASSWORD=                        # gerar forte; rotate periódico
ADMIN_PANEL_ENABLED=true
HMAC_SECRET=                           # 32+ bytes hex para assinar opt-out
SENTRY_DSN=                            # Opcional MVP; integrar no Epic 4

# Vercel KV (injetadas automaticamente pelo Vercel ao conectar KV store)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### 10.2 Env Var Typing

```ts
// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_META_PIXEL_ID: string;
    NEXT_PUBLIC_GA_ID: string;
    NEXT_PUBLIC_JOFI_WHATSAPP: string;
    NEXT_PUBLIC_SERENINHO_CHECKOUT_URL: string;
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
    NEXT_PUBLIC_SITE_URL: string;
    RD_STATION_TOKEN: string;
    TURNSTILE_SECRET_KEY: string;
    CRON_SECRET: string;
    ADMIN_USER: string;
    ADMIN_PASSWORD: string;
    ADMIN_PANEL_ENABLED: 'true' | 'false';
    HMAC_SECRET: string;
    SENTRY_DSN?: string;
  }
}
```

---

## 11. Config JSON Schemas

### 11.1 `config/quiz.json`

```jsonc
{
  "$schema": "./quiz.schema.json",
  "version": "2026-04-17",
  "questions": [
    {
      "id": "pet-ativo",
      "type": "single-choice",
      "text": "Você tem pet?",
      "emoji": "🐾",
      "eliminatesOnNo": true,
      "options": [
        { "id": "sim", "label": "Sim, tenho!" },
        { "id": "nao", "label": "Ainda não tenho" }
      ]
    },
    {
      "id": "especie",
      "type": "single-choice",
      "text": "Qual a espécie do seu pequeno?",
      "emoji": "🐶",
      "options": [
        { "id": "cao", "label": "Cão", "emoji": "🐶" },
        { "id": "gato", "label": "Gato", "emoji": "🐱" },
        { "id": "outro", "label": "Outro", "emoji": "🐾" }
      ]
    },
    {
      "id": "idade",
      "type": "single-choice",
      "text": "Qual a idade do seu pet?",
      "options": [
        { "id": "filhote", "label": "Filhote (até 1 ano)", "emoji": "🐣" },
        { "id": "adulto", "label": "Adulto (1-7 anos)", "emoji": "🐕" },
        { "id": "idoso", "label": "Idoso (7+ anos)", "emoji": "👴" }
      ]
    },
    {
      "id": "ultima-vet",
      "type": "single-choice",
      "text": "Quando foi a última ida ao vet?",
      "options": [
        { "id": "menos-1-mes", "label": "Há menos de 1 mês" },
        { "id": "1-6-meses", "label": "De 1 a 6 meses" },
        { "id": "mais-6-meses", "label": "Mais de 6 meses" },
        { "id": "nunca", "label": "Nunca levei" }
      ]
    },
    {
      "id": "gasto-mensal",
      "type": "scale",
      "text": "Quanto você gasta por mês com seu pet hoje?",
      "min": 0,
      "max": 500,
      "step": 20,
      "prefix": "R$ ",
      "suffix": "/mês"
    },
    {
      "id": "preocupacao",
      "type": "single-choice",
      "text": "O que mais te preocupa hoje?",
      "options": [
        { "id": "saude", "label": "Saúde e imprevistos", "emoji": "🩺" },
        { "id": "custo", "label": "Custo das consultas", "emoji": "💰" },
        { "id": "rotina", "label": "Rotina de cuidado", "emoji": "📅" },
        { "id": "tudo-bem", "label": "Está tudo ok", "emoji": "✨" }
      ]
    },
    {
      "id": "plano-atual",
      "type": "single-choice",
      "text": "Você tem plano pet hoje?",
      "options": [
        { "id": "nao", "label": "Não tenho" },
        { "id": "sim-outro", "label": "Tenho de outra empresa" },
        { "id": "sim-jofi", "label": "Já sou cliente Jofi" }
      ]
    },
    {
      "id": "cep",
      "type": "text-input",
      "text": "Qual seu CEP? (pra ver vets perto)",
      "mask": "cep",
      "skipAllowed": true
    }
  ]
}
```

### 11.2 `config/scoring.json`

```jsonc
{
  "version": "2026-04-17",
  "axes": ["pet_ativo", "gasto", "dor", "cobertura"],
  "thresholds": {
    "quente": 70,
    "morno": 40
  },
  "rules": [
    {
      "questionId": "pet-ativo",
      "axis": "pet_ativo",
      "weights": { "sim": 0, "nao": -999 },
      "notes": "Eliminatório: -999 força tier=frio via flag eliminated"
    },
    {
      "questionId": "idade",
      "axis": "dor",
      "weights": { "filhote": 5, "adulto": 15, "idoso": 25 }
    },
    {
      "questionId": "ultima-vet",
      "axis": "dor",
      "weights": {
        "menos-1-mes": 20,
        "1-6-meses": 12,
        "mais-6-meses": 5,
        "nunca": 8
      }
    },
    {
      "questionId": "gasto-mensal",
      "axis": "gasto",
      "type": "numeric-range",
      "ranges": [
        { "max": 50, "score": 5 },
        { "max": 100, "score": 10 },
        { "max": 200, "score": 20 },
        { "max": 10000, "score": 25 }
      ]
    },
    {
      "questionId": "preocupacao",
      "axis": "dor",
      "weights": { "saude": 15, "custo": 12, "rotina": 8, "tudo-bem": 2 }
    },
    {
      "questionId": "plano-atual",
      "axis": "gasto",
      "weights": { "nao": 15, "sim-outro": 8, "sim-jofi": -50 }
    },
    {
      "questionId": "cep",
      "axis": "cobertura",
      "type": "cep-coverage",
      "coveredScore": 15,
      "notCoveredScore": 3,
      "skippedScore": 5,
      "coverageList": "config/cep-coverage.json"
    }
  ]
}
```

### 11.3 `config/results.json`

```jsonc
{
  "quente": {
    "icon": "🔥",
    "headline": "{nome}, seu {especie_label} precisa de atenção!",
    "bullets": [
      "Pet {idade_label} com rotina vet ativa — risco alto de imprevisto financeiro",
      "{plano_label} — cada visita é avulsa",
      "Você está na cobertura da nossa rede ❤️"
    ],
    "subcopy": "A Jofi pode te ajudar hoje mesmo.",
    "cta": { "type": "whatsapp", "label": "Falar com a Jofi agora 💬" }
  },
  "morno": {
    "icon": "🟡",
    "headline": "{nome}, tem uma forma econômica de começar",
    "bullets": ["...", "...", "..."],
    "subcopy": "Conhece o Sereninho?",
    "cta": { "type": "sereninho", "label": "Assinar Sereninho por R$49,90 →" },
    "ctaSecondary": { "type": "newsletter", "label": "ou receba dicas grátis por email" }
  },
  "frio": {
    "icon": "🔵",
    "headline": "Obrigada por responder, {nome}! 💛",
    "bullets": [
      "Separamos 3 conteúdos pra você e seu pet:"
    ],
    "cta": { "type": "articles", "articles": ["art-sinais-vet", "art-alimentacao", "art-brincadeiras"] },
    "ctaSecondary": { "type": "newsletter", "label": "Receber dicas por email 💌" }
  }
}
```

### 11.4 `config/content.json`

```jsonc
{
  "hero": {
    "headline": "Seu pet merece o melhor cuidado.",
    "subheadline": "Responda 6 perguntas e descubra o plano ideal para ele.",
    "cta": "Descobrir meu plano ideal 🐾",
    "socialProof": "+500 tutores já descobriram",
    "expectation": "~90s para completar"
  },
  "capture": {
    "headline": "Quase lá! 🎉",
    "subheadline": "Deixa a gente te enviar seu resultado personalizado",
    "lgpdText": "Concordo em receber contato da Jofi. Veja nossa",
    "lgpdLinkText": "política de privacidade",
    "reassurance": "🔒 Seus dados estão seguros com a gente",
    "cta": "Ver meu resultado 🐾"
  },
  "noPet": {
    "headline": "Poxa, a Jofi é pra quem tem pet. 🐾",
    "subheadline": "Mas quem sabe você não conhece alguém que curtiria saber disso?",
    "cta": "Compartilhar com um amigo 💛"
  },
  "articles": [
    { "id": "art-sinais-vet", "title": "5 sinais que seu pet precisa de vet", "url": "https://blog.jofipet.com.br/sinais-vet", "emoji": "📖" },
    { "id": "art-alimentacao", "title": "O que evitar na alimentação", "url": "https://blog.jofipet.com.br/alimentacao", "emoji": "🍽️" },
    { "id": "art-brincadeiras", "title": "Brincadeiras seguras pro seu pet", "url": "https://blog.jofipet.com.br/brincadeiras", "emoji": "🎾" }
  ]
}
```

### 11.5 `config/messages.json`

```jsonc
{
  "whatsappQuente": "Oi Jofi! 🐾 Sou {nome}, acabei de fazer o quiz e descobri que preciso cuidar melhor do meu {especie_label}. Minha maior preocupação é {preocupacao_label}. Pode me ajudar? (lead-id: {leadId}, utm: {utm_source})"
}
```

---

## 12. KV Queue Strategy

### 12.1 Key Schema

| Namespace | Key pattern | TTL | Purpose |
|---|---|---|---|
| `lead:store` | `lead:{leadId}` | 30 dias | Audit trail pós-submit (feed do /admin) |
| `queue:active` | `queue:active:{leadId}` | 7 dias | Leads aguardando retry RD |
| `queue:dead` | `queue:dead:{leadId}` | 30 dias | 6 falhas — requer intervenção manual |
| `rate:leads` | `rate:leads:{ip}` | 600s | Rate limit counter |
| `rate:cron` | `rate:cron:lock` | 240s | Lock do worker cron (evita overlap) |
| `opt-out` | `opt-out:{email_hash}` | ∞ | Denylist opt-out |

### 12.2 Cron Worker

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/retry-leads",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

```ts
// src/app/api/cron/retry-leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { drainQueue, tickRetry } from '@/lib/kv/queue';

export const runtime = 'nodejs'; // Node p/ acesso a crypto do KV

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const batch = await drainQueue({ batchSize: 50 });
  const results = await Promise.allSettled(batch.map(tickRetry));

  return NextResponse.json({
    attempted: batch.length,
    fulfilled: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  });
}
```

Backoff: tentativa N → delay `2^N * 60s` (max 6 tentativas = até 64min; aborta e move para `queue:dead`).

---

## 13. Tracking Plan (resumo; detalhe em `docs/tracking-plan.md` — Story 4.1)

### 13.1 Meta Pixel Events

| Event | Trigger | Parameters |
|---|---|---|
| `PageView` | Mount de qualquer rota | (automático) |
| `ViewContent` | Entrada em `/quiz/[n]` | `content_name`, `content_category: 'quiz_step'` |
| `Lead` | Response 200 de `/api/leads` | `value: 0`, `currency: 'BRL'`, `content_name: tier` |
| `CompleteRegistration` | Mesmo gatilho de `Lead` | `registration_method: 'quiz'` |
| `InitiateCheckout` | Click CTA em resultado (quente ou morno) | `content_name`, `value: 49.90` (morno) |

### 13.2 GA4 Events

| Event | Parameters |
|---|---|
| `quiz_start` | `variant`, `utm_source` |
| `quiz_answer` | `question_id`, `answer_value`, `step_number` |
| `quiz_abandon` | `last_question_id`, `step_number`, `time_spent_sec` |
| `quiz_complete` | `tier`, `score`, `duration_sec` |
| `generate_lead` | `tier`, `has_email: boolean` |
| `whatsapp_click` | `tier`, `utm_source` |
| `sereninho_click` | `utm_source` |

Custom definitions no GA4: registrar `tier`, `variant`, `question_id` como event-scoped custom dimensions.

---

## 14. Security

### 14.1 Defenses

- **Rate limit** por IP (10/10min) no `/api/leads` via KV counter
- **Cloudflare Turnstile** invisível em `/api/leads`
- **Auth básica** em `/admin` + feature flag
- **CRON_SECRET** obrigatório em headers do Vercel Cron
- **HMAC** no query string dos links de opt-out (impossível forjar sem `HMAC_SECRET`)
- **Security headers** em `next.config.mjs`:
  ```js
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  }
  ```
- **CSP** (Content Security Policy) permissiva para Meta/GA/Turnstile — definir exato na Story 4.3

### 14.2 LGPD

- Consent explícito pré-submit (checkbox obrigatório, não pré-marcado)
- Política de privacidade `/privacidade` referenciada no footer + captura
- Email pós-submit (via RD) inclui link de opt-out assinado HMAC
- Cookie banner para Meta/GA (recusa bloqueia scripts)
- Endpoint `/api/opt-out` remove do RD + adiciona tag `opt-out` + registra na KV denylist
- Campos sensíveis nunca logados em Vercel logs (sanitizer em `console.log` wrappers)

---

## 15. Deploy Strategy

### 15.1 Environments

| Env | Branch | Domínio | Data source |
|---|---|---|---|
| Production | `main` | `quiz.jofipet.com.br` | Vercel KV prod + RD Station produção |
| Preview | Qualquer PR | `*.vercel.app` | KV preview (isolado) + RD staging (se disponível) |
| Local | — | `localhost:3000` | KV emulator (ioredis-mock) + RD mock via MSW |

### 15.2 Deploy Flow

1. Push para branch → Vercel preview deploy automático
2. Lighthouse CI roda no preview URL; bloqueia merge se regredir
3. CodeRabbit review (light mode) dispara em PR (convenção DC OS)
4. Merge `main` → auto-deploy production
5. Rollback instantâneo via Vercel "Promote to Production" de deploy anterior

### 15.3 DNS

`quiz.jofipet.com.br` via CNAME → `cname.vercel-dns.com`. SSL automático. Propagação ~15min.

---

## 16. Critical Coding Rules

1. **Nunca usar `any`** — `unknown` + narrow. Exceção: libs sem types (documentar em comentário single-line).
2. **Nunca expor token** — Qualquer env sem prefixo `NEXT_PUBLIC_` é server-only. Lint custom em CI para proibir acesso a `RD_STATION_TOKEN` fora de `src/app/api/` ou `src/lib/rd-station/`.
3. **Nunca `useEffect` para data-fetching** — use Server Components ou route handlers. `useEffect` é para side effects de DOM/subscriptions apenas.
4. **Nunca alterar state dentro de render** — sem `setState` fora de handlers ou effects.
5. **API routes sempre retornam `NextResponse.json`** com `{ success, correlationId, ...rest }` — padrão estrito para observabilidade.
6. **Toda chamada externa tem timeout** explícito (AbortController ou similar) — máx 5s default.
7. **Não usar `window` em código que pode rodar em SSR** — checar `typeof window !== 'undefined'` ou usar `'use client'`.
8. **Imports absolutos** via alias `@/` — nunca `../../../`.
9. **Componentes do quiz são `'use client'`** — interativos. Hero, privacidade, obrigado-sem-pet podem ser Server Components.
10. **Zero `console.log` em produção** — usar `console.error` apenas para erros capturados. Remover `console.log` em pre-commit via ESLint `no-console: ['error', { allow: ['error', 'warn'] }]`.
11. **Máscara BR é canônica** — `(XX) 9XXXX-XXXX`. Qualquer validação fora desse formato é bug.
12. **A11y obrigatória** — todo elemento interativo tem `aria-*` explícito; rode `axe` em dev.
13. **Config JSON é read-only em runtime** — nunca mutar, sempre deep clone se precisar derivar.
14. **Scoring é função pura** — sem I/O, sem randomness. Testável com input/output fixo.
15. **Commits no formato `feat:`, `fix:`, `docs:`** com referência à story `[Story N.N]` quando aplicável.

---

## 17. Quick Reference

### 17.1 Commands

```bash
# Setup inicial
cd projects/jofipet-quiz-lp
pnpm install                  # ou npm/yarn — alinhar com Pedro
pnpm dev                      # localhost:3000 com Turbopack

# Qualidade
pnpm lint                     # ESLint
pnpm typecheck                # tsc --noEmit
pnpm test                     # Vitest watch
pnpm test:ci                  # Vitest run + coverage
pnpm test:e2e                 # Playwright (pós-MVP)

# Build
pnpm build                    # next build
pnpm start                    # next start (local prod)

# Deploy
git push                      # Vercel auto-deploy preview/prod
```

### 17.2 Key Imports

```ts
import { useQuizState } from '@/hooks/useQuizState';
import { calculateTier } from '@/lib/quiz/scoring';
import { sendConversion } from '@/lib/rd-station/client';
import { trackEvent } from '@/lib/tracking/events';
import { cn } from '@/lib/utils/cn';
import type { LeadPayload } from '@/lib/validation/schemas';
```

### 17.3 File Naming Cheat Sheet

| Need | Where | Example |
|---|---|---|
| New quiz component | `src/components/quiz/*.tsx` | `QuizScaleInput.tsx` |
| Lib function | `src/lib/{domain}/*.ts` | `src/lib/quiz/scoring.ts` |
| API route | `src/app/api/{resource}/route.ts` | `src/app/api/leads/route.ts` |
| New page | `src/app/{route}/page.tsx` | `src/app/privacidade/page.tsx` |
| Zod schema | `src/lib/validation/schemas.ts` | add export |
| Config JSON | `config/{domain}.json` | `config/quiz.json` |

---

## 18. Open Questions / Assumptions to Validate

1. RD Station usa API token simples ou OAuth2 client_credentials? Confirmar com Pedro na Story 2.3.
2. Endpoint `/platform/conversions` aceita o payload proposto em §6.4 sem custom fields prévios configurados no RD? Validar em staging.
3. Número WhatsApp Jofi oficial + mensagem aprovada com cliente (escopo da Story 3.2).
4. URL exata do checkout Sereninho (Story 3.3).
5. Lista de CEPs/cidades com cobertura veterinária — requer dataset da Jofi. Fallback: pergunta auto-declarada + score neutro.
6. Domínio final (`quiz.jofipet.com.br` vs `qualifica.jofipet.com.br`) — decisão de marca/SEO com Pedro.
7. Paleta/tipografia confirmadas com DM (§6.2–6.3 do UX spec são proposta).

Nenhuma dessas bloqueia o início do Epic 1 — todas são resolvidas antes do merge das stories que as dependem.

---

## 19. Next Steps

1. @po valida este doc + PRD + UX spec contra `po-master-checklist`
2. @po sharda PRD em stories individuais em `docs/stories/` (15 stories)
3. @sm pega primeira story (`1.1-bootstrap-next-vercel.md`)
4. @dev implementa cada story com CodeRabbit self-healing (light mode, max 2 iterações)
5. @qa QA gate por story
6. @devops cria repo GitHub e Vercel project (Story 1.1) — **única fase que @devops é exclusivo**
