import { useEffect, useRef } from "react";
import type { Strings } from "../i18n";

export default function HelpDialog({ open, t, onClose }: { open: boolean; t: Strings; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current!;
    const h = () => onClose();
    d.addEventListener("close", h);
    return () => d.removeEventListener("close", h);
  }, [onClose]);

  return (
    <dialog id="help" ref={ref} onClick={(e) => e.target === ref.current && ref.current!.close()}>
      <div className="vhead">
        <span className="t">{t.help}</span>
        <button className="dl" title={t.close} aria-label={t.close} onClick={() => ref.current!.close()}>✕</button>
      </div>
      <ul className="vnote vlist" style={{ marginTop: 0, fontSize: 12, lineHeight: 1.9 }}>
        {t.helpItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </dialog>
  );
}
