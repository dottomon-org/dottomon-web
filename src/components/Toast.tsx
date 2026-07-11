import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ToastItem {
  id: number;
  text: string;
}

// Popover API methods aren't in React 18's HTMLDivElement typings yet
type PopoverEl = HTMLDivElement & {
  popover?: string;
  showPopover?: () => void;
  hidePopover?: () => void;
};

let push: ((text: string) => void) | null = null;
let nextId = 0;

/** Show a toast at the top center. Callable from anywhere once ToastHost is mounted */
export function toast(text: string) {
  push?.(text);
}

const TOAST_MS = 2200;

// The container is a manual popover so toasts join the browser's top layer —
// otherwise they would render underneath modal <dialog>s (the views dialog).
// Re-opening on every push moves it above whatever entered the top layer since.
// The classes undo the UA popover styles (inset/margin/border/background).
export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const ref = useRef<PopoverEl>(null);

  useEffect(() => {
    const el = ref.current;
    el?.setAttribute("popover", "manual");
    push = (text) => {
      const id = nextId++;
      setItems((prev) => [...prev, { id, text }]);
      setTimeout(
        () => setItems((prev) => prev.filter((t) => t.id !== id)),
        TOAST_MS,
      );
      try {
        el?.hidePopover?.();
        el?.showPopover?.();
      } catch {
        /* popover unsupported — the fixed-position styles still apply */
      }
    };
    return () => {
      push = null;
    };
  }, []);

  return createPortal(
    <div
      id="toasts"
      className="pointer-events-none fixed inset-auto top-3.5 left-1/2 z-[90] m-0 grid -translate-x-1/2 justify-items-center gap-2 overflow-visible border-0 bg-transparent p-0"
      ref={ref}
      aria-live="polite"
    >
      {items.map((t) => (
        <div
          className="animate-toastin rounded-lg border border-line bg-[rgba(16,16,31,0.92)] px-4 py-2 text-[12px] whitespace-nowrap text-ink shadow-[0_6px_18px_rgba(0,0,0,0.45)] motion-reduce:animate-none"
          key={t.id}
        >
          {t.text}
        </div>
      ))}
    </div>,
    document.body,
  );
}
