'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/actions/profile';
import type { Profile } from '@/db/schema';

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [goalWeightKg, setGoalWeightKg] = useState(profile.goalWeightKg.toString());
  const [dailyCaloriesKcal, setDailyCaloriesKcal] = useState(profile.dailyCaloriesKcal.toString());
  const [dailyProteinG, setDailyProteinG] = useState(profile.dailyProteinG.toString());
  const [dailyWaterMl, setDailyWaterMl] = useState(profile.dailyWaterMl.toString());
  const [dailySteps, setDailySteps] = useState(profile.dailySteps.toString());

  async function save() {
    await updateProfileAction({
      goalWeightKg: parseFloat(goalWeightKg),
      dailyCaloriesKcal: parseInt(dailyCaloriesKcal, 10),
      dailyProteinG: parseInt(dailyProteinG, 10),
      dailyWaterMl: parseInt(dailyWaterMl, 10),
      dailySteps: parseInt(dailySteps, 10),
    });
    router.refresh();
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="font-display text-xl font-bold text-ink">Profile &amp; Targets</h1>
      <LabeledInput label="Goal weight (kg)" value={goalWeightKg} onChange={setGoalWeightKg} />
      <LabeledInput label="Daily calories (kcal)" value={dailyCaloriesKcal} onChange={setDailyCaloriesKcal} />
      <LabeledInput label="Daily protein (g)" value={dailyProteinG} onChange={setDailyProteinG} />
      <LabeledInput label="Daily water (ml)" value={dailyWaterMl} onChange={setDailyWaterMl} />
      <LabeledInput label="Daily steps" value={dailySteps} onChange={setDailySteps} />
      <button
        onClick={save}
        className="w-full rounded-lg bg-ember py-3 font-semibold text-ember-ink transition-transform active:scale-[0.98]"
      >
        Save
      </button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 font-mono text-ink"
      />
    </div>
  );
}
