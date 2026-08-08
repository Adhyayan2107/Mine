'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction, deleteCategoryAction } from '@/actions/categories';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { XGlyph } from '@/components/ui/glyphs';
import type { Category } from '@/db/schema';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');

  async function add() {
    if (!name) return;
    await createCategoryAction(name);
    setName('');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[880px] p-4 md:p-8">
      <SheetHeader title="Categories" sheet="SHEET 03 · A" note="How the manifest is sorted" />

      <div className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="New category"
          className="flex-1 border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-faint"
        />
        <button
          onClick={add}
          className="bg-route px-5 py-3 font-semibold text-route-ink transition-transform active:scale-95"
        >
          Add
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-ink-faint">No categories yet — the manifest sorts itself for now.</p>
      ) : (
        <ul className="plate divide-y divide-hairline">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-ink">{c.name}</span>
              <button
                onClick={async () => {
                  await deleteCategoryAction(c.id);
                  router.refresh();
                }}
                aria-label={`Delete ${c.name}`}
                className="p-2 text-ink-faint transition-colors hover:text-danger active:scale-90"
              >
                <XGlyph size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
