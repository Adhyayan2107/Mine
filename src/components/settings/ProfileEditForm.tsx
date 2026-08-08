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
  const [saved, setSaved] = useState(false);

  async function save() {
    await updateProfileAction({
      goalWeightKg: parseFloat(goalWeightKg),
      dailyCaloriesKcal: parseInt(dailyCaloriesKcal, 10),
      dailyProteinG: parseInt(dailyProteinG, 10),
      dailyWaterMl: parseInt(dailyWaterMl, 10),
      dailySteps: parseInt(dailySteps, 10),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <section className="plate">
      <h2 className="map-label border-b border-hairline px-4 py-3">Targets</h2>
      <div className="grid grid-cols-1 gap-px bg-hairline sm:grid-cols-2">
        <LabeledInput label="Goal weight (kg)" value={goalWeightKg} onChange={setGoalWeightKg} />
        <LabeledInput label="Daily calories (kcal)" value={dailyCaloriesKcal} onChange={setDailyCaloriesKcal} />
        <LabeledInput label="Daily protein (g)" value={dailyProteinG} onChange={setDailyProteinG} />
        <LabeledInput label="Daily water (ml)" value={dailyWaterMl} onChange={setDailyWaterMl} />
        <LabeledInput label="Daily steps" value={dailySteps} onChange={setDailySteps} />
        <div className="flex items-end bg-surface p-3">
          <button
            onClick={save}
            className="w-full bg-route py-2.5 font-semibold text-route-ink transition-transform active:scale-[0.98]"
          >
            {saved ? 'Saved.' : 'Save targets'}
          </button>
        </div>
      </div>
    </section>
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
  const id = `target-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <div className="bg-surface p-3">
      <label htmlFor={id} className="map-label block">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="tabular mt-1.5 w-full border-b border-hairline-strong bg-transparent pb-1 font-mono text-lg text-ink outline-none focus:border-route"
      />
    </div>
  );
}
