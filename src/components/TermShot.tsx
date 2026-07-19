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
const WIDE_CHUNK = /([\u3000-\u9fff\uf900-\ufaff\uff00-\uff60\uffe0-\uffe6]+)/;

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

/** Terminal-window mock showing a command and its captured colored output */
export default function TermShot({
  command,
  lines,
  copyLabel,
  copiedMsg,
}: Props) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-bg">
      <div className="flex items-center gap-1.5 border-b border-line bg-panel2 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <button
          type="button"
          title={copyLabel}
          aria-label={copyLabel}
          className={`ml-auto cursor-pointer rounded border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-dim hover:text-ink ${focusRing}`}
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
      {/* leading-none: half-block rows must touch or the sprite shows gaps */}
      <pre className="overflow-x-auto p-3 text-[12px] leading-none text-ink">
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
