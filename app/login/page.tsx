import { login } from '@/actions/auth';
import { WaypointFlag } from '@/components/ui/Waypoint';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form action={login} className="plate w-full max-w-sm">
        <div className="border-b border-hairline px-6 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center bg-route text-route-ink">
              <WaypointFlag size={20} />
            </span>
            <div>
              <h1 className="sheet-title text-2xl leading-none text-ink">Adhyayan OS</h1>
              <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-ink-faint">
                EXPEDITION ATLAS · ONE SEAT
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label htmlFor="password" className="map-label mb-2 block">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            autoFocus
            required
            className="mb-3 w-full border border-hairline bg-surface-sunken px-4 py-3.5 font-mono text-ink placeholder:text-ink-faint"
          />
          {error && <p className="mb-3 text-sm text-danger">Wrong password — the atlas stays shut.</p>}
          <button
            type="submit"
            className="w-full bg-route px-4 py-3.5 font-semibold text-route-ink transition-transform active:scale-[0.98]"
          >
            Open the atlas
          </button>
        </div>
      </form>
    </main>
  );
}
