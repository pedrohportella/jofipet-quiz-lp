'use client';

import { PawPrint } from 'lucide-react';

/**
 * Card de "Atendente Jofi" no resultado.
 * Visual: mini-perfil do time de atendimento + status online.
 *
 * Decisão: usa "Nosso time" (não nome próprio individual) pra refletir
 * estrutura escalável da operação Jofi. Persona individual fica nas mensagens
 * do WhatsApp que vão ser respondidas por quem estiver de plantão.
 */
export function AttendantCard() {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl bg-cream px-4 py-3 text-left">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <PawPrint className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-bold text-neutral-900">Time Jofi</p>
        <p className="text-xs text-neutral-700">Especialistas pet · responde em minutos</p>
      </div>
      <span className="h-2.5 w-2.5 rounded-full bg-success-500" aria-label="online" />
    </div>
  );
}
