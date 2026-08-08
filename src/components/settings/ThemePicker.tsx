'use client';

import { useRouter } from 'next/navigation';
import { setThemeModeAction } from '@/actions/profile';

const MODES = [
  { value: 'light', label: 'Day chart' },
  { value: 'dark', label: 'Night chart' },
  { value: 'system', label: 'Follow system' },
] as const;

export function ThemePicker({ themeMode }: { themeMode: string }) {
  const router = useRouter();

  return (
    <section className="plate">
      <h2 className="map-label border-b border-hairline px-4 py-3">Chart light</h2>
      <div className="grid grid-cols-3 gap-px bg-hairline p-px" role="radiogroup" aria-label="Theme">
        {MODES.map((m) => (
          <button
            key={m.value}
            role="radio"
            aria-checked={themeMode === m.value}
            onClick={async () => {
              await setThemeModeAction(m.value);
              router.refresh();
            }}
            className={`py-3 text-sm font-medium transition-colors ${
              themeMode === m.value
                ? 'bg-route text-route-ink'
                : 'bg-surface text-ink-muted hover:bg-surface-raised'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
