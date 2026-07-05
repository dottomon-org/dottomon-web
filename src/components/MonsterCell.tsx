import type { ResolvedOpts } from "@dotmon/core";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
import { bgStyle } from "../lib/checker";
import DownloadBar from "./DownloadBar";
import FavStar from "./FavStar";

interface Props {
  seed: string;
  opts: ResolvedOpts;
  bg: string;
  animate: boolean;
  t: Strings;
  favOn: boolean;
  onToggleFav: () => void;
  onOpen: () => void;
  onPng: () => void;
  onGif: () => void;
  onPlay: (rect: DOMRect) => void;
}

export default function MonsterCell(p: Props) {
  return (
    <div className="cell" style={{ background: bgStyle(p.bg, 12) }}>
      <MonsterAvatar
        className="mon"
        seed={p.seed}
        options={p.opts}
        animate={p.animate}
        size="100%"
        title={`${p.seed}（${p.t.monTitle}）`}
        style={{ aspectRatio: "1", display: "block", cursor: "pointer" }}
        // クリックはラッパーで拾う
      />
      <button className="moncover" aria-label={`${p.seed}: ${p.t.monTitle}`} onClick={p.onOpen} />
      <DownloadBar seed={p.seed} t={p.t} onPng={p.onPng} onGif={p.onGif} onPlay={p.onPlay} />
      <FavStar seed={p.seed} on={p.favOn} t={p.t} onToggle={p.onToggleFav} />
    </div>
  );
}
