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
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:items-center md:justify-center">
      <div className="w-full rounded-t-2xl bg-neutral-900 p-6 md:w-96 md:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-neutral-100">{title}</h2>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-lg text-neutral-100"
          />
          <span className="text-neutral-400">{unit}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={() => {
              const parsed = parseFloat(value);
              if (!Number.isNaN(parsed)) onSubmit(parsed);
            }}
            className="flex-1 rounded-md bg-teal-600 py-3 font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
