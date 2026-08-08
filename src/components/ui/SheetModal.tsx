'use client';

import { createPortal } from 'react-dom';

/**
 * The atlas's one overlay: a field annex clipped to the sheet. Bottom sheet
 * on the phone (thumb reach), centered plate on desktop. Square corners,
 * one hairline, a real offset shadow. All modals route through this.
 */
export function SheetModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end bg-ink/45 md:items-center md:justify-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="sheet-enter max-h-[88vh] w-full overflow-y-auto border-t border-hairline bg-surface-raised shadow-[0_16px_48px_-16px_rgba(10,20,16,0.5)] md:w-[26rem] md:border"
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <h2 className="sheet-title text-xl text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 p-1.5 text-ink-faint transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
