'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ShareButtonProps {
  label: string;
  text: string;
  url?: string;
  className?: string;
}

export function ShareButton({
  label,
  text,
  url,
  className,
}: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl =
      url ??
      (typeof window !== 'undefined' ? window.location.origin : undefined);

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({ title: 'Jofi Pet', text, url: shareUrl });
        return;
      } catch {
        // usuário cancelou — não é erro
      }
    }

    if (shareUrl) {
      const fallback = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
      window.open(fallback, '_blank', 'noopener');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        'flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white shadow-sm',
        'transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
        className,
      )}
    >
      <Share2 className="h-5 w-5" aria-hidden="true" />
      {label}
    </button>
  );
}
