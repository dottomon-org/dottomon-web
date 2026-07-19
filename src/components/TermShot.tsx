import type { CSSProperties } from "react";
import { focusRing } from "../lib/ui";
import { toast } from "./Toast";

/** One styled span of captured terminal output */
export interface TermRun {
  t: string;
  fg?: string;
  bg?: string;
  b?: 1;
}

interface Props {
  command: string;
  lines: TermRun[][];
  copyLabel: string;
  copiedMsg: string;
}

// Wide chars (CJK, full-width forms) take 2 terminal cells but render at a
// different width in browser fonts. Pinning each wide chunk to its exact
// cell count in `ch` units keeps box borders and columns aligned.
const WIDE_CHUNK = /([　-鿿豈-﫿＀-｠￠-￦]+)/;

function renderText(text: string) {
  return text.split(WIDE_CHUNK).map((seg, i) =>
    i % 2 === 1 ? (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: static captured output, never reordered
        key={i}
        className="inline-block whitespace-pre align-bottom"
        style={{ width: `${2 * [...seg].length}ch` }}
      >
        {seg}
      </span>
    ) : (
      seg
    ),
  );
}

/**
 * Half-block glyphs (▀ ▄ █) never tile cleanly with font rendering: their ink
 * height matches neither the font size nor the font's line height, so text
 * rows either overlap or leave gaps (real terminals solve this by drawing
 * block glyphs procedurally instead of using the font). Do the same here:
 * render each block-char cell as a fixed 1ch × 1lh box whose background
 * paints the top/bottom halves, independent of any font metrics.
 */
function cellStyle(ch: string, len: number, r: TermRun): CSSProperties {
  const fg = r.fg ?? "currentColor";
  const bg = r.bg ?? "transparent";
  const background =
    ch === "█"
      ? fg
      : ch === "▀"
        ? `linear-gradient(${fg} 50%, ${bg} 50%)`
        : ch === "▄"
          ? `linear-gradient(${bg} 50%, ${fg} 50%)`
          : bg; // space inside a bg-colored run
  return { width: `${len}ch`, background };
}

// Groups: runs of one repeated block char / runs of spaces / plain text
const CELL_GROUPS = /([▀▄█])\1*| +|[^▀▄█ ]+/g;

function renderRun(r: TermRun) {
  const groups = r.t.match(CELL_GROUPS) ?? [];
  return groups.map((g, i) => {
    const ch = g[0];
    if (ch === "▀" || ch === "▄" || ch === "█" || (ch === " " && r.bg)) {
      return (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static captured output, never reordered
          key={i}
          className="inline-block h-[1lh] align-top"
          style={cellStyle(ch, [...g].length, r)}
        />
      );
    }
    return (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: static captured output, never reordered
        key={i}
        style={{ backgroundColor: r.bg }}
      >
        {renderText(g)}
      </span>
    );
  });
}

/** Terminal-window mock showing a command and its captured colored output */
export default function TermShot({
  command,
  lines,
  copyLabel,
  copiedMsg,
}: Props) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-line">
      <div className="flex items-center gap-1.5 border-b border-[#d3d3da] bg-[#e8e8ec] px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <button
          type="button"
          title={copyLabel}
          aria-label={copyLabel}
          className={`ml-auto cursor-pointer rounded border border-[#c8c8d0] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#5a5a68] hover:text-[#1a1a2e] ${focusRing}`}
          onClick={() =>
            navigator.clipboard
              .writeText(command)
              .then(() => toast(copiedMsg))
              .catch(() => {})
          }
        >
          copy
        </button>
      </div>
      {/* Light terminal: captured runs carry their own sprite colors; only the
          uncolored text (prompt, labels, card border) follows this dark ink */}
      <pre className="overflow-x-auto bg-white p-3 text-[12px] leading-[1.2] text-[#1f2328]">
        <code>
          <span className="text-[#1a7f37]">$ </span>
          {command}
          {"\n"}
          {lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static captured output, never reordered
            <span key={i}>
              {line.map((r, j) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: static captured output, never reordered
                  key={j}
                  style={{
                    color: r.fg,
                    fontWeight: r.b ? 700 : undefined,
                  }}
                >
                  {renderRun(r)}
                </span>
              ))}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
