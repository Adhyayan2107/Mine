import { login } from '@/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <form action={login} className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ember text-lg font-bold text-ember-ink">
            A
          </span>
          <div>
            <h1 className="font-display text-xl font-bold leading-none text-ink">Adhyayan OS</h1>
            <p className="text-xs text-ink-faint">Your log. Your log only.</p>
          </div>
        </div>

        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          autoFocus
          required
          className="mb-3 w-full rounded-lg border border-hairline bg-surface px-4 py-3.5 text-ink placeholder:text-ink-faint"
        />
        {error && <p className="mb-3 text-sm text-danger">Wrong password. Try again.</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-ember px-4 py-3.5 font-semibold text-ember-ink transition-transform active:scale-[0.98]"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
