import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { ProfileEditForm } from '@/components/settings/ProfileEditForm';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { DataPortabilitySection } from '@/components/settings/DataPortabilitySection';
import { PushNotificationManager } from '@/components/ui/PushNotificationManager';
import { SheetHeader } from '@/components/ui/SheetHeader';

export default async function SettingsPage() {
  const profile = await getProfile(db);
  if (!profile) return <div className="p-4">Setting things up…</div>;

  return (
    <div className="mx-auto max-w-[720px] p-4 md:p-8">
      <SheetHeader title="Settings" sheet="SHEET 06" note="The atlas's margin notes" />
      <div className="space-y-4">
        <ProfileEditForm profile={profile} />
        <ThemePicker themeMode={profile.themeMode} />
        <DataPortabilitySection />
        <PushNotificationManager />
      </div>
    </div>
  );
}
