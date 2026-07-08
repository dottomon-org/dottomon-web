import { useEffect, useRef, useState } from "react";
import type { Strings } from "../i18n";
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

export default function DownloadBar({ seed, t, onPng, onGif, onPlay, onShare }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const share = async () => {
    if (!onShare) return;
    try {
      await navigator.clipboard.writeText(onShare());
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="dlbar">
      <button className="dl" title={t.dlPng} aria-label={`${seed}: ${t.dlPng}`} onClick={onPng}>
        <DlIcon />
      </button>
      <button className="dl" title={t.dlGif} aria-label={`${seed}: ${t.dlGif}`} onClick={onGif}>
        GIF
      </button>
      <button className="dl" title={t.dlPlay} aria-label={`${seed}: ${t.dlPlay}`} onClick={(e) => onPlay(e.currentTarget.getBoundingClientRect())}>
        <PlayIcon />
      </button>
      {onShare && (
        <button className="dl" title={copied ? t.shareCopied : t.shareLink} aria-label={`${seed}: ${t.shareLink}`} onClick={share}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      )}
    </div>
  );
}
