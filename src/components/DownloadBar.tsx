import { useEffect, useRef, useState } from "react";
import type { Strings } from "../i18n";
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
}

// On touch devices the actions collapse behind a "⋯" button that opens
// a speech-bubble menu; on pointer devices the bar renders inline as before
// (`.dlmenu` is display:contents there — see index.css)
export default function DownloadBar({ seed, t, onPng, onGif, onPlay, onShare }: Props) {
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

  return (
    <div className={"dlbar" + (open ? " open" : "")} ref={ref}>
      <button
        className="dl more"
        title={t.moreActions}
        aria-label={`${seed}: ${t.moreActions}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⋯
      </button>
      <div className="dlmenu">
        <button className="dl" title={t.dlPng} aria-label={`${seed}: ${t.dlPng}`} onClick={act(onPng)}>
          <DlIcon />
        </button>
        <button className="dl" title={t.dlGif} aria-label={`${seed}: ${t.dlGif}`} onClick={act(onGif)}>
          GIF
        </button>
        <button
          className="dl"
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
          <button className="dl" title={copied ? t.shareCopied : t.shareLink} aria-label={`${seed}: ${t.shareLink}`} onClick={share}>
            {copied ? <CheckIcon /> : <LinkIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
