# ADR 0001: Dot editor as a paid feature — data model, pricing, and platform

- Status: Accepted
- Date: 2026-07-08
- Deciders: maintainer (Yuki Sakaguchi)

## Context

dotmon generates deterministic pixel monsters from a name ("same name, same
monster"). We want to add an editor where users refine a generated monster:
paint/erase dots on all four views, adjust the walk animation, export the
result, and keep it in their favorites. This is planned as the first paid
feature of the service.

Key tensions that shaped the decisions:

- Determinism is the core free product; edits inherently break "derivable from
  the name".
- Pixel editing itself is commodity (many free editors exist). The sellable
  value is the generated starting point plus the existing pipeline: consistent
  4 views, walk animation, game-ready exports (PNG/GIF/ZIP/sprite sheet).
- The current app is a static site with localStorage only; payments and
  cross-device data require accounts and a backend.

## Decisions

### 1. Edited monsters are dot documents, detached from generation

Once editing starts, the monster is detached from seed-based generation. It is
stored and rendered as raw dot data — a separate path from `generateSvg`:

- Document shape (conceptual):
  `{ name, base: { seed, opts }, palette, grids: { front, back, left, right } }`
- `base` is kept as provenance metadata only ("edited from this default art");
  the program never re-derives the edited result from it.
- Grids keep the existing semantic palette values (body / dark / white / black /
  accent / outline). The 6-color constraint preserves the dotmon look and keeps
  documents small (~KBs). Free-RGB palettes can be a later extension.
- Stats and the display name still come from `name` (stats are name-derived and
  unaffected by pixel edits).
- @dotmon/core impact: expose a grid-level rendering API (grid → SVG) so the
  existing GIF/ZIP/sprite-sheet pipeline works on edited documents. The
  internals already work on grids; this is a public-API addition, not a rewrite.

### 2. All four views are edited independently

Each view is its own canvas; editing the front never rewrites the others
(e.g. reshaping only the right view is a supported workflow). View derivation
runs once to produce the initial grids, then the document is the source of
truth.

Animation frames are phased:

- Default: users edit 4 grids (frame 0 per view); walk frames reuse the
  existing automatic frame transforms.
- Opt-in "edit frames individually": expands to 4 views × 3 frames = 12 grids
  (initialized by copying), with onion-skin support in the editor.

### 3. Pricing: free accounts, coin-gated editing

- Accounts are free. Favorites move from localStorage to the account (with a
  migration path at signup). Everything the app can do today stays free,
  including all current outputs.
- Editing is the paid surface, metered by consumable coins:
  - 1 coin = 1 edited-monster save slot. Trying the editor is free; a coin is
    consumed when saving (which also unlocks exports of that monster).
    Re-editing and re-exporting a saved monster consumes nothing.
  - New accounts get 1 free coin, so the full flow can be experienced once for
    free.
- Coins are one-time consumable purchases (no subscription management).

### 4. Platform: Cloudflare + Stripe + third-party auth

- Hosting/backend on Cloudflare: Pages (frontend, migrating off GitHub Pages),
  Workers (API), D1 (accounts, favorites, edited documents, coin balances).
- Payments via Stripe Checkout; Stripe webhooks (handled in Workers) are the
  single source of truth for granting coins — the client never asserts balance
  changes.
- Authentication is never self-built. Use an established auth service/library
  with social login (Google / GitHub / X); no password storage on our side.

## Consequences

- A second entity type exists alongside (seed, opts) favorites: edited dot
  documents. Favorites storage and UI must handle both.
- Edited monsters are no longer shareable via `?seed=`; account-stored
  documents enable share-by-ID links as a future (possibly paid) feature.
- The OSS boundary stays clean: @dotmon/core gains only a generic grid
  rendering API; editor, accounts, coins, and payment logic live in the
  service.
- Rollout order (each phase ships standalone value):
  1. core: public grid-in/grid-out API
  2. editor UI, local-only persistence (validates the UX for free)
  3. Cloudflare accounts + favorites sync
  4. Stripe + coins

<details><summary>日本語</summary>

## 概要

生成モンスターを下絵に4面のドットを自由に編集し、出力・お気に入り保存できる
エディタを、サービス初の有料機能として作るための意思決定。

1. **編集データは生成から切り離す**: 編集開始時点で seed 生成とは別れ、
   4面のドットデータ（+出自としての seed/opts）を持つ別ドキュメントとして
   保存・描画する。パレットは既存の6色制約を維持。core には
   「グリッド→SVG」の公開APIを追加するだけで既存の出力パイプラインを再利用できる。
2. **4面は独立編集**（右面だけ形を変える、が可能）。アニメフレームは
   既定で自動変形を再利用し、こだわる人だけ 4面×3フレームの個別編集に展開する段階式。
3. **料金**: アカウント作成・同期は無料（お気に入りは localStorage から
   アカウントへ移行）。既存機能の出力はすべて無料のまま。編集と編集後の
   出力は有料で、コイン制（1コイン=編集済み1体の保存枠、登録時に1コイン付与、
   保存済みの再編集・再出力は消費なし）。
4. **基盤**: Cloudflare（Pages / Workers / D1）+ Stripe Checkout
   （Webhookをコイン付与の唯一の源泉に）。認証は自作せず、
   Google / GitHub / X のソーシャルログインを既存サービス/ライブラリで実装。

</details>
