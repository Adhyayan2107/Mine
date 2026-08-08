'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { subscribeToPushAction, unsubscribeFromPushAction } from '@/actions/push-subscription';
import { urlBase64ToUint8Array } from '@/lib/push-client';

// Push support is a stable browser capability, not React state — reading it
// via useSyncExternalStore (rather than setState inside an effect) is the
// hydration-safe way to detect a client-only value: it reports `false` on
// the server (getServerSnapshot) and the real value once mounted client-side.
function subscribeNoop() {
  return () => {};
}
function getSupportSnapshot(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}
function getServerSupportSnapshot(): boolean {
  return false;
}

export function PushNotificationManager() {
  const isSupported = useSyncExternalStore(subscribeNoop, getSupportSnapshot, getServerSupportSnapshot);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.ready.then(async (registration) => {
      setSubscription(await registration.pushManager.getSubscription());
    });
  }, [isSupported]);

  async function subscribe() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
    });
    setSubscription(sub);
    await subscribeToPushAction(JSON.parse(JSON.stringify(sub)));
  }

  async function unsubscribe() {
    if (!subscription) return;
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    setSubscription(null);
    await unsubscribeFromPushAction(endpoint);
  }

  return (
    <section className="plate">
      <h2 className="map-label border-b border-hairline px-4 py-3">Radio check-ins</h2>
      {!isSupported ? (
        <p className="px-4 py-3.5 text-sm text-ink-faint">
          Push notifications aren&apos;t supported in this browser.
        </p>
      ) : subscription ? (
        <button
          onClick={unsubscribe}
          className="block w-full px-4 py-3.5 text-left font-medium text-ink transition-colors hover:bg-surface-raised"
        >
          Disable notifications
          <span className="mt-0.5 block text-xs font-normal text-ink-faint">
            Stops the morning, midday, and evening nudges.
          </span>
        </button>
      ) : (
        <button
          onClick={subscribe}
          className="block w-full px-4 py-3.5 text-left font-medium text-route-deep transition-colors hover:bg-surface-raised"
        >
          Enable notifications
          <span className="mt-0.5 block text-xs font-normal text-ink-faint">
            Three daily nudges: weight &amp; tasks, water pace, open habits.
          </span>
        </button>
      )}
    </section>
  );
}
