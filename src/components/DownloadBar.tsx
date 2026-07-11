import { useEffect, useRef, useState } from "react";
import type { Strings } from "../i18n";
import { chip } from "../lib/ui";
import { toast } from "./Toast";
import { CheckIcon, DlIcon, LinkIcon, PlayIcon } from "./Icons";

interface Props {
  seed: string;
  t: Strings;
  onPng: () => void;
  onGif: () => void;
  onPlay: (rect: DOMRect) => void;
  /** When set, adds a copy-share-link button; returns the URL to copy */
  onShare?: () => string;
  /** Cell-sized chips (18px, revealed on cell hover) instead of the 22px bar */
  small?: boolean;
}

// On touch devices (pointer-coarse) the actions collapse behind a "⋯" button
// that opens a speech-bubble menu; on pointer devices the bar renders inline
// (the menu wrapper is display:contents there, so the bar's flex layout applies)
export default function DownloadBar({ seed, t, onPng, onGif, onPlay, onShare, small }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const act = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  const share = async () => {
    if (!onShare) return;
    setOpen(false);
    try {
      await navigator.clipboard.writeText(onShare());
    } catch {
      return;
    }
    toast(t.shareToast);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  // In cells the bar is anchored to both edges with space-between so the
  // top/bottom margins match, and only appears while the cell is hovered
  const bar = small
    ? "top-[3px] right-[3px] bottom-[3px] flex-col justify-between gap-0 opacity-0 group-hover/cell:opacity-100 focus-within:opacity-100 pointer-coarse:flex-row pointer-coarse:opacity-100"
    : "top-1 right-1 gap-[3px] pointer-coarse:flex-row";
  const item = `${chip} bg-[rgba(16,16,31,0.72)] opacity-60 hover:opacity-100 ${
    small ? "size-[18px] p-0.5 text-[6.5px]" : "size-[22px] p-[3px] text-[7.5px]"
  } ${open ? "pointer-coarse:size-9 pointer-coarse:p-[7px] pointer-coarse:text-[10px] pointer-coarse:opacity-100" : ""}`;

  return (
    <div className={`absolute z-[2] flex ${bar}`} ref={ref}>
      <button
        className={`${chip} hidden bg-[rgba(16,16,31,0.45)] p-0 text-[13px] opacity-85 pointer-coarse:grid ${small ? "size-6" : "size-[26px]"}`}
        title={t.moreActions}
        aria-label={`${seed}: ${t.moreActions}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⋯
      </button>
      <div
        className={
          open
            ? "contents pointer-coarse:absolute pointer-coarse:top-[calc(100%+7px)] pointer-coarse:right-0 pointer-coarse:z-[5] pointer-coarse:flex pointer-coarse:gap-[7px] pointer-coarse:rounded-[10px] pointer-coarse:border pointer-coarse:border-line pointer-coarse:bg-[#16162b] pointer-coarse:p-[7px] pointer-coarse:shadow-[0_5px_14px_rgba(0,0,0,0.45)] before:absolute before:-top-[5.5px] before:right-[9px] before:size-[9px] before:rotate-45 before:border-t before:border-l before:border-line before:bg-[#16162b] before:content-['']"
            : "contents pointer-coarse:hidden"
        }
      >
        <button className={item} title={t.dlPng} aria-label={`${seed}: ${t.dlPng}`} onClick={act(onPng)}>
          <DlIcon />
        </button>
        <button className={item} title={t.dlGif} aria-label={`${seed}: ${t.dlGif}`} onClick={act(onGif)}>
          GIF
        </button>
        <button
          className={item}
          title={t.dlPlay}
          aria-label={`${seed}: ${t.dlPlay}`}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setOpen(false);
            onPlay(rect);
          }}
        >
          <PlayIcon />
        </button>
        {onShare && (
          <button className={item} title={copied ? t.shareCopied : t.shareLink} aria-label={`${seed}: ${t.shareLink}`} onClick={share}>
            {copied ? <CheckIcon /> : <LinkIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
