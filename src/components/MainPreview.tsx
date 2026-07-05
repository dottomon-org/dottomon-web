import type { ResolvedOpts } from "@dotmon/core";
import type { LocaleDict } from "@dotmon/core/locales";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
import { bgStyle } from "../lib/checker";
import DownloadBar from "./DownloadBar";
import FavStar from "./FavStar";
import StatsPanel from "./StatsPanel";

interface Props {
  seed: string;
  opts: ResolvedOpts;
  bg: string;
  animate: boolean;
  t: Strings;
  dict: LocaleDict;
  favOn: boolean;
  onToggleFav: () => void;
  onOpen: () => void;
  onPng: () => void;
  onGif: () => void;
  onPlay: (rect: DOMRect) => void;
}

export default function MainPreview(p: Props) {
  return (
    <section className="panel preview">
      <div className="mainmon" style={{ background: bgStyle(p.bg, 20) }}>
        <MonsterAvatar seed={p.seed} options={p.opts} animate={p.animate} size={184} title={p.t.monTitle} />
        <button className="moncover" aria-label={p.t.monTitle} onClick={p.onOpen} />
        <DownloadBar seed={p.seed} t={p.t} onPng={p.onPng} onGif={p.onGif} onPlay={p.onPlay} />
        <FavStar seed={p.seed} on={p.favOn} t={p.t} onToggle={p.onToggleFav} />
      </div>
      <div className="meta">
        <div className="nameline">
          <span className="nlabel">{p.t.nameLabel}</span>
          <span className="seedname" title={p.seed}>{p.seed}</span>
        </div>
        <StatsPanel seed={p.seed} opts={p.opts} dict={p.dict} />
      </div>
    </section>
  );
}
