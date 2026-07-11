import type { Strings } from "../i18n";
import { btn, btnPrimary, btnShell, focusRing, inputText } from "../lib/ui";

interface Props {
  t: Strings;
  input: string;
  onInput: (v: string) => void;
  onGenerate: () => void;
  onRandom: () => void;
  canBack: boolean;
  onBack: () => void;
  onHelp: () => void;
}

// Name input + generate/random/help controls, shared between the sidebar
// and the mobile quick bar shown below the main preview
export default function NameForm(p: Props) {
  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          className={inputText}
          value={p.input}
          spellCheck={false}
          placeholder={p.t.namePlaceholder}
          aria-label={p.t.nameSection}
          onChange={(e) => p.onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && p.onGenerate()}
        />
        {p.canBack && (
          <button
            className={`${btnShell} flex-none border-line bg-panel2 px-3 py-2.25 text-[15px] leading-none text-ink`}
            title={p.t.backTitle}
            aria-label={p.t.backTitle}
            onClick={p.onBack}
          >
            ↩
          </button>
        )}
      </div>
      <div className="mt-2.5 flex gap-2">
        <button className={`${btnPrimary} flex-1`} onClick={p.onGenerate}>{p.t.generate}</button>
        <button className={`${btn} flex-1`} onClick={p.onRandom}>{p.t.random}</button>
      </div>
      <button
        className={`w-full cursor-pointer pt-2 text-center text-[11px] text-dim underline underline-offset-[3px] hover:text-acid ${focusRing}`}
        onClick={p.onHelp}
      >
        {p.t.help}
      </button>
    </>
  );
}
