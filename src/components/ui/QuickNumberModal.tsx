'use client';

import { useState } from 'react';
import { SheetModal } from './SheetModal';

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

  function save() {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) onSubmit(parsed);
  }

  return (
    <SheetModal title={title} onClose={onClose}>
      <div className="mb-5 flex items-baseline gap-3 border-b border-hairline-strong pb-2">
        <input
          type="number"
          inputMode="decimal"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="0"
          className="altitude w-full bg-transparent text-5xl text-ink outline-none placeholder:text-ink-faint"
        />
        <span className="shrink-0 font-mono text-sm text-ink-muted">{unit}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 border border-hairline-strong py-3 font-medium text-ink-muted transition-transform active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="flex-1 bg-route py-3 font-semibold text-route-ink transition-transform active:scale-[0.98]"
        >
          Log it
        </button>
      </div>
    </SheetModal>
  );
}
