import { useEffect } from 'react';

export function useModalLifecycle(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    const animationFrame = window.requestAnimationFrame(() => {
      const autofocusEl = document.querySelector<HTMLElement>('[data-modal-autofocus]');
      if (autofocusEl) {
        autofocusEl.focus();
        return;
      }
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      const firstFocusable = dialog?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable || dialog)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen, onClose]);
}
