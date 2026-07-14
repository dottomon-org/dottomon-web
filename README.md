# dottomon-web

<img width="2110" height="1790" alt="スクリーンショット 2026-07-09 23 51 27" src="https://github.com/user-attachments/assets/755fab60-4b62-418d-815b-9ee098eb4844" />

The official web app for [dottomon](https://github.com/dottomon-org/dottomon) — type a name, get your own pixel monster.

Built with React + Vite on top of the published packages:

- [`dottomon`](https://www.npmjs.com/package/dottomon) — generation, stats, PNG/GIF/sprite-sheet/ZIP encoders, locale dictionaries
- [`dottomon/react`](https://www.npmjs.com/package/dottomon) — `<MonsterAvatar />` (all avatars share one animation ticker)

## Features

- Name → deterministic monster (`?seed=` deep links, always synced via replaceState)
- 3 style presets (Mochi / Retro / Chaos) + fine-grained options
- Stats panel (Lv / HP / … / nature) via `getStats` + locale dictionaries
- 28 siblings grid, favorites (localStorage, compatible with the original HTML version)
- 4-view dialog with per-view PNG/GIF and full asset ZIP (README locale follows UI locale)
- Walk-around player (arrow keys / WASD)
- **i18n (en / ja)**: explicit toggle > browser language > en, path-based (`/` = en, `/ja/` = ja)

## Development

```bash
npm install
npm run dev       # localhost:5173
npm run build     # tsc + vite build → dist/
```

## App-side responsibilities (vs library)

This repo owns: UI copy & layout, style cards, favorites & name history (localStorage keys
`monsterlab:favorites` / `monstermaker:history`, kept compatible with the pre-library HTML version),
`?seed=` handling, locale routing, and the walking player. Everything about *generating* monsters
lives in `dottomon`.
