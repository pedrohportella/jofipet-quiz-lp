'use client';

import { useEffect, useState } from 'react';
import { captureUtmsFromUrl, loadStoredUtms, type Utms } from '@/lib/tracking/utms';

export function useUtms(): Utms {
  const [utms, setUtms] = useState<Utms>({});

  useEffect(() => {
    setUtms(captureUtmsFromUrl());
  }, []);

  return utms;
}

export function useStoredUtms(): Utms {
  const [utms, setUtms] = useState<Utms>({});

  useEffect(() => {
    setUtms(loadStoredUtms());
  }, []);

  return utms;
}
