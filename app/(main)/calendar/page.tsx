import Link from 'next/link';
import { db } from '@/db/client';
import { getMonthActivity, type DayActivity } from '@/db/queries/calendar';
import { todayDateString } from '@/lib/dates';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { ArrowLeftGlyph, ArrowRightGlyph } from '@/components/ui/glyphs';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const today = todayDateString();
  const [todayYear, todayMonth] = today.split('-').map(Number);

  const year = params.year ? Number(params.year) : todayYear;
  const month = params.month ? Number(params.month) : todayMonth;

  const startDate = `${year}-${pad(month)}-01`;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

  const activityMap = await getMonthActivity(db, startDate, endDate);
  const activityByDate: Record<string, DayActivity> = {};
  for (const [date, activity] of activityMap) activityByDate[date] = activity;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div className="mx-auto max-w-[880px] p-4 md:p-8">
      <SheetHeader
        title="Calendar"
        sheet="SHEET 04"
        note="Every day you showed up is a camp on the route."
      />

      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/calendar?year=${prevYear}&month=${prevMonth}`}
          className="flex h-9 w-9 items-center justify-center border border-hairline-strong text-ink-muted transition-colors hover:text-ink"
          aria-label="Previous month"
        >
          <ArrowLeftGlyph size={14} />
        </Link>
        <p className="sheet-title text-xl text-ink">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <Link
          href={`/calendar?year=${nextYear}&month=${nextMonth}`}
          className="flex h-9 w-9 items-center justify-center border border-hairline-strong text-ink-muted transition-colors hover:text-ink"
          aria-label="Next month"
        >
          <ArrowRightGlyph size={14} />
        </Link>
      </div>

      <CalendarGrid year={year} month={month} activityByDate={activityByDate} today={today} />
    </div>
  );
}
