import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Jofi Pet — Planos a partir de R$ 49,90/mês';

/**
 * OG image específica pra /oferta — variante da home OG image.
 * Foco em PREÇO + benefício (vs LP/quiz que foca em "descobrir o plano ideal").
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          backgroundImage: 'linear-gradient(135deg, #E07A2E 0%, #b85f1f 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.85,
            marginBottom: 24,
          }}
        >
          Plano de saúde pet
        </div>

        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: 24,
            textShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          JOFI
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.05,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>A partir de</span>
          <span style={{ color: '#FFE4C4', fontSize: 96 }}>R$ 49,90/mês</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            padding: '14px 28px',
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 700,
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          <span>🐾</span>
          <span>Atendimento humano · Sem fidelidade</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
