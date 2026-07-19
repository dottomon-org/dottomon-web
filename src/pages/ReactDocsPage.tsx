import type { Preset, View } from "dottomon";
import { MonsterAvatar } from "dottomon/react";
import { type ReactNode, useState } from "react";
import CodeBlock, { type CodeLang } from "../components/CodeBlock";
import { useLocaleCtx } from "../components/Layout";
import { CHECKER } from "../lib/checker";
import { inputText, panel, panelH2 } from "../lib/ui";

const PRESETS: Preset[] = ["mochi", "retro", "chaos"];
const VIEWS: View[] = ["front", "back", "left", "right"];

const USAGE_CODE = `import { MonsterAvatar } from "dottomon/react";

export function Profile() {
  return <MonsterAvatar seed="Poko" size={96} />;
}`;

const SIZE_CODE = `<MonsterAvatar seed="Poko" size={32} />
<MonsterAvatar seed="Poko" size={64} />
<MonsterAvatar seed="Poko" size="6rem" />`;

const OPTIONS_CODE = `<MonsterAvatar
  seed="Poko"
  options={{ outline: false, legs: "many" }}
/>`;

const HOOKS_CODE = `import { useMonster, useMonsterTicker } from "dottomon/react";

const mon = useMonster("Poko", { preset: "chaos" });
mon.stats;          // { lv, hp, atk, ... } — derived from the seed
mon.svg("left", 1); // raw SVG string for any view/frame

const frame = useMonsterTicker(true); // 0 | 1, shared walk ticker`;

interface OptField {
  k: string;
  ty: string;
  d: string;
}

const COPY = {
  en: {
    intro:
      "Render deterministic pixel monsters straight from any string. The same seed always produces the same monster — no storage, no network.",
    copy: "Copy code",
    installNote:
      "Zero dependencies. React 18 or newer (only the react entry point needs React).",
    usageDesc:
      "No config and no network requests — the monster is generated locally from the seed.",
    seedDesc:
      "Required. Any string works — a user name, an email, an ID. The same seed produces the same monster on every render and every device. Try it:",
    seedInputLabel: "Try a seed",
    sizeDesc:
      "A number is pixels; a string is any CSS length. Omit it to fill the parent element.",
    presetDesc: 'Three built-in styles. Defaults to "mochi".',
    optionsDesc:
      "Fine-grained control over generation. Set only what you need — anything omitted falls back to the preset. options.preset overrides the preset prop.",
    optionsFields: [
      { k: "connected", ty: "boolean", d: "keep the body one connected blob" },
      { k: "symmetric", ty: "boolean", d: "mirror the left and right halves" },
      { k: "outline", ty: "boolean", d: "draw the dark outline" },
      { k: "face", ty: "boolean", d: "draw eyes and a mouth" },
      {
        k: "legs",
        ty: '"auto" | "none" | "two" | "many"',
        d: 'leg style ("auto" picks from the seed)',
      },
      {
        k: "gapFill",
        ty: "boolean",
        d: "fill enclosed gaps with white so the background can't show through",
      },
    ] as OptField[],
    optionsDefault: "default",
    viewDesc: 'Which direction the monster faces. Defaults to "front".',
    animateDesc:
      "Two-frame walk cycle. All animated avatars on the page share one ticker, so they walk in step. Defaults to false.",
    backgroundDesc:
      'Fill behind the monster. Defaults to "transparent"; any CSS color works.',
    hooksDesc:
      "Need more than a rendered avatar? useMonster returns the cached generator behind MonsterAvatar — raw SVG strings and name-derived stats. useMonsterTicker exposes the shared walk frame.",
  },
  ja: {
    intro:
      "文字列ひとつから、決定論的にドット絵モンスターを描画します。おなじ seed からは、いつでもおなじモンスターがうまれます — 保存も通信も不要です。",
    copy: "コードをコピー",
    installNote:
      "依存ライブラリはゼロ。React 18 以上が必要です（React が必要なのは react エントリポイントだけです）。",
    usageDesc:
      "設定もネットワークリクエストも不要 — モンスターは seed からその場で生成されます。",
    seedDesc:
      "必須。ユーザー名・メールアドレス・ID など、どんな文字列でも OK。おなじ seed からは、どの環境でもいつでもおなじモンスターがうまれます。ためしてみてください:",
    seedInputLabel: "seed をためす",
    sizeDesc:
      "数値はピクセル、文字列は任意の CSS 長として扱われます。省略すると親要素いっぱいに広がります。",
    presetDesc: '3 つの組み込みスタイル。デフォルトは "mochi" です。',
    optionsDesc:
      "生成を細かく制御します。指定した項目だけが上書きされ、省略分はプリセットの値になります。options.preset は preset プロパティより優先されます。",
    optionsFields: [
      {
        k: "connected",
        ty: "boolean",
        d: "からだを 1 つのつながったカタマリにする",
      },
      { k: "symmetric", ty: "boolean", d: "左右対称にする" },
      { k: "outline", ty: "boolean", d: "ふちどりを描く" },
      { k: "face", ty: "boolean", d: "目と口を描く" },
      {
        k: "legs",
        ty: '"auto" | "none" | "two" | "many"',
        d: 'あしのスタイル（"auto" は seed から自動で決定）',
      },
      {
        k: "gapFill",
        ty: "boolean",
        d: "閉じたすきまを白でうめて、背景の透けを防ぐ",
      },
    ] as OptField[],
    optionsDefault: "デフォルト",
    viewDesc: 'モンスターの向き。デフォルトは "front" です。',
    animateDesc:
      "2 コマの歩行アニメーション。ページ上のアバターはすべて同じティッカーを共有し、そろって足ぶみします。デフォルトは false です。",
    backgroundDesc:
      'モンスターの背景。デフォルトは "transparent" で、任意の CSS 色を指定できます。',
    hooksDesc:
      "描画以上のことをしたい場合は useMonster を使います。MonsterAvatar の背後にあるキャッシュ付きジェネレーターから、SVG 文字列や名前由来のステータスを直接取得できます。useMonsterTicker は共有の歩行フレームを返します。",
  },
} as const;

/** Checkerboard card holding one live avatar, with an optional caption */
function MonCard({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <figure className="m-0 grid content-start justify-items-center gap-1.5">
      <div
        className="grid place-items-end rounded-lg border border-line p-2"
        style={{ background: CHECKER(12) }}
      >
        {children}
      </div>
      {label && (
        <figcaption className="max-w-[140px] text-center font-mono text-[11px] text-dim">
          {label}
        </figcaption>
      )}
    </figure>
  );
}

function Demo({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}

const desc = "mb-3 text-[13px]";

export default function ReactDocsPage() {
  const { locale, t, dict } = useLocaleCtx();
  const c = COPY[locale];
  const [seedInput, setSeedInput] = useState("Poko");
  const seed = seedInput.trim() || "Poko";
  const block = (code: string, lang: CodeLang = "tsx") => (
    <CodeBlock
      code={code}
      lang={lang}
      copyLabel={c.copy}
      copiedMsg={t.shareCopied}
    />
  );

  return (
    <>
      <p className="-mt-4 mb-5.5 text-[12.5px] text-dim">{c.intro}</p>

      {/* grid-cols-1 (= minmax(0,1fr)) lets sections shrink below the code
          blocks' intrinsic width so <pre> scrolls instead of overflowing */}
      <main className="grid grid-cols-1 gap-4.5 max-md:gap-3">
        <section className={panel}>
          <h2 className={panelH2}>Install</h2>
          {block("npm install dottomon", "bash")}
          <p className="mt-3 text-[12.5px] text-dim">{c.installNote}</p>
        </section>

        <section className={panel}>
          <h2 className={panelH2}>Usage</h2>
          <p className={desc}>{c.usageDesc}</p>
          <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            {block(USAGE_CODE)}
            <MonCard>
              <MonsterAvatar seed="Poko" size={96} />
            </MonCard>
          </div>
        </section>

        <h2 className="mt-2 text-[11px] tracking-[0.35em] text-acid uppercase">
          Props
        </h2>

        <section className={panel}>
          <h3 className={panelH2}>seed</h3>
          <p className={desc}>{c.seedDesc}</p>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="grid content-start gap-3">
              {block(`<MonsterAvatar seed="${seed}" />`)}
              <input
                className={inputText}
                type="text"
                aria-label={c.seedInputLabel}
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
              />
            </div>
            <MonCard>
              <MonsterAvatar seed={seed} size={96} />
            </MonCard>
          </div>
        </section>

        <section className={panel}>
          <h3 className={panelH2}>size</h3>
          <p className={desc}>{c.sizeDesc}</p>
          <div className="grid gap-3">
            {block(SIZE_CODE)}
            <Demo>
              <MonCard label="32">
                <MonsterAvatar seed="Poko" size={32} />
              </MonCard>
              <MonCard label="64">
                <MonsterAvatar seed="Poko" size={64} />
              </MonCard>
              <MonCard label={'"6rem"'}>
                <MonsterAvatar seed="Poko" size="6rem" />
              </MonCard>
            </Demo>
          </div>
        </section>

        <section className={panel}>
          <h3 className={panelH2}>preset</h3>
          <p className={desc}>{c.presetDesc}</p>
          <ul className="mb-3 grid list-none gap-1 p-0 text-[12.5px]">
            {PRESETS.map((p) => (
              <li key={p}>
                <code className="text-acid">"{p}"</code>
                <span className="text-dim">
                  {" "}
                  — {dict.presets[p]}: {dict.presetDescriptions[p]}
                </span>
              </li>
            ))}
          </ul>
          <div className="grid gap-3">
            {block(`<MonsterAvatar seed="Poko" preset="retro" />`)}
            <Demo>
              {PRESETS.map((p) => (
                <MonCard key={p} label={`"${p}"`}>
                  <MonsterAvatar seed="Poko" preset={p} size={72} />
                </MonCard>
              ))}
            </Demo>
          </div>
        </section>

        <section className={panel}>
          <h3 className={panelH2}>options</h3>
          <p className={desc}>{c.optionsDesc}</p>
          <ul className="mb-3 grid list-none gap-1 p-0 text-[12.5px]">
            {c.optionsFields.map((f) => (
              <li key={f.k}>
                <code className="text-acid">{f.k}</code>{" "}
                <code className="text-dim">{f.ty}</code>
                <span className="text-dim"> — {f.d}</span>
              </li>
            ))}
          </ul>
          <div className="grid gap-3">
            {block(OPTIONS_CODE)}
            <Demo>
              <MonCard label={c.optionsDefault}>
                <MonsterAvatar seed="Poko" size={72} />
              </MonCard>
              <MonCard label="{ face: false }">
                <MonsterAvatar
                  seed="Poko"
                  options={{ face: false }}
                  size={72}
                />
              </MonCard>
              <MonCard label="{ outline: false }">
                <MonsterAvatar
                  seed="Poko"
                  options={{ outline: false }}
                  size={72}
                />
              </MonCard>
              <MonCard label='{ legs: "many" }'>
                <MonsterAvatar
                  seed="Poko"
                  options={{ legs: "many" }}
                  size={72}
                />
              </MonCard>
            </Demo>
          </div>
        </section>

        <section className={panel}>
          <h3 className={panelH2}>view</h3>
          <p className={desc}>{c.viewDesc}</p>
          <div className="grid gap-3">
            {block(`<MonsterAvatar seed="Poko" view="left" />`)}
            <Demo>
              {VIEWS.map((v) => (
                <MonCard key={v} label={`"${v}" — ${t.viewLabels[v]}`}>
                  <MonsterAvatar seed="Poko" view={v} size={72} />
                </MonCard>
              ))}
            </Demo>
          </div>
        </section>

        <section className={panel}>
          <h3 className={panelH2}>animate</h3>
          <p className={desc}>{c.animateDesc}</p>
          <div className="grid gap-3">
            {block(`<MonsterAvatar seed="Poko" animate />`)}
            <Demo>
              {["Poko", "Momo", "Bibi"].map((s) => (
                <MonCard key={s}>
                  <MonsterAvatar seed={s} animate size={72} />
                </MonCard>
              ))}
            </Demo>
          </div>
        </section>

        <section className={panel}>
          <h3 className={panelH2}>background</h3>
          <p className={desc}>{c.backgroundDesc}</p>
          <div className="grid gap-3">
            {block(`<MonsterAvatar seed="Poko" background="#a5bdd2" />`)}
            <Demo>
              <MonCard label='"transparent"'>
                <MonsterAvatar seed="Poko" size={72} />
              </MonCard>
              <MonCard label='"#a5bdd2"'>
                <MonsterAvatar seed="Poko" background="#a5bdd2" size={72} />
              </MonCard>
            </Demo>
          </div>
        </section>

        <section className={panel}>
          <h2 className={panelH2}>Hooks</h2>
          <p className={desc}>{c.hooksDesc}</p>
          {block(HOOKS_CODE)}
        </section>
      </main>
    </>
  );
}
