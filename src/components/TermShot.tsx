import { useLayoutEffect, useRef, useState } from "react";
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
const WIDE_CHUNK = /([　-鿿豈-﫿＀-｠￠-￦]+)/;

function renderCells(text: string) {
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
 * Half-block sprite rows only tile seamlessly when the line height equals the
 * exact drawn height of the block glyph — which matches neither the font size
 * (rows overlap) nor the font's normal line height (rows show gaps). Measure
 * █'s ink bounds in the pre's actual font and use that as the line height.
 */
function useCellLineHeight(ref: React.RefObject<HTMLPreElement | null>) {
  const [lineHeight, setLineHeight] = useState<string>("1.2");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;
    ctx.font = `${style.fontSize} ${style.fontFamily}`;
    const m = ctx.measureText("█");
    const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    if (h > 0) setLineHeight(`${h}px`);
  }, [ref]);
  return lineHeight;
}

/** Terminal-window mock showing a command and its captured colored output */
export default function TermShot({
  command,
  lines,
  copyLabel,
  copiedMsg,
}: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const lineHeight = useCellLineHeight(preRef);

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-panel2">
      <div className="flex items-center gap-1.5 border-b border-line bg-panel px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <button
          type="button"
          title={copyLabel}
          aria-label={copyLabel}
          className={`ml-auto cursor-pointer rounded border border-line bg-panel2 px-1.5 py-0.5 font-mono text-[10px] text-dim hover:text-ink ${focusRing}`}
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
      <pre
        ref={preRef}
        className="overflow-x-auto p-3 text-[12px] text-ink"
        style={{ lineHeight }}
      >
        <code>
          <span className="text-acid">$ </span>
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
                    backgroundColor: r.bg,
                    fontWeight: r.b ? 700 : undefined,
                  }}
                >
                  {renderCells(r.t)}
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
