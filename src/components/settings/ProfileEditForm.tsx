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
      <h1 className="text-xl font-semibold">Profile &amp; Targets</h1>
      <LabeledInput label="Goal weight (kg)" value={goalWeightKg} onChange={setGoalWeightKg} />
      <LabeledInput label="Daily calories (kcal)" value={dailyCaloriesKcal} onChange={setDailyCaloriesKcal} />
      <LabeledInput label="Daily protein (g)" value={dailyProteinG} onChange={setDailyProteinG} />
      <LabeledInput label="Daily water (ml)" value={dailyWaterMl} onChange={setDailyWaterMl} />
      <LabeledInput label="Daily steps" value={dailySteps} onChange={setDailySteps} />
      <button onClick={save} className="w-full rounded-md bg-teal-600 py-3 font-medium text-white">
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
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
      />
    </div>
  );
}
