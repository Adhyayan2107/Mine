'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportDataAction, importDataAction, resetAllDataAction } from '@/actions/data-portability';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';

export function DataPortabilitySection() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);

  async function handleExport() {
    const json = await exportDataAction();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhyayan_os_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    await importDataAction(text);
    router.refresh();
  }

  return (
    <div className="space-y-2 p-4">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Your data</h2>
      <button
        onClick={handleExport}
        className="w-full rounded-lg border border-hairline px-4 py-3 text-left font-medium text-ink transition-transform active:scale-[0.98]"
      >
        Export Data
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-lg border border-hairline px-4 py-3 text-left font-medium text-ink transition-transform active:scale-[0.98]"
      >
        Import Data
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
        }}
      />

      <button
        onClick={() => setResetOpen(true)}
        className="w-full rounded-lg border border-danger/40 px-4 py-3 text-left font-medium text-danger transition-transform active:scale-[0.98]"
      >
        Reset All Data
      </button>

      <ConfirmTypeDialog
        open={resetOpen}
        title="Reset all data"
        body="This permanently deletes every to-do, habit, journal entry, and log, then restores the original defaults."
        confirmWord="DELETE"
        onCancel={() => setResetOpen(false)}
        onConfirm={async () => {
          await resetAllDataAction();
          setResetOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
