'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { trackLpOfertaVideoPlay } from '@/lib/tracking/oferta-events';

interface VideoSectionProps {
  /** YouTube/Vimeo URL embed. Se vazio, mostra placeholder. */
  videoEmbedUrl?: string;
}

/**
 * Embed responsivo de vídeo institucional.
 * - Quando videoEmbedUrl está vazio: mostra placeholder bonito com selo "Em breve"
 * - Quando setado: lazy-load (carrega o iframe só ao clicar play)
 *   evitando que o YouTube/Vimeo carregue 500KB+ de JS na primeira renderização.
 */
export function VideoSection({ videoEmbedUrl }: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(videoEmbedUrl);

  const handlePlay = () => {
    setPlaying(true);
    trackLpOfertaVideoPlay();
  };

  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="mb-8 text-center">
          <p className="jofi-kicker mb-2 text-primary">Conhece a Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Veja em 30 segundos
          </h2>
        </div>

        <div className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-neutral-900 shadow-xl">
          {hasVideo && playing ? (
            <iframe
              src={`${videoEmbedUrl}${videoEmbedUrl?.includes('?') ? '&' : '?'}autoplay=1`}
              title="Vídeo institucional Jofi Pet"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={hasVideo ? handlePlay : undefined}
              disabled={!hasVideo}
              aria-label={hasVideo ? 'Reproduzir vídeo institucional Jofi' : 'Vídeo institucional em breve'}
              className="group flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform group-hover:scale-110">
                  <Play className="h-10 w-10 fill-primary text-primary" />
                </div>
                <p className="px-4 text-center text-base font-medium text-white">
                  {hasVideo ? 'Conhecer a Jofi (30s)' : 'Vídeo institucional em breve 🐾'}
                </p>
              </div>
            </button>
          )}
        </div>

        {!hasVideo && (
          <p className="mt-3 text-center text-xs text-neutral-500">
            {/* TODO Pedro/Jofi: enviar URL do vídeo (YouTube ou Vimeo) pra ativar embed */}
            Placeholder · Vídeo institucional a ser disponibilizado pela equipe Jofi
          </p>
        )}
      </div>
    </section>
  );
}
