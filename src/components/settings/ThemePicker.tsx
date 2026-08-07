'use client';

import { useRouter } from 'next/navigation';
import { setThemeModeAction } from '@/actions/profile';

export function ThemePicker({ themeMode }: { themeMode: string }) {
  const router = useRouter();
  return (
    <div className="p-4">
      <label className="mb-2 block text-xs font-medium text-neutral-400">Theme</label>
      <select
        value={themeMode}
        onChange={async (e) => {
          await setThemeModeAction(e.target.value as 'dark' | 'light' | 'system');
          router.refresh();
        }}
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
