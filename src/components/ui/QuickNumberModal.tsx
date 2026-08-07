'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

export function QuickNumberModal({
  open,
  title,
  unit,
  initialValue,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  unit: string;
  initialValue?: number;
  onSubmit: (value: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue?.toString() ?? '');
  // Reset the field when the modal transitions from closed to open — this is
  // React's documented "adjust state during render" pattern (not an effect),
  // since the component never unmounts between opens (the parent always
  // renders it, just toggling `open`).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setValue(initialValue?.toString() ?? '');
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm md:items-center md:justify-center">
      <div className="modal-enter w-full rounded-t-2xl border border-hairline bg-surface-raised p-6 shadow-2xl md:w-96 md:rounded-2xl">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">{title}</h2>
        <div className="mb-5 flex items-baseline gap-2">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-surface px-4 py-3.5 font-mono text-2xl text-ink"
          />
          <span className="shrink-0 font-mono text-sm text-ink-muted">{unit}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-hairline py-3 font-medium text-ink-muted transition-transform active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const parsed = parseFloat(value);
              if (!Number.isNaN(parsed)) onSubmit(parsed);
            }}
            className="flex-1 rounded-lg bg-ember py-3 font-semibold text-ember-ink transition-transform active:scale-[0.97]"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
