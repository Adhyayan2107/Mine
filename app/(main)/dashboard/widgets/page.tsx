import { db } from '@/db/client';
import { listDashboardWidgets } from '@/db/queries/dashboard-widgets';
import { WidgetSettingsList } from '@/components/dashboard/WidgetSettingsList';

export default async function DashboardWidgetsPage() {
  const widgets = await listDashboardWidgets(db);
  return <WidgetSettingsList widgets={widgets} />;
}
