'use client';

import { useState } from 'react';
import { SheetModal } from './SheetModal';

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

  return (
    <SheetModal title={title} onClose={onCancel}>
      <p className="mb-4 text-sm leading-relaxed text-ink-muted">{body}</p>
      <p className="mb-2 text-sm text-ink-muted">
        Type <span className="font-mono font-semibold text-danger">{confirmWord}</span> to confirm.
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoFocus
        className="mb-4 w-full border border-hairline bg-surface px-4 py-3 font-mono text-ink"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-hairline-strong py-3 font-medium text-ink-muted transition-transform active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={typed !== confirmWord}
          className="flex-1 bg-danger py-3 font-semibold text-surface-raised transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Delete everything
        </button>
      </div>
    </SheetModal>
  );
}
