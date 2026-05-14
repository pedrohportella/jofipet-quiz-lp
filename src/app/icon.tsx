import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Favicon programático (32x32 PNG).
 * Next 14+ serve esse arquivo automaticamente como /icon e referencia no <head>.
 *
 * Visual: badge azul Jofi com "J" branca em bold.
 * Match com paleta da marca (#7090D8 primary).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#7090D8',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 6,
          letterSpacing: '-0.05em',
        }}
      >
        J
      </div>
    ),
    { ...size },
  );
}
