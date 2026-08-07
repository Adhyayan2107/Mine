import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { ProfileEditForm } from '@/components/settings/ProfileEditForm';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { DataPortabilitySection } from '@/components/settings/DataPortabilitySection';

export default async function SettingsPage() {
  const profile = await getProfile(db);
  if (!profile) return <div className="p-4">Setting things up…</div>;

  return (
    <div>
      <ProfileEditForm profile={profile} />
      <ThemePicker themeMode={profile.themeMode} />
      <DataPortabilitySection />
    </div>
  );
}
