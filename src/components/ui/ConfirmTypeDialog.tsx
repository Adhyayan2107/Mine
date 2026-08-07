'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

export function ConfirmTypeDialog({
  open,
  title,
  body,
  confirmWord,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmWord: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped('');
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">{title}</h2>
        <p className="mb-4 text-sm text-neutral-400">{body}</p>
        <p className="mb-2 text-sm text-neutral-300">
          Type <span className="font-mono text-red-400">{confirmWord}</span> to confirm.
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== confirmWord}
            className="flex-1 rounded-md bg-red-600 py-3 font-medium text-white disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
