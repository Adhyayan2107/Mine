'use client';

import { useEffect, useState } from 'react';
import { subscribeToPushAction, unsubscribeFromPushAction } from '@/actions/push-subscription';
import { urlBase64ToUint8Array } from '@/lib/push-client';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then(async (registration) => {
        setSubscription(await registration.pushManager.getSubscription());
      });
    }
  }, []);

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

  if (!isSupported) {
    return (
      <p className="p-4 text-sm text-neutral-500">Push notifications aren&apos;t supported in this browser.</p>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-2 text-sm font-medium text-neutral-400">Notifications</h2>
      {subscription ? (
        <button
          onClick={unsubscribe}
          className="w-full rounded-md border border-neutral-700 px-4 py-3 text-neutral-100"
        >
          Disable Notifications
        </button>
      ) : (
        <button onClick={subscribe} className="w-full rounded-md bg-teal-600 px-4 py-3 font-medium text-white">
          Enable Notifications
        </button>
      )}
    </div>
  );
}
