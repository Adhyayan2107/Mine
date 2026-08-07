import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { ProfileEditForm } from '@/components/settings/ProfileEditForm';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { DataPortabilitySection } from '@/components/settings/DataPortabilitySection';
import { PushNotificationManager } from '@/components/ui/PushNotificationManager';

export default async function SettingsPage() {
  const profile = await getProfile(db);
  if (!profile) return <div className="p-4">Setting things up…</div>;

  return (
    <div className="pb-24">
      <div className="p-4 pb-0">
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
      </div>
      <ProfileEditForm profile={profile} />
      <div className="mx-4 border-t border-hairline" />
      <ThemePicker themeMode={profile.themeMode} />
      <div className="mx-4 border-t border-hairline" />
      <DataPortabilitySection />
      <div className="mx-4 border-t border-hairline" />
      <PushNotificationManager />
    </div>
  );
}
