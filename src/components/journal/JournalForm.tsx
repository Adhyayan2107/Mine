'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveJournalEntryAction } from '@/actions/journal';
import { SheetHeader } from '@/components/ui/SheetHeader';
import type { JournalEntry } from '@/db/schema';

export function JournalForm({ entry }: { entry: JournalEntry | null }) {
  const router = useRouter();
  const [morningPlan, setMorningPlan] = useState(entry?.morningPlan ?? '');
  const [wins, setWins] = useState(entry?.wins ?? '');
  const [lessons, setLessons] = useState(entry?.lessons ?? '');
  const [tomorrowFocus, setTomorrowFocus] = useState(entry?.tomorrowFocus ?? '');
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(entry?.energy ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await saveJournalEntryAction({ morningPlan, wins, lessons, tomorrowFocus, mood, energy });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[720px] p-4 md:p-8">
      <SheetHeader
        title="Journal"
        sheet="SHEET 06"
        note="Today's page of the summit log"
        action={
          <Link
            href="/journal/history"
            className="border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            History
          </Link>
        }
      />

      {/* One logbook page: entries share rules instead of floating apart. */}
      <div className="plate divide-y divide-hairline">
        <LogEntry
          label="Morning plan"
          placeholder="What does today's leg look like?"
          value={morningPlan}
          onChange={setMorningPlan}
        />
        <LogEntry label="Wins" placeholder="What went right today?" value={wins} onChange={setWins} />
        <LogEntry
          label="Lessons"
          placeholder="What did the mountain teach you?"
          value={lessons}
          onChange={setLessons}
        />
        <LogEntry
          label="Tomorrow's focus"
          placeholder="The first move tomorrow morning."
          value={tomorrowFocus}
          onChange={setTomorrowFocus}
        />
        <div className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <TickScale label="Mood" value={mood} onChange={setMood} />
          <TickScale label="Energy" value={energy} onChange={setEnergy} />
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 w-full bg-route py-3.5 font-semibold text-route-ink transition-transform active:scale-[0.99] disabled:opacity-40"
      >
        {saving ? 'Writing it in…' : saved ? 'Logged.' : 'Sign the log'}
      </button>
    </div>
  );
}

function LogEntry({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `journal-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div className="px-4 py-3.5">
      <label htmlFor={id} className="map-label block">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-y bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-faint"
      />
    </div>
  );
}

function TickScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="px-4 py-3.5">
      <p className="map-label">{label}</p>
      <div className="mt-2 grid grid-cols-5 gap-px border border-hairline bg-hairline" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={`altitude py-2.5 text-lg transition-colors ${
              value === n
                ? 'bg-route text-route-ink'
                : 'bg-surface text-ink-muted hover:bg-surface-raised'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
