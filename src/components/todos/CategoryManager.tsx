'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction, deleteCategoryAction } from '@/actions/categories';
import type { Category } from '@/db/schema';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-xl font-bold text-ink">Categories</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
          className="flex-1 rounded-lg border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-faint"
        />
        <button
          onClick={async () => {
            if (!name) return;
            await createCategoryAction(name);
            setName('');
            router.refresh();
          }}
          className="rounded-lg bg-ember px-5 py-3 font-semibold text-ember-ink transition-transform active:scale-95"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-hairline bg-surface p-3"
          >
            <span className="text-ink">{c.name}</span>
            <button
              onClick={async () => {
                await deleteCategoryAction(c.id);
                router.refresh();
              }}
              className="p-2 text-ink-faint transition-transform active:scale-90"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
