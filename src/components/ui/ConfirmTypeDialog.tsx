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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="modal-enter w-full max-w-sm rounded-2xl border border-hairline bg-surface-raised p-6 shadow-2xl">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink">{title}</h2>
        <p className="mb-4 text-sm text-ink-muted">{body}</p>
        <p className="mb-2 text-sm text-ink-muted">
          Type <span className="font-mono font-semibold text-danger">{confirmWord}</span> to confirm.
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-lg border border-hairline bg-surface px-4 py-3 font-mono text-ink"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-hairline py-3 font-medium text-ink-muted transition-transform active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== confirmWord}
            className="flex-1 rounded-lg bg-danger py-3 font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
