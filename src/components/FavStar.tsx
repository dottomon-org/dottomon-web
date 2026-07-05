import type { Strings } from "../i18n";
import { StarIcon } from "./Icons";

export default function FavStar({ seed, on, t, onToggle }: { seed: string; on: boolean; t: Strings; onToggle: () => void }) {
  return (
    <button
      className={"fav" + (on ? " on" : "")}
      title={t.favTitle}
      aria-label={`${seed}: ${t.favTitle}`}
      aria-pressed={on}
      onClick={onToggle}
    >
      <StarIcon />
    </button>
  );
}
