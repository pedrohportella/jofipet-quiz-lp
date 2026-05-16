'use client';

/**
 * Charts inline SVG — zero deps, pequeno (<3KB gzip).
 *
 * Por que SVG inline em vez de Recharts/Chart.js?
 *   - Bundle: dashboard ja é niche/admin, qualquer lib seria 30-100KB pra
 *     mostrar 3 gráficos triviais.
 *   - Renderiza SSR (Recharts requer client-only) — mais rápido pra first paint.
 *   - Acessível: <title> e <desc> nativos do SVG funcionam com screen readers.
 *
 * Limitações aceitas:
 *   - Sem tooltips interativos (basta hover-title pra MVP)
 *   - Sem animações fancy (dashboard admin não precisa)
 */

const TIER_COLOR: Record<string, string> = {
  quente: '#E07A2E', // accent
  morno: '#F5C24A', // amarelo Jofi
  frio: '#7090D8', // primary
};

const TIER_EMOJI: Record<string, string> = {
  quente: '🔥',
  morno: '🌻',
  frio: '💙',
};

/**
 * Donut chart por tier — útil pra visualizar proporção sem comparar números.
 *
 * Implementação: 3 arcs SVG via stroke-dasharray. Hole no centro (donut, não pie)
 * pra colocar o total dentro.
 */
export function TierDonut({
  data,
  size = 180,
  strokeWidth = 28,
}: {
  data: { quente: number; morno: number; frio: number };
  size?: number;
  strokeWidth?: number;
}) {
  const total = data.quente + data.morno + data.frio;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-500"
        style={{ width: size, height: size }}
      >
        Sem dados
      </div>
    );
  }

  // Calcula arcs cumulativos
  const tiers: { key: 'quente' | 'morno' | 'frio'; value: number }[] = [
    { key: 'quente', value: data.quente },
    { key: 'morno', value: data.morno },
    { key: 'frio', value: data.frio },
  ];

  let cumulative = 0;
  const arcs = tiers.map((t) => {
    const fraction = t.value / total;
    const arcLength = fraction * circumference;
    const offset = -cumulative * circumference;
    cumulative += fraction;
    return { ...t, arcLength, offset };
  });

  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Distribuição por tier: ${data.quente} quentes, ${data.morno} mornos, ${data.frio} frios`}
      >
        <title>Distribuição de leads por tier</title>
        {/* track background */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
        />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={TIER_COLOR[arc.key]}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.arcLength} ${circumference - arc.arcLength}`}
            strokeDashoffset={arc.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        {/* Total no centro */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-neutral-900"
          style={{ fontSize: 28, fontWeight: 800 }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="fill-neutral-500"
          style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          leads
        </text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {arcs.map((arc) => (
          <div key={arc.key} className="flex items-center gap-2 text-sm">
            <span
              className="block h-3 w-3 rounded-sm"
              style={{ background: TIER_COLOR[arc.key] }}
              aria-hidden="true"
            />
            <span className="font-medium capitalize text-neutral-900">
              {TIER_EMOJI[arc.key]} {arc.key}
            </span>
            <span className="tabular-nums text-neutral-500">
              {arc.value} ({((arc.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Funnel chart horizontal — 4 barras de comprimento proporcional ao passo
 * anterior. Bom pra visualizar drop-off entre passos.
 *
 * Convenção: primeira barra = 100%, demais = relativo ao TOTAL (não ao step anterior),
 * porque é mais intuitivo na hora de ler "X% chegam aqui".
 */
export function FunnelBars({
  steps,
}: {
  steps: { label: string; value: number; pctOfPrevious?: number }[];
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const widthPct = (step.value / max) * 100;
        return (
          <div key={step.label} className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">{step.label}</span>
              <span className="tabular-nums text-neutral-500">
                {step.value}
                {step.pctOfPrevious !== undefined && step.pctOfPrevious > 0 && (
                  <span className="ml-2 text-neutral-400">
                    ({(step.pctOfPrevious * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-7 w-full overflow-hidden rounded-md bg-neutral-100">
              <div
                className="h-full rounded-md bg-gradient-to-r from-primary to-primary/80 transition-all"
                style={{ width: `${Math.max(widthPct, 3)}%` }}
                aria-label={`${step.label}: ${step.value}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Sparkline — linha SVG simples mostrando trend numa série.
 * Aceita até ~30 pontos, viewBox auto-escala.
 */
export function Sparkline({
  values,
  width = 80,
  height = 24,
  color = '#7090D8',
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Tendência"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
