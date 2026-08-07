'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(new URL('../../lib/service-worker.js', import.meta.url), {
        scope: '/',
      });
    }
  }, []);

  return null;
}
