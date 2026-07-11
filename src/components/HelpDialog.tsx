import { useEffect, useRef } from "react";
import type { Strings } from "../i18n";
import { chipMd, dialogCls, dialogHead, vlist } from "../lib/ui";

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
    <dialog id="help" className={dialogCls} ref={ref} onClick={(e) => e.target === ref.current && ref.current!.close()}>
      <div className={dialogHead}>
        <span className="text-[14px] break-all text-dim">{t.help}</span>
        <button className={`${chipMd} text-[11px]`} title={t.close} aria-label={t.close} onClick={() => ref.current!.close()}>✕</button>
      </div>
      <ul className={`${vlist} text-[12px] leading-[1.9] text-dim`}>
        {t.helpItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </dialog>
  );
}
