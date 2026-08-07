import { login } from '@/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form action={login} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-neutral-100">Adhyayan OS</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100"
        />
        {error && <p className="text-sm text-red-400">Wrong password.</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-teal-600 px-4 py-3 font-medium text-white"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
