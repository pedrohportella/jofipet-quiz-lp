import { z } from 'zod';

const TIER_VALUES = ['quente', 'morno', 'frio'] as const;
const ANSWER_VALUE = z.union([z.string(), z.number(), z.array(z.string())]);

const WHATSAPP_BR_REGEX = /^\(\d{2}\)\s?9?\d{4}-\d{4}$/;
const NAME_REGEX = /^[\p{L}\s'-]{2,80}$/u;

export const CaptureFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Conta o nome inteiro, vai 🐾')
    .max(80, 'Nome muito longo')
    .regex(NAME_REGEX, 'Só letras, espaço, hífen e apóstrofo'),
  whatsapp: z
    .string()
    .regex(WHATSAPP_BR_REGEX, 'Ops, o WhatsApp parece incompleto 🐾'),
  email: z
    .string()
    .email('Esse email não tá certinho')
    .or(z.literal(''))
    .optional(),
  consent: z
    .boolean()
    .refine((v) => v === true, {
      message: 'Precisamos do consentimento pra te contatar 💛',
    }),
});

export type CaptureFormValues = z.infer<typeof CaptureFormSchema>;

export const LeadPayloadSchema = z.object({
  name: z.string().min(2).max(80),
  whatsapp: z.string().regex(WHATSAPP_BR_REGEX),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  consent: z.literal(true),
  tier: z.enum(TIER_VALUES),
  score: z.number(),
  breakdown: z.object({
    pet_ativo: z.number(),
    gasto: z.number(),
    dor: z.number(),
    cobertura: z.number(),
  }),
  answers: z.record(z.string(), ANSWER_VALUE),
  utms: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
    })
    .partial()
    .optional(),
  turnstileToken: z.string().optional(),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;

export const LeadResponseSuccessSchema = z.object({
  success: z.literal(true),
  leadId: z.string(),
  correlationId: z.string(),
  warning: z.string().optional(),
});

export const LeadResponseErrorSchema = z.object({
  success: z.literal(false),
  reason: z.string(),
  correlationId: z.string(),
});

export type LeadResponseSuccess = z.infer<typeof LeadResponseSuccessSchema>;
export type LeadResponseError = z.infer<typeof LeadResponseErrorSchema>;

export function normalizeWhatsappToE164(local: string): string {
  const digits = local.replace(/\D/g, '');
  return `+55${digits}`;
}
