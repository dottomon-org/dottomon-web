import type { Strings } from "../i18n";

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
      <div className="namerow">
        <input
          type="text"
          value={p.input}
          spellCheck={false}
          placeholder={p.t.namePlaceholder}
          aria-label={p.t.nameSection}
          onChange={(e) => p.onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && p.onGenerate()}
        />
        {p.canBack && (
          <button className="backbtn" title={p.t.backTitle} aria-label={p.t.backTitle} onClick={p.onBack}>
            ↩
          </button>
        )}
      </div>
      <div className="btnrow">
        <button className="primary" onClick={p.onGenerate}>{p.t.generate}</button>
        <button onClick={p.onRandom}>{p.t.random}</button>
      </div>
      <button className="linklike" onClick={p.onHelp}>{p.t.help}</button>
    </>
  );
}
