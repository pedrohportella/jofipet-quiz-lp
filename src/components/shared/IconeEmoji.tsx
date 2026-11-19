import {
  CalendarDays,
  Cake,
  Cat,
  Check,
  ClipboardList,
  Dog,
  Egg,
  Flame,
  Hand,
  Heart,
  Hourglass,
  type LucideIcon,
  Lock,
  MapPin,
  MessageCircle,
  PartyPopper,
  PawPrint,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  ThumbsUp,
  Wallet,
} from 'lucide-react';

/**
 * Ícone de linha no lugar de emoji, na interface (design system da Jofi: ícone de linha, traço
 * arredondado, estilo Lucide; "sem emoji nas peças").
 *
 * Só desenha: o dado continua com o emoji. `config/quiz.json` e `format-answer.ts` seguem mandando
 * o emoji para o RD Station e para o resumo do WhatsApp, e mexer neles muda o que o time lê.
 */
const MAPA: Record<string, LucideIcon> = {
  '🐾': PawPrint,
  '📍': MapPin,
  '🐶': Dog,
  '🐕': Dog,
  '🐱': Cat,
  '🎂': Cake,
  '🐣': Egg,
  '👴': Hourglass,
  '🩺': Stethoscope,
  '💰': Wallet,
  '💭': MessageCircle,
  '📅': CalendarDays,
  '✨': Sparkles,
  '🌟': Sparkles,
  '📋': ClipboardList,
  '🎉': PartyPopper,
  '🔥': Flame,
  '🌻': Sun,
  '💙': Heart,
  '💛': Heart,
  '👋': Hand,
  '🔒': Lock,
  '⭐': Star,
  '👍': ThumbsUp,
  '✓': Check,
  '✅': Check,
};

export function IconeEmoji({
  emoji,
  className = 'h-6 w-6',
  fallback = true,
}: {
  emoji: string;
  className?: string;
  /** Emoji que não está no mapa vira a patinha; `false` não desenha nada. */
  fallback?: boolean;
}) {
  const Icone = MAPA[emoji.trim()] ?? (fallback ? PawPrint : null);
  if (!Icone) return null;
  return <Icone className={className} strokeWidth={2.2} aria-hidden="true" />;
}
