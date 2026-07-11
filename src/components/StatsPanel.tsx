import { getStats, type ResolvedOpts } from "@dotmon/core";
import type { LocaleDict } from "@dotmon/core/locales";
import { useMemo } from "react";

// Bar colors and max values are presentation concerns, so the web app owns
// them (the library returns the raw numbers)
const ROWS = [
  { k: "hp", max: 800, c: "#8ee06b" },
  { k: "mp", max: 400, c: "#6bb8ff" },
  { k: "atk", max: 99, c: "#ff6bb3" },
  { k: "def", max: 99, c: "#ffb85c" },
  { k: "spd", max: 99, c: "#5ce0d8" },
  { k: "luck", max: 99, c: "#ffd23e" },
] as const;

const ROW_CLS = "grid grid-cols-[62px_34px_1fr] items-center gap-2 text-[11px]";
const KEY_CLS = "text-dim";
const VAL_CLS = "text-right font-bold text-ink tabular-nums";

export default function StatsPanel({
  seed,
  opts,
  dict,
}: {
  seed: string;
  opts: ResolvedOpts;
  dict: LocaleDict;
}) {
  const optsKey = JSON.stringify(opts);
  // biome-ignore lint/correctness/useExhaustiveDependencies: opts changes are tracked via its serialized key
  const st = useMemo(() => getStats(seed, opts), [seed, optsKey]);
  return (
    <div className="grid gap-0.5">
      <div className={ROW_CLS}>
        <span className={KEY_CLS}>{dict.stats.lv}</span>
        <span className={VAL_CLS}>{st.lv}</span>
        <div className="flex items-center">
          <span className="rounded-full border border-line bg-panel2 px-2.75 py-px text-[10.5px] leading-[1.6] text-ink">
            {dict.natures[st.nature]}
          </span>
        </div>
      </div>
      {ROWS.map((r) => (
        <div className={ROW_CLS} key={r.k}>
          <span className={KEY_CLS}>{dict.stats[r.k]}</span>
          <span className={VAL_CLS}>{st[r.k]}</span>
          <div className="h-3 overflow-hidden border border-line bg-bg">
            <i
              className="block h-full"
              style={{
                width: `${Math.min(100, (st[r.k] / r.max) * 100)}%`,
                background: r.c,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
