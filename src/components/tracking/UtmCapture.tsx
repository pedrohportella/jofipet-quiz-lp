'use client';

import { useEffect } from 'react';
import { captureUtmsFromUrl } from '@/lib/tracking/utms';
import { captureGoogleClickIdsFromUrl } from '@/lib/tracking/gclid';

export function UtmCapture() {
  useEffect(() => {
    captureUtmsFromUrl();
    captureGoogleClickIdsFromUrl();
  }, []);

  return null;
}
