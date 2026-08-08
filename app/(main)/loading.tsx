/**
 * Instant sheet skeleton while a page's data is on the wire — the masthead
 * rule and empty plates sketch in so navigation never feels dead.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1160px] animate-pulse p-4 md:p-8" aria-label="Loading" role="status">
      <div className="mb-5 border-b border-hairline pb-3">
        <div className="h-8 w-40 bg-surface-sunken" />
        <div className="mt-2 h-3.5 w-64 bg-surface-sunken/70" />
      </div>
      <div className="plate h-32" />
      <div className="plate mt-4 divide-y divide-hairline">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center justify-between px-3.5 py-4">
            <div className="h-3 w-28 bg-surface-sunken" />
            <div className="h-5 w-16 bg-surface-sunken/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
