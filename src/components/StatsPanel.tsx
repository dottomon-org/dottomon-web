import { useMemo } from "react";
import { getStats, type ResolvedOpts } from "@dotmon/core";
import type { LocaleDict } from "@dotmon/core/locales";

// バーの色・最大値は表示の都合なのでWeb側が持つ（ライブラリは素の数値を返す）
const ROWS = [
  { k: "hp", max: 800, c: "#8ee06b" },
  { k: "mp", max: 400, c: "#6bb8ff" },
  { k: "atk", max: 99, c: "#ff6bb3" },
  { k: "def", max: 99, c: "#ffb85c" },
  { k: "spd", max: 99, c: "#5ce0d8" },
  { k: "luck", max: 99, c: "#ffd23e" },
] as const;

export default function StatsPanel({ seed, opts, dict }: { seed: string; opts: ResolvedOpts; dict: LocaleDict }) {
  const optsKey = JSON.stringify(opts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const st = useMemo(() => getStats(seed, opts), [seed, optsKey]);
  return (
    <div className="stats">
      <div className="stat">
        <span className="sk">{dict.stats.lv}</span>
        <span className="sv">{st.lv}</span>
        <div className="statchip">
          <span className="chip">{dict.natures[st.nature]}</span>
        </div>
      </div>
      {ROWS.map((r) => (
        <div className="stat" key={r.k}>
          <span className="sk">{dict.stats[r.k]}</span>
          <span className="sv">{st[r.k]}</span>
          <div className="sbar">
            <i style={{ width: Math.min(100, (st[r.k] / r.max) * 100) + "%", background: r.c }} />
          </div>
        </div>
      ))}
    </div>
  );
}
