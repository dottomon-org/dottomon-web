/**
 * TEMPORARY page — not part of the app. Renders a grid of monster thumbnails
 * (no favorite/download/play UI) so a README banner image can be screenshotted.
 *
 * Dev URL: http://localhost:5199/thumbnail.html
 * Paste the favorites array you copied from localStorage["dotmon:favorites"]
 * (or any array of {seed, opts} / bare seed strings) into the textarea.
 *
 * Teardown: delete this file and thumbnail.html — nothing else references them.
 */
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { resolveOptions, type ResolvedOpts } from "@dotmon/core";
import { MonsterAvatar } from "@dotmon/react";
import { bgStyle } from "./lib/checker";

interface Entry {
  seed: string;
  opts: ResolvedOpts;
}

// A few favorites so the page isn't empty on first load — replace by pasting yours
const SAMPLE = JSON.stringify(
  Array.from({ length: 28 }, (_, i) => ({ seed: `dotmon-${i + 1}`, opts: null })),
);

// Accept the exact array shape stored in localStorage: {seed, opts} objects,
// bare seed strings (legacy), and opts:null (no pinned style → default look)
function parseFavs(text: string): { entries: Entry[]; error: string | null } {
  const trimmed = text.trim();
  if (!trimmed) return { entries: [], error: null };
  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch {
    return { entries: [], error: "Not valid JSON" };
  }
  if (!Array.isArray(raw)) return { entries: [], error: "Expected a JSON array of favorites" };
  const fallback = resolveOptions();
  const entries: Entry[] = [];
  for (const f of raw) {
    if (typeof f === "string") {
      entries.push({ seed: f, opts: fallback });
    } else if (f && typeof f === "object" && typeof (f as Entry).seed === "string") {
      const o = (f as { seed: string; opts?: ResolvedOpts | null }).opts;
      entries.push({ seed: (f as Entry).seed, opts: o ?? fallback });
    }
  }
  return { entries, error: null };
}

function Thumbnail() {
  const [text, setText] = useState(SAMPLE);
  const [cols, setCols] = useState(7);
  const [cell, setCell] = useState(96);
  const [gap, setGap] = useState(14);
  const [radius, setRadius] = useState(12);
  const [padPct, setPadPct] = useState(9);
  const [checker, setChecker] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [pageBg, setPageBg] = useState("#10101f");
  const [sheetPad, setSheetPad] = useState(20);

  const { entries, error } = useMemo(() => parseFavs(text), [text]);
  const pad = Math.round((cell * padPct) / 100);

  return (
    <div className="tw">
      <style>{CSS}</style>
      <aside className="ctrl">
        <h1>dotmon thumbnail sheet</h1>
        <p className="note">
          Temporary page for a README banner. Paste your favorites JSON (from{" "}
          <code>localStorage["dotmon:favorites"]</code>) below, then screenshot the sheet on the right.
        </p>
        <label className="f">
          <span>Favorites JSON</span>
          <textarea value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} rows={10} />
        </label>
        <div className="status">
          {error ? <span className="err">⚠ {error}</span> : <span>{entries.length} monsters</span>}
        </div>
        <div className="row">
          <label className="n"><span>Columns</span><input type="number" min={1} max={20} value={cols} onChange={(e) => setCols(clamp(e.target.value, 1, 20, 7))} /></label>
          <label className="n"><span>Cell px</span><input type="number" min={24} max={256} step={4} value={cell} onChange={(e) => setCell(clamp(e.target.value, 24, 512, 96))} /></label>
        </div>
        <div className="row">
          <label className="n"><span>Gap px</span><input type="number" min={0} max={64} value={gap} onChange={(e) => setGap(clamp(e.target.value, 0, 128, 14))} /></label>
          <label className="n"><span>Radius px</span><input type="number" min={0} max={48} value={radius} onChange={(e) => setRadius(clamp(e.target.value, 0, 128, 12))} /></label>
        </div>
        <div className="row">
          <label className="n"><span>Padding %</span><input type="number" min={0} max={40} value={padPct} onChange={(e) => setPadPct(clamp(e.target.value, 0, 40, 9))} /></label>
          <label className="n"><span>Sheet pad px</span><input type="number" min={0} max={80} value={sheetPad} onChange={(e) => setSheetPad(clamp(e.target.value, 0, 200, 20))} /></label>
        </div>
        <label className="cb"><input type="checkbox" checked={checker} onChange={(e) => setChecker(e.target.checked)} /> Checker cell background</label>
        <label className="cb"><input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} /> Animate (walk loop — for GIF)</label>
        <label className="cb bgc">
          <span>Page background</span>
          <input type="color" value={pageBg} onChange={(e) => setPageBg(e.target.value)} />
          <button type="button" onClick={() => setPageBg("transparent")}>transparent</button>
        </label>
        <p className="note">Tip: screenshot the <code>#sheet</code> element for a still. For a GIF, tick Animate and screen-record the sheet (2-frame walk loop, all cells synced), then convert to GIF.</p>
      </aside>

      <main className="stage" style={{ background: pageBg === "transparent" ? bgStyle("transparent", 20) : pageBg }}>
        <div
          id="sheet"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
            gap: `${gap}px`,
            padding: `${sheetPad}px`,
            width: "max-content",
          }}
        >
          {entries.map((e, i) => (
            <div
              key={e.seed + "|" + i}
              style={{
                width: cell,
                height: cell,
                borderRadius: radius,
                padding: pad,
                background: checker ? bgStyle("transparent", 12) : "#ffffff",
              }}
            >
              <MonsterAvatar seed={e.seed} options={e.opts} view="front" size="100%" animate={animate} style={{ aspectRatio: "1", display: "block" }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function clamp(v: string, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .tw { display: grid; grid-template-columns: 320px 1fr; min-height: 100vh; font-family: "SF Mono", Consolas, Menlo, monospace; color: #e8e8f2; }
  .ctrl { background: #14142a; border-right: 1px solid #34345a; padding: 18px; overflow-y: auto; max-height: 100vh; display: grid; gap: 12px; align-content: start; }
  .ctrl h1 { font-size: 15px; margin: 0; letter-spacing: 0.02em; }
  .ctrl .note { font-size: 11px; color: #8f8fb0; line-height: 1.6; margin: 0; }
  .ctrl code { color: #b8f542; font-size: 10.5px; word-break: break-all; }
  .f { display: grid; gap: 5px; }
  .f > span { font-size: 11px; color: #8f8fb0; text-transform: uppercase; letter-spacing: 0.1em; }
  textarea { width: 100%; background: #10101f; border: 1px solid #34345a; border-radius: 8px; color: #e8e8f2; font-family: inherit; font-size: 11px; padding: 8px; resize: vertical; }
  textarea:focus { outline: none; border-color: #b8f542; }
  .status { font-size: 12px; color: #b8f542; }
  .status .err { color: #ff6bb3; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .n { display: grid; gap: 4px; }
  .n > span { font-size: 10.5px; color: #8f8fb0; }
  .n input { background: #10101f; border: 1px solid #34345a; border-radius: 6px; color: #e8e8f2; font-family: inherit; font-size: 12px; padding: 6px 8px; }
  .n input:focus { outline: none; border-color: #b8f542; }
  .cb { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .cb input[type=checkbox] { accent-color: #b8f542; width: 15px; height: 15px; }
  .cb.bgc { justify-content: flex-start; }
  .cb.bgc input[type=color] { width: 34px; height: 26px; padding: 2px; background: #10101f; border: 1px solid #34345a; border-radius: 6px; }
  .cb.bgc button { background: #22223c; border: 1px solid #34345a; border-radius: 6px; color: #e8e8f2; font-family: inherit; font-size: 11px; padding: 4px 8px; cursor: pointer; }
  .stage { display: grid; place-items: center; padding: 24px; overflow: auto; }
`;

createRoot(document.getElementById("root")!).render(<Thumbnail />);
