import Image from 'next/image';
import { IDENTIDADE_PLANO } from '@/lib/plans/identidade';
import type { Plan } from '@/lib/plans/catalog';

/**
 * Faixa da cobertura recomendada, na cor e com o pet daquela assinatura (as artes de outubro).
 * É o elemento de abertura do resultado e da captura: o lead vê "a cobertura dele".
 */
export function PlanoDestaque({
  plano,
  kicker,
  className = '',
}: {
  plano: Pick<Plan, 'id' | 'name' | 'targetPersona'>;
  kicker: string;
  className?: string;
}) {
  const id = IDENTIDADE_PLANO[plano.id];
  return (
    <div
      className={`relative min-h-[188px] w-full overflow-hidden rounded-[32px] p-6 text-left ${className}`}
      style={{ backgroundColor: id.cor, color: id.corTexto }}
    >
      <div className="relative z-10 max-w-[58%]">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.1em]">{kicker}</p>
        <h2 className="mt-2 font-display text-[44px] uppercase leading-[0.95]">{plano.name}</h2>
        <p className="mt-2 text-[14px] font-bold leading-snug">{plano.targetPersona}</p>
      </div>
      <Image
        src={id.pet.src}
        alt={id.pet.alt}
        width={520}
        height={520}
        sizes="170px"
        className="pointer-events-none absolute -bottom-1 right-0 h-auto w-[46%] max-w-[170px]"
      />
    </div>
  );
}
