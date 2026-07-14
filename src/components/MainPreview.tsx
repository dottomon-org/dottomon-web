import type { ResolvedOpts } from "dottomon";
import type { LocaleDict } from "dottomon/locales";
import { MonsterAvatar } from "dottomon/react";
import type { Strings } from "../i18n";
import { bgStyle } from "../lib/checker";
import { panel } from "../lib/ui";
import DownloadBar from "./DownloadBar";
import FavStar from "./FavStar";
import { monCover } from "./MonsterCell";
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
  onShare: () => string;
}

export default function MainPreview(p: Props) {
  return (
    <section
      className={`${panel} grid grid-cols-[210px_1fr] items-center gap-4.5 max-md:gap-3 max-sm:grid-cols-1 max-sm:justify-items-center`}
    >
      <div
        className="relative grid size-52.5 place-items-center rounded-[10px] border border-line"
        style={{ background: bgStyle(p.bg, 20) }}
      >
        <MonsterAvatar
          seed={p.seed}
          options={p.opts}
          animate={p.animate}
          size={184}
          title={p.t.monTitle}
        />
        <button
          type="button"
          className={monCover}
          aria-label={p.t.monTitle}
          onClick={p.onOpen}
        />
        <DownloadBar
          seed={p.seed}
          t={p.t}
          onPng={p.onPng}
          onGif={p.onGif}
          onPlay={p.onPlay}
          onShare={p.onShare}
        />
        <FavStar seed={p.seed} on={p.favOn} t={p.t} onToggle={p.onToggleFav} />
      </div>
      <div className="min-w-0 text-[12.5px] text-dim max-sm:w-full max-sm:px-4 [&>*+*]:mt-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="flex-none">{p.t.nameLabel}</span>
          <span
            className="min-w-0 flex-[0_1_auto] overflow-hidden text-[19px] font-bold tracking-[0.02em] text-ellipsis whitespace-nowrap text-acid"
            title={p.seed}
          >
            {p.seed}
          </span>
        </div>
        <StatsPanel seed={p.seed} opts={p.opts} dict={p.dict} />
      </div>
    </section>
  );
}
