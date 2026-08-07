'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveJournalEntryAction } from '@/actions/journal';
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

  async function save() {
    setSaving(true);
    await saveJournalEntryAction({ morningPlan, wins, lessons, tomorrowFocus, mood, energy });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-5 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Journal</h1>
          <p className="text-sm text-ink-muted">Today&apos;s entry</p>
        </div>
        <Link href="/journal/history" className="text-sm font-medium text-ember">
          History
        </Link>
      </div>

      <Field label="Morning plan" value={morningPlan} onChange={setMorningPlan} />
      <Field label="Wins" value={wins} onChange={setWins} />
      <Field label="Lessons" value={lessons} onChange={setLessons} />
      <Field label="Tomorrow's focus" value={tomorrowFocus} onChange={setTomorrowFocus} />

      <RatingField label="Mood" value={mood} onChange={setMood} />
      <RatingField label="Energy" value={energy} onChange={setEnergy} />

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-lg bg-ember py-3.5 font-semibold text-ember-ink transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save entry'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-ink placeholder:text-ink-faint"
      />
    </div>
  );
}

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-11 w-11 rounded-full border-2 font-mono font-semibold transition-transform active:scale-90 ${
              value === n ? 'border-ember bg-ember/15 text-ember' : 'border-hairline text-ink-muted'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
