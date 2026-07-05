import type { ResolvedOpts } from "@dotmon/core";
import type { Strings } from "../i18n";
import type { Fav } from "../hooks/useFavorites";
import MonsterCell from "./MonsterCell";

interface Props {
  favs: Fav[];
  currentOpts: ResolvedOpts;
  bg: string;
  animate: boolean;
  t: Strings;
  onToggle: (seed: string, opts: ResolvedOpts | null) => void;
  onClear: () => void;
  onOpen: (seed: string, opts: ResolvedOpts) => void;
  onPng: (seed: string, opts: ResolvedOpts) => void;
  onGif: (seed: string, opts: ResolvedOpts) => void;
  onPlay: (seed: string, opts: ResolvedOpts | null, rect: DOMRect) => void;
}

export default function FavoritesSection(p: Props) {
  return (
    <section className="panel">
      <div className="favhead">
        <h2>{p.t.favorites}</h2>
        <button
          id="favclear"
          onClick={() => {
            if (!p.favs.length) return;
            if (!confirm(p.t.favClearConfirm)) return;
            p.onClear();
          }}
        >
          {p.t.favClear}
        </button>
      </div>
      <div className="grid">
        {p.favs.map((f, i) => {
          const fo = f.opts ?? p.currentOpts;
          return (
            <MonsterCell
              key={f.seed + ":" + i}
              seed={f.seed}
              opts={fo}
              bg={p.bg}
              animate={p.animate}
              t={p.t}
              favOn={true}
              onToggleFav={() => p.onToggle(f.seed, f.opts)}
              onOpen={() => p.onOpen(f.seed, fo)}
              onPng={() => p.onPng(f.seed, fo)}
              onGif={() => p.onGif(f.seed, fo)}
              onPlay={(rect) => p.onPlay(f.seed, f.opts, rect)}
            />
          );
        })}
      </div>
      {p.favs.length === 0 && <div className="vnote">{p.t.favEmpty}</div>}
    </section>
  );
}
