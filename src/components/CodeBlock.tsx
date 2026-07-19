import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import { focusRing } from "../lib/ui";
import { toast } from "./Toast";

Prism.manual = true;

export type CodeLang = "tsx" | "bash";

interface Props {
  code: string;
  lang?: CodeLang;
  copyLabel: string;
  copiedMsg: string;
}

/** Code sample with syntax highlighting and a copy-to-clipboard button */
export default function CodeBlock({ code, lang, copyLabel, copiedMsg }: Props) {
  return (
    <div className="relative min-w-0">
      <pre className="overflow-x-auto rounded-lg border border-line bg-panel2 p-3 pr-16 text-[12px] leading-[1.7] text-ink">
        {lang ? (
          <code
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Prism output of our own string literals, no user input
            dangerouslySetInnerHTML={{
              __html: Prism.highlight(code, Prism.languages[lang], lang),
            }}
          />
        ) : (
          <code>{code}</code>
        )}
      </pre>
      <button
        type="button"
        title={copyLabel}
        aria-label={copyLabel}
        className={`absolute top-2 right-2 cursor-pointer rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[10px] text-dim hover:text-ink ${focusRing}`}
        onClick={() =>
          navigator.clipboard
            .writeText(code)
            .then(() => toast(copiedMsg))
            .catch(() => {})
        }
      >
        copy
      </button>
    </div>
  );
}
