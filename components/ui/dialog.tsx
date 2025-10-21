'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode; }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onOpenChange(false);
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onOpenChange]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-xl border border-muted bg-white/95 p-6 shadow-xl backdrop:bg-black/30"
      onClose={() => onOpenChange(false)}
    >
      {children}
    </dialog>,
    document.body
  );
}

export function DialogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>;
}

export function DialogCloseButton({ label = 'Luk' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const dialog = document.querySelector('dialog[open]');
        if (dialog instanceof HTMLDialogElement) dialog.close();
      }}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md border border-muted px-4 text-sm font-medium text-foreground hover:bg-muted'
      )}
    >
      {label}
    </button>
  );
}
