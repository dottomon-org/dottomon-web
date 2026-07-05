import type { Strings } from "../i18n";
import { DlIcon, PlayIcon } from "./Icons";

interface Props {
  seed: string;
  t: Strings;
  onPng: () => void;
  onGif: () => void;
  onPlay: (rect: DOMRect) => void;
}

export default function DownloadBar({ seed, t, onPng, onGif, onPlay }: Props) {
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
    </div>
  );
}
