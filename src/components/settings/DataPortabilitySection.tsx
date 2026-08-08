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
    <section className="plate">
      <h2 className="map-label border-b border-hairline px-4 py-3">Your data</h2>
      <div className="divide-y divide-hairline">
        <button
          onClick={handleExport}
          className="block w-full px-4 py-3.5 text-left font-medium text-ink transition-colors hover:bg-surface-raised"
        >
          Export the whole log
          <span className="mt-0.5 block text-xs font-normal text-ink-faint">Everything, as one JSON file.</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="block w-full px-4 py-3.5 text-left font-medium text-ink transition-colors hover:bg-surface-raised"
        >
          Import a log
          <span className="mt-0.5 block text-xs font-normal text-ink-faint">Restores from a previous export.</span>
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
          className="block w-full px-4 py-3.5 text-left font-medium text-danger transition-colors hover:bg-surface-raised"
        >
          Reset all data
          <span className="mt-0.5 block text-xs font-normal text-ink-faint">
            Burns the whole atlas and starts blank. Asks first.
          </span>
        </button>
      </div>

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
    </section>
  );
}
