'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction, deleteCategoryAction } from '@/actions/categories';
import type { Category } from '@/db/schema';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Categories</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <button
          onClick={async () => {
            if (!name) return;
            await createCategoryAction(name);
            setName('');
            router.refresh();
          }}
          className="rounded-md bg-teal-600 px-4 py-3 font-medium text-white"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg bg-neutral-900 p-3">
            <span>{c.name}</span>
            <button
              onClick={async () => {
                await deleteCategoryAction(c.id);
                router.refresh();
              }}
              className="p-2 text-neutral-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
