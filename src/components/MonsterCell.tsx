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
  onShare: () => string;
}

/** Transparent click layer over the avatar (overlay chips sit above it) */
export const monCover =
  "absolute inset-0 z-[1] cursor-pointer rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgba(184,245,66,0.55)]";

export default function MonsterCell(p: Props) {
  return (
    <div
      className="group/cell relative rounded-lg border border-line p-[7px]"
      style={{ background: bgStyle(p.bg, 12) }}
    >
      <MonsterAvatar
        className="block"
        seed={p.seed}
        options={p.opts}
        animate={p.animate}
        size="100%"
        title={`${p.seed}（${p.t.monTitle}）`}
        style={{ aspectRatio: "1", display: "block", cursor: "pointer" }}
        // clicks are picked up by the cover button below
      />
      <button
        type="button"
        className={monCover}
        aria-label={`${p.seed}: ${p.t.monTitle}`}
        onClick={p.onOpen}
      />
      <DownloadBar
        small
        seed={p.seed}
        t={p.t}
        onPng={p.onPng}
        onGif={p.onGif}
        onPlay={p.onPlay}
        onShare={p.onShare}
      />
      <FavStar
        small
        seed={p.seed}
        on={p.favOn}
        t={p.t}
        onToggle={p.onToggleFav}
      />
    </div>
  );
}
