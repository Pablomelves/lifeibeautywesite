import { useEffect, useRef } from 'react';

const openDialogs = new Set<HTMLElement>();
let previousOverflow = '';

export function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!openDialogs.size) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    openDialogs.add(element);
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'true');
    const focusable = () => Array.from(element.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')).filter(control => control.getClientRects().length > 0);
    focusable()[0]?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (Array.from(openDialogs).at(-1) !== element) return;
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const controls = focusable();
      const first = controls[0]; const last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !element.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      openDialogs.delete(element);
      if (!openDialogs.size) document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [isOpen]);
  return dialog;
}
