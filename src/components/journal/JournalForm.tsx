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
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Today&apos;s Journal</h1>
        <Link href="/journal/history" className="text-sm text-teal-400">
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
        className="w-full rounded-md bg-teal-600 py-3 font-medium text-white disabled:opacity-40"
      >
        Save
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
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
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-full border-2 ${
              value === n
                ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                : 'border-neutral-700 text-neutral-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
