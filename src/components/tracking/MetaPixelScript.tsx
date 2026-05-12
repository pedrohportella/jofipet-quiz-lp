import Script from 'next/script';
import { PIXEL_INIT_SCRIPT } from '@/lib/tracking/meta-pixel';

export function MetaPixelScript({ pixelId }: { pixelId: string }) {
  if (!pixelId || pixelId === '000000000000000') return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: PIXEL_INIT_SCRIPT(pixelId) }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
