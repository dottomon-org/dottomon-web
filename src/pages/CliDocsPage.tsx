import CodeBlock from "../components/CodeBlock";
import { useLocaleCtx } from "../components/Layout";
import TermShot from "../components/TermShot";
import { panel, panelH2 } from "../lib/ui";
import { DEMO_BASIC, DEMO_CARD_EN, DEMO_CARD_JA } from "./cliDemos";

interface OptRow {
  flag: string;
  d: string;
}

interface OptGroup {
  title: string;
  rows: OptRow[];
}

const COPY = {
  en: {
    intro:
      "The same monsters, straight in your terminal. One npx command draws colored half-block sprites — with stat cards, walk animations, and game-ready asset exports.",
    copy: "Copy command",
    runDesc:
      "No install step — npx runs it directly. The name is the seed, so the same name gives you the same monster as the web app.",
    cardDesc:
      "--card prints an RPG-style stat card; stats are derived from the name. --card-full (-C) adds colored stat bars, and --lang switches the card language.",
    cardCmd: "npx dottomon Poko --card",
    cardDemo: DEMO_CARD_EN,
    optionsDesc: "Run npx dottomon --help to see this list in your terminal.",
    groups: [
      {
        title: "Display",
        rows: [
          {
            flag: "-s, --style <mochi|retro|chaos>",
            d: "style preset (default: mochi)",
          },
          {
            flag: "--view <front|back|left|right>",
            d: "viewing direction (default: front)",
          },
          { flag: "-c, --card", d: "show an RPG-style card with stats" },
          {
            flag: "-C, --card-full",
            d: "card with colored stat bars (like the web app)",
          },
          {
            flag: "-n, --count <1-10>",
            d: "siblings side by side (name, name-1, name-2, …)",
          },
          {
            flag: "-w, --walk",
            d: "play the 2-frame walk animation, then exit",
          },
        ],
      },
      {
        title: "Output",
        rows: [
          {
            flag: "-o, --out <file>",
            d: "save as .svg / .png / .gif (by extension)",
          },
          {
            flag: "--size <px>",
            d: "image size for --out (png: 512, gif: 256)",
          },
          {
            flag: "-z, --zip",
            d: "save <name>.zip with every asset (README, 12 PNGs, 4 GIFs, sprite sheet)",
          },
        ],
      },
      {
        title: "Misc",
        rows: [
          {
            flag: "--lang <ja|en>",
            d: "card/README language (default: from $LANG)",
          },
          { flag: "--no-color", d: "plain block characters, no ANSI colors" },
          { flag: "--no-name", d: "hide the name label under each sprite" },
        ],
      },
    ] as OptGroup[],
    examples: `npx dottomon Poko                     # sprite + name label
npx dottomon ポコ --card --lang ja     # stat card in Japanese
npx dottomon --style chaos --walk     # random name, chaos style, walking
npx dottomon Poko -n 5                # five siblings side by side
npx dottomon Poko -o poko.png --size 1024
npx dottomon Poko --zip               # every asset in one ZIP`,
  },
  ja: {
    intro:
      "おなじモンスターを、ターミナルでそのまま。npx コマンドひとつで色付きスプライトを描画 — ステータスカード・歩行アニメ・ゲーム用アセット出力もできます。",
    copy: "コマンドをコピー",
    runDesc:
      "インストール不要で npx からそのまま実行できます。名前が seed になるので、おなじ名前からは Web アプリと同じモンスターがうまれます。",
    cardDesc:
      "--card は RPG 風のステータスカードを表示します（ステータスは名前から決まります）。--card-full (-C) は色付きステータスバー、--lang はカードの言語を切り替えます。",
    cardCmd: "npx dottomon ポコ --card --lang ja",
    cardDemo: DEMO_CARD_JA,
    optionsDesc: "npx dottomon --help でこの一覧をターミナルでも確認できます。",
    groups: [
      {
        title: "Display",
        rows: [
          {
            flag: "-s, --style <mochi|retro|chaos>",
            d: "スタイルプリセット（デフォルト: mochi）",
          },
          {
            flag: "--view <front|back|left|right>",
            d: "向き（デフォルト: front）",
          },
          { flag: "-c, --card", d: "ステータス付きの RPG 風カードを表示" },
          {
            flag: "-C, --card-full",
            d: "色付きステータスバーのカード（Web アプリと同じ見た目）",
          },
          {
            flag: "-n, --count <1-10>",
            d: "にた名前のなかまを横に並べる（name, name-1, name-2, …）",
          },
          { flag: "-w, --walk", d: "2 コマの歩行アニメを再生して終了" },
        ],
      },
      {
        title: "Output",
        rows: [
          {
            flag: "-o, --out <file>",
            d: "拡張子に応じて .svg / .png / .gif で保存",
          },
          {
            flag: "--size <px>",
            d: "--out の画像サイズ（png: 512、gif: 256）",
          },
          {
            flag: "-z, --zip",
            d: "全アセット入りの <name>.zip を保存（README、PNG 12 枚、GIF 4 本、スプライトシート）",
          },
        ],
      },
      {
        title: "Misc",
        rows: [
          {
            flag: "--lang <ja|en>",
            d: "カード / README の言語（デフォルト: $LANG から）",
          },
          { flag: "--no-color", d: "ANSI カラーなしのプレーンなブロック文字" },
          { flag: "--no-name", d: "スプライト下の名前ラベルを隠す" },
        ],
      },
    ] as OptGroup[],
    examples: `npx dottomon Poko                     # スプライト + 名前ラベル
npx dottomon ポコ --card --lang ja     # 日本語のステータスカード
npx dottomon --style chaos --walk     # 名前おまかせ・カオス・歩行アニメ
npx dottomon Poko -n 5                # なかま 5 ひきを横並びで
npx dottomon Poko -o poko.png --size 1024
npx dottomon Poko --zip               # ぜんぶ入り ZIP で保存`,
  },
} as const;

const desc = "mb-3 text-[13px]";

export default function CliDocsPage() {
  const { locale, t } = useLocaleCtx();
  const c = COPY[locale];

  return (
    <>
      <p className="-mt-4 mb-5.5 text-[12.5px] text-dim">{c.intro}</p>

      <main className="grid gap-4.5 max-md:gap-3">
        <section className={panel}>
          <h2 className={panelH2}>Run</h2>
          <p className={desc}>{c.runDesc}</p>
          <TermShot
            command="npx dottomon Poko"
            lines={DEMO_BASIC}
            copyLabel={c.copy}
            copiedMsg={t.shareCopied}
          />
        </section>

        <section className={panel}>
          <h2 className={panelH2}>Cards</h2>
          <p className={desc}>{c.cardDesc}</p>
          <TermShot
            command={c.cardCmd}
            lines={c.cardDemo}
            copyLabel={c.copy}
            copiedMsg={t.shareCopied}
          />
        </section>

        <section className={panel}>
          <h2 className={panelH2}>Options</h2>
          <p className="mb-3 text-[12.5px] text-dim">{c.optionsDesc}</p>
          <div className="grid gap-4">
            {c.groups.map((g) => (
              <div key={g.title}>
                <h3 className="mb-2 text-[11px] font-bold tracking-[0.2em] text-dim uppercase">
                  {g.title}
                </h3>
                <ul className="grid list-none gap-1.5 p-0 text-[12.5px]">
                  {g.rows.map((r) => (
                    <li
                      key={r.flag}
                      className="grid grid-cols-[240px_1fr] gap-2 max-sm:grid-cols-1 max-sm:gap-0.5"
                    >
                      <code className="text-acid">{r.flag}</code>
                      <span className="text-dim">{r.d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={panel}>
          <h2 className={panelH2}>Examples</h2>
          <CodeBlock
            code={c.examples}
            lang="bash"
            copyLabel={c.copy}
            copiedMsg={t.shareCopied}
          />
        </section>
      </main>
    </>
  );
}
