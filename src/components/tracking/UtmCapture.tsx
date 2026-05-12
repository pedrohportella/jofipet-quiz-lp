'use client';

import { useEffect } from 'react';
import { captureUtmsFromUrl } from '@/lib/tracking/utms';

export function UtmCapture() {
  useEffect(() => {
    captureUtmsFromUrl();
  }, []);

  return null;
}
