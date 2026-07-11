import type { Strings } from "../i18n";
import { chip } from "../lib/ui";
import { StarIcon } from "./Icons";

interface Props {
  seed: string;
  on: boolean;
  t: Strings;
  onToggle: () => void;
  /** Cell-sized (18px, revealed on cell hover) instead of the 22px main-preview chip */
  small?: boolean;
}

// The favorited star never fades — only the chip behind it is light at rest
// and darkens on hover, mirroring the other overlay buttons. The `!` on the
// direct-hover opacities lets them beat the group-hover resting value.
export default function FavStar({ seed, on, t, onToggle, small }: Props) {
  const size = small
    ? "top-[3px] left-[3px] size-[18px] pointer-coarse:size-6"
    : "top-1 left-1 size-[22px] pointer-coarse:size-[26px]";
  const state = on
    ? "opacity-100 bg-[rgba(16,16,31,0.45)] text-[#ffd23e] [--fav-fill:#ffd23e]"
    : small
      ? "opacity-0 bg-[rgba(16,16,31,0.72)] text-white group-hover/cell:opacity-60 hover:opacity-100! focus-visible:opacity-100! pointer-coarse:opacity-85 pointer-coarse:bg-[rgba(16,16,31,0.45)]"
      : "opacity-60 bg-[rgba(16,16,31,0.72)] text-white hover:opacity-100 pointer-coarse:opacity-85 pointer-coarse:bg-[rgba(16,16,31,0.45)]";
  return (
    <button
      className={`${chip} absolute z-[2] p-0.5 pointer-coarse:p-1 ${size} ${state}`}
      title={t.favTitle}
      aria-label={`${seed}: ${t.favTitle}`}
      aria-pressed={on}
      onClick={onToggle}
    >
      <StarIcon />
    </button>
  );
}
