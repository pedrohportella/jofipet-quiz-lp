import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Jofi Pet Quiz — Descubra o plano ideal pro seu pet';

/**
 * Open Graph image (1200x630 PNG) — usada como preview ao compartilhar a LP
 * no WhatsApp, Instagram, Facebook, LinkedIn, Telegram, Slack etc.
 *
 * Gerada programaticamente via next/og (built-in no Next 14+).
 * Render direct edge → ~80ms cold, ~20ms warm.
 *
 * Match com a paleta da LP:
 *   - Background: primary blue #7090D8 com gradient
 *   - Accent: laranja #E07A2E
 *   - Tipografia: system-ui bold (Anton requereria fetch de font, custo extra)
 *
 * Hierarquia visual:
 *   Kicker  → "PLANO DE SAÚDE PET"
 *   Logo    → "JOFI" gigante
 *   Headline → "Cuidar hoje. Proteger sempre."
 *   Bottom  → CTA "Quiz em ~90s"
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
          backgroundImage:
            'linear-gradient(135deg, #7090D8 0%, #5470b8 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Kicker */}
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

        {/* Logo gigante */}
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: 40,
            textShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          JOFI
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.05,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Cuidar hoje.</span>
          <span style={{ color: '#FFC080' }}>Proteger sempre.</span>
        </div>

        {/* CTA badge bottom */}
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
          <span>Descubra seu plano ideal em ~90s</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
