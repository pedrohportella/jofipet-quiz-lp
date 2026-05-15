'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import {
  OfertaCaptureModal,
  type OfertaCaptureContext as OfertaContext,
} from './OfertaCaptureModal';

interface OfertaCaptureContextValue {
  /**
   * Abre o popup de captura. Componentes filhos chamam isso em handler de click
   * em vez de abrir WhatsApp direto.
   *
   * Após popup submeter, sistema automaticamente redireciona pro WhatsApp.
   */
  open: (context: OfertaContext) => void;
}

const Ctx = createContext<OfertaCaptureContextValue | null>(null);

/**
 * Provider único pra toda a /oferta. Envolve a página em oferta-client.tsx.
 *
 * Estado do modal é centralizado aqui: cada CTA chama useOfertaCapture().open(ctx).
 * Renderiza UM único <OfertaCaptureModal /> no fim do tree pra evitar múltiplas
 * instâncias e overlap de modals.
 */
export function OfertaCaptureProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<OfertaContext | null>(null);

  const open = useCallback((ctx: OfertaContext) => {
    setContext(ctx);
  }, []);

  const close = useCallback(() => {
    setContext(null);
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <OfertaCaptureModal context={context} onClose={close} />
    </Ctx.Provider>
  );
}

/**
 * Hook pra abrir o popup. Lança erro se usado fora do Provider
 * (catch-em-dev, evita CTA silenciosamente quebrado em prod).
 */
export function useOfertaCapture(): OfertaCaptureContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      'useOfertaCapture deve ser usado dentro de <OfertaCaptureProvider>',
    );
  }
  return ctx;
}
