'use client';

import { forwardRef } from 'react';

interface LgpdConsentProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  error?: string;
  id?: string;
}

export const LgpdConsent = forwardRef<HTMLInputElement, LgpdConsentProps>(
  function LgpdConsent({ checked, onCheckedChange, error, id = 'lgpd-consent' }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm leading-snug text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
          />
          <span>
            Concordo em receber contato da Jofi sobre o resultado do quiz e ofertas
            relacionadas. Posso cancelar quando quiser.{' '}
            <a
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary-600"
              onClick={(e) => e.stopPropagation()}
            >
              Política de privacidade
            </a>
            .
          </span>
        </label>
        {error && (
          <p
            id={`${id}-error`}
            className="ml-10 text-sm font-medium text-accent-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
