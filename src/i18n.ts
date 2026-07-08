import { useEffect, useState } from "react";
import type { Locale } from "@dotmon/core";
import { pickLocale, type LocaleDict } from "@dotmon/core/locales";
import { en } from "@dotmon/core/locales/en";
import { ja } from "@dotmon/core/locales/ja";

export const DICTS: Record<Locale, LocaleDict> = { en, ja };

// WebアプリのUIコピー（ライブラリ辞書=語彙、こちら=文章、の役割分担）
export const STRINGS = {
  en: {
    sub: "Type a name, get your own pixel monster. The same name always gives you the same one.",
    nameSection: "Name",
    namePlaceholder: "Type a name",
    generate: "Generate",
    random: "Random",
    backTitle: "Back to the previous name",
    help: "How to play",
    styleSection: "Style",
    tweakSection: "Options",
    outline: "Outline",
    face: "Face",
    gapFill: "Fill gaps",
    legsLabel: "Legs",
    animation: "Animation",
    background: "Background",
    transparent: "Transparent",
    bgPickTitle: "Background color (unchecks transparent)",
    herd: (n: number) => `Siblings — ${n} monsters born from the same name`,
    favorites: "Favorites",
    favClear: "Clear all",
    favClearConfirm: "Delete all favorites?",
    favEmpty: "Hover a monster and hit the star — they gather here (saved in this browser).",
    nameLabel: "Name:",
    customStyle: "Custom",
    viewsTitle: "'s views",
    viewLabels: { front: "front", back: "back", left: "left", right: "right" } as const,
    zipButton: "Download everything (ZIP)",
    zipBusy: "Building…",
    viewNotes: [
      "Idle & walking poses, animated GIFs, and a game-ready sprite sheet",
      "Each view can be saved individually from its corner icons",
      "See README.txt inside the ZIP for details",
    ],
    optOn: "On",
    optOff: "Off",
    dlPng: "Save as image",
    dlGif: "Save as animated GIF",
    dlPlay: "Take a walk (arrow keys)",
    // Non-breaking spaces keep the parenthetical whole, so a wrap lands before "("
    shareLink: "Copy share link (this exact look)",
    shareCopied: "Copied!",
    favTitle: "Favorite (saved as name + settings)",
    close: "Close",
    monTitle: "Click to see all views",
    playerHint: "Arrow keys / WASD to move · Esc or click to return",
    playerHintTouch: "Drag anywhere to move · Tap your monster to return",
    helpItems: [
      "Type a name and hit Generate — a monster unique to that name is born. The same name always gives you the same one.",
      "Styles (Mochi / Retro / Chaos) and Options change the look.",
      "Stats (Lv, HP, …) also come from the name. Mochi are weak, Chaos are strong.",
      "Hover a monster for icons: save image / animated GIF / take a walk / favorite.",
      "Press play and it walks around the page. Move with arrow keys or WASD, Esc or click to return.",
      "Click a monster to see front / back / side views and download a game-ready ZIP.",
      "Favorites stay in this browser only.",
    ],
    footerMade: "Built with",
    menuOpen: "Settings",
  },
  ja: {
    sub: "なまえを入れると、あなただけのモンスターがうまれる。おなじ名前からは、いつでもおなじ子がうまれます。",
    nameSection: "なまえ",
    namePlaceholder: "なまえを入れてね",
    generate: "うまれる",
    random: "おまかせ",
    backTitle: "ひとつ前のなまえに戻る",
    help: "あそびかた",
    styleSection: "スタイル",
    tweakSection: "こだわり設定",
    outline: "ふちどり",
    face: "かお",
    gapFill: "すきまなくし",
    legsLabel: "あし",
    animation: "アニメーション",
    background: "背景",
    transparent: "透明",
    bgPickTitle: "背景の色（選ぶと透明が解除されます）",
    herd: (n: number) => `なかまたち — おなじ名前からうまれた${n}ひき`,
    favorites: "お気に入り",
    favClear: "すべてクリア",
    favClearConfirm: "お気に入りをすべて削除しますか？",
    favEmpty: "モンスターにマウスをのせて ★ を押すと、ここにあつまります（このブラウザにのこります）",
    nameLabel: "なまえ:",
    customStyle: "とくべつ",
    viewsTitle: " のすがた",
    viewLabels: { front: "まえ", back: "うしろ", left: "ひだり", right: "みぎ" } as const,
    zipButton: "ぜんぶ入りでダウンロード（ZIP）",
    zipBusy: "つくっています…",
    viewNotes: [
      "立ち・歩きのポーズ画像、動くGIF、ゲーム用スプライトシートのセットです",
      "各すがたは右上のアイコンで個別に保存できます",
      "くわしい中身と使い方は、ZIPの中の README.txt をどうぞ",
    ],
    optOn: "あり",
    optOff: "なし",
    dlPng: "画像で保存",
    dlGif: "動くGIFで保存",
    dlPlay: "この子とあそぶ（矢印キーでおさんぽ）",
    shareLink: "共有リンクをコピー（いまのすがた）",
    shareCopied: "コピーしました！",
    favTitle: "お気に入り（なまえと設定のセットで保存）",
    close: "閉じる",
    monTitle: "クリックですがたを見る",
    playerHint: "矢印キー / WASD で移動 · Esc かクリックで帰る",
    playerHintTouch: "画面をドラッグで移動 · キャラをタップで帰る",
    helpItems: [
      "なまえを入れて「うまれる」を押すと、その名前だけのモンスターがうまれます。おなじ名前からは、いつでもおなじ子がうまれます",
      "スタイル（もちもち / レトロ / カオス）と こだわり設定 で、見た目をきせかえできます",
      "ステータス（Lv・HPなど）も名前から決まります。もちもちはよわよわ、カオスはつよつよ",
      "モンスターにマウスをのせると出るアイコン: 画像で保存 / 動くGIF / この子とあそぶ / お気に入り",
      "▶ を押すと画面の中へおさんぽに出かけます。矢印キー か WASD でうごかして、Esc かクリックで帰ります",
      "モンスターをクリックすると まえ・うしろ・よこ のすがたが見られて、ぜんぶ入りZIPをダウンロードできます",
      "お気に入りはこのブラウザにのこります（べつの端末には引きつがれません）",
    ],
    footerMade: "つくったもの:",
    menuOpen: "せってい",
  },
} as const;

export type Strings = (typeof STRINGS)["en"] | (typeof STRINGS)["ja"];

const LOCALE_KEY = "dotmon:locale";

// GitHub Pages等のサブパス配信に対応（例: "/dotmon-web/"）。常に末尾スラッシュ付き
const BASE = import.meta.env.BASE_URL;

/** basePathを除いたサイト内相対パス（先頭スラッシュ付き）を返す */
function stripBase(pathname: string): string {
  return pathname.startsWith(BASE) ? "/" + pathname.slice(BASE.length) : pathname;
}

function initialLocale(): Locale {
  // 優先順位: 明示選択 > URLパス > ブラウザ言語 > en
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "ja" || saved === "en") return saved;
  } catch { /* ignore */ }
  const rel = stripBase(location.pathname);
  if (rel === "/ja" || rel.startsWith("/ja/")) return "ja";
  return pickLocale(navigator.languages, ["en", "ja"] as const, "en");
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // URLパスと<html lang>を同期（BASE = en, BASE + ja/ = ja。?seed=は維持）
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      const url = new URL(location.href);
      const rel = stripBase(url.pathname);
      const rest = rel.replace(/^\/ja(\/|$)/, "/");
      const newRel = locale === "ja" ? "/ja" + (rest === "/" ? "/" : rest) : rest;
      url.pathname = BASE.replace(/\/$/, "") + newRel;
      window.history.replaceState(null, "", url);
    } catch { /* file://等では無視 */ }
  }, [locale]);

  const setLocale = (l: Locale) => {
    try { localStorage.setItem(LOCALE_KEY, l); } catch { /* ignore */ }
    setLocaleState(l);
  };
  return { locale, setLocale, t: STRINGS[locale], dict: DICTS[locale] };
}
