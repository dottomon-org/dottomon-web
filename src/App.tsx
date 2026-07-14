import {
  type Preset,
  type ResolvedOpts,
  randomName,
  resolveOptions,
} from "dottomon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FavoritesSection from "./components/FavoritesSection";
import HelpDialog from "./components/HelpDialog";
import MainPreview from "./components/MainPreview";
import MonsterCell from "./components/MonsterCell";
import NameForm from "./components/NameForm";
import Sidebar, { type Tweaks } from "./components/Sidebar";
import ToastHost from "./components/Toast";
import ViewsDialog, { type ViewsTarget } from "./components/ViewsDialog";
import WalkingPlayer from "./components/WalkingPlayer";
import { useFavorites } from "./hooks/useFavorites";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useNameHistory } from "./hooks/useNameHistory";
import { readSeedFromUrl } from "./hooks/useSeedUrl";
import { useLocale } from "./i18n";
import { downloadGif, downloadPng } from "./lib/actions";
import {
  buildShareUrl,
  clearShareParams,
  readShareFromUrl,
  tweaksFor,
} from "./lib/shareUrl";
import { btnPrimary, panel, panelH2 } from "./lib/ui";

interface PlayerState {
  id: number;
  seed: string;
  opts: ResolvedOpts | null; // null = 現在の設定でライブ更新、非null = お気に入りのスナップショット
  x: number;
  y: number;
}

function optsFor(preset: Preset, tweaks: Tweaks): ResolvedOpts {
  if (preset === "mochi") return resolveOptions({ preset, ...tweaks });
  if (preset === "retro")
    return resolveOptions({
      preset,
      outline: tweaks.outline,
      face: tweaks.face,
      gapFill: tweaks.gapFill,
    });
  return resolveOptions({ preset: "chaos", gapFill: tweaks.gapFill }); // chaos: only gapFill is adjustable
}

export default function App() {
  const { locale, setLocale, t, dict } = useLocale();
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState("");
  // Style/options come from the URL too, so a share link reproduces the look
  const [preset, setPreset] = useState<Preset>(() => readShareFromUrl().preset);
  const [tweaks, setTweaks] = useState<Tweaks>(() => readShareFromUrl().tweaks);
  const [animate, setAnimate] = useState(true);
  const [bgTrans, setBgTrans] = useState(true);
  const [bgColor, setBgColor] = useState("#a5bdd2");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewsTarget, setViewsTarget] = useState<ViewsTarget | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const playerId = useRef(0);

  const opts = useMemo(() => optsFor(preset, tweaks), [preset, tweaks]);
  const bg = bgTrans ? "transparent" : bgColor;
  const coarsePointer = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    [],
  );
  // Phones get a shorter herd (9 in 3 columns) to keep vertical scroll
  // reasonable. 639px = below Tailwind's `sm` breakpoint, where the grid
  // switches to 3 fixed columns
  const phone = useMediaQuery("(max-width: 639px)");
  const favorites = useFavorites();
  const nameHistory = useNameHistory();
  // Captured once before the URL is cleaned — the mount effect runs twice
  // under StrictMode, and the second run must see the same value
  const [urlSeed] = useState(readSeedFromUrl);

  // biome-ignore lint/correctness/useExhaustiveDependencies: one-shot mount initializer — must not re-run on later locale/history changes
  useEffect(() => {
    const name = urlSeed ?? randomName(locale);
    setInput(name);
    setSeed(name);
    nameHistory.push(name);
    // Share params are a one-shot initializer (preset/tweaks state read them
    // before mount) — strip them so the address bar stays clean
    clearShareParams();
  }, []);

  const commit = useCallback(
    (name: string) => {
      const n = name || randomName(locale);
      setSeed(n);
      nameHistory.push(n);
    },
    [nameHistory, locale],
  );

  // While walking, a focused sidebar control (checkbox/select) swallows the
  // arrow keys — the player looks frozen. Drop focus back to the page so the
  // walk keeps going; the monster's look updates live from the new settings.
  const keepWalkable = () => {
    if (player) (document.activeElement as HTMLElement | null)?.blur();
  };

  const selectPreset = (p: Preset) => {
    setPreset(p);
    setTweaks(tweaksFor(p));
    keepWalkable();
  };

  const changeTweaks = (tw: Tweaks) => {
    setTweaks(tw);
    keepWalkable();
  };

  const handleRandom = () => {
    const n = randomName(locale);
    setInput(n);
    commit(n);
  };
  const handleBack = () => {
    const prev = nameHistory.back();
    if (prev !== null) {
      setInput(prev);
      setSeed(prev);
    }
  };

  const spawnPlayer = useCallback(
    (seed_: string, opts_: ResolvedOpts | null, rect: DOMRect) => {
      playerId.current += 1;
      setPlayer({
        id: playerId.current,
        seed: seed_,
        opts: opts_,
        x: Math.min(Math.max(rect.left - 24, 8), window.innerWidth - 72),
        y: Math.min(Math.max(rect.top - 8, 8), window.innerHeight - 72),
      });
    },
    [],
  );

  const herdCount = phone ? 9 : 28;
  const herd = useMemo(
    () =>
      seed
        ? Array.from({ length: herdCount }, (_, i) => `${seed}-${i + 1}`)
        : [],
    [seed, herdCount],
  );

  return (
    <>
      <div className="mx-auto max-w-[1020px]">
        <header className="mb-5.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 text-[11px] tracking-[0.35em] text-acid uppercase">
                pixel monster maker
              </div>
              <h1 className="text-[clamp(22px,3.6vw,32px)] font-bold tracking-[0.04em]">
                dottomon
                <span className="animate-blink text-acid motion-reduce:animate-none">
                  _
                </span>
              </h1>
            </div>
            <button
              type="button"
              className={`flex-none cursor-pointer rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-[11px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(184,245,66,0.55)]`}
              onClick={() => setLocale(locale === "en" ? "ja" : "en")}
            >
              {locale === "en" ? "日本語" : "English"}
            </button>
          </div>
          <p className="mt-1.5 text-[12.5px] text-dim">{t.sub}</p>
        </header>

        <div className="grid grid-cols-[300px_1fr] items-start gap-4.5 max-md:grid-cols-1 max-md:gap-3">
          <Sidebar
            open={drawerOpen}
            onCloseDrawer={() => setDrawerOpen(false)}
            t={t}
            dict={dict}
            input={input}
            onInput={setInput}
            onGenerate={() => commit(input)}
            onRandom={handleRandom}
            canBack={nameHistory.canBack}
            onBack={handleBack}
            onHelp={() => setHelpOpen(true)}
            seed={seed || "dottomon"}
            preset={preset}
            onSelectPreset={selectPreset}
            tweaks={tweaks}
            onTweaks={changeTweaks}
            animate={animate}
            onAnimate={(v) => {
              setAnimate(v);
              keepWalkable();
            }}
            bgTrans={bgTrans}
            onBgTrans={(v) => {
              setBgTrans(v);
              keepWalkable();
            }}
            bgColor={bgColor}
            onBgColor={setBgColor}
          />

          <main className="grid min-w-0 gap-4.5 max-md:gap-3">
            {seed && (
              <MainPreview
                seed={seed}
                opts={opts}
                bg={bg}
                animate={animate}
                t={t}
                dict={dict}
                favOn={favorites.isFav(seed, opts)}
                onToggleFav={() => favorites.toggle(seed, opts)}
                onOpen={() => setViewsTarget({ seed, opts })}
                onPng={() => downloadPng(seed, opts, "front", 512, bg)}
                onGif={() => downloadGif(seed, opts, "front", 256, bg)}
                onPlay={(rect) => spawnPlayer(seed, null, rect)}
                onShare={() => buildShareUrl(seed, preset, tweaks)}
              />
            )}

            {/* Mobile-only quick access to the name controls (also kept in the settings drawer) */}
            <section className={`${panel} hidden max-md:block`} id="quickname">
              <h2 className={panelH2}>{t.nameSection}</h2>
              <NameForm
                t={t}
                input={input}
                onInput={setInput}
                onGenerate={() => commit(input)}
                onRandom={handleRandom}
                canBack={nameHistory.canBack}
                onBack={handleBack}
                onHelp={() => setHelpOpen(true)}
              />
            </section>

            <section className={panel}>
              <h2 className={panelH2}>{t.herd(herd.length)}</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5 max-sm:grid-cols-3">
                {herd.map((s) => (
                  <MonsterCell
                    key={s}
                    seed={s}
                    opts={opts}
                    bg={bg}
                    animate={animate}
                    t={t}
                    favOn={favorites.isFav(s, opts)}
                    onToggleFav={() => favorites.toggle(s, opts)}
                    onOpen={() => setViewsTarget({ seed: s, opts })}
                    onPng={() => downloadPng(s, opts, "front", 256, bg)}
                    onGif={() => downloadGif(s, opts, "front", 256, bg)}
                    onPlay={(rect) => spawnPlayer(s, null, rect)}
                    onShare={() => buildShareUrl(s, preset, tweaks)}
                  />
                ))}
              </div>
            </section>

            <FavoritesSection
              favs={favorites.favs}
              currentOpts={opts}
              bg={bg}
              animate={animate}
              locale={locale}
              t={t}
              onToggle={favorites.toggle}
              onClear={favorites.clear}
              onSwap={favorites.swap}
              onOpen={(s, o) => setViewsTarget({ seed: s, opts: o })}
              onPng={(s, o) => downloadPng(s, o, "front", 256, bg)}
              onGif={(s, o) => downloadGif(s, o, "front", 256, bg)}
              onPlay={spawnPlayer}
            />

            <footer className="text-center text-[11px] text-dim">
              {t.footerMade}{" "}
              <a
                className="underline hover:text-acid"
                href="https://github.com/dottomon-org/dottomon"
                target="_blank"
                rel="noreferrer"
              >
                dottomon
              </a>{" "}
              ·{" "}
              <a
                className="underline hover:text-acid"
                href="https://www.npmjs.com/package/dottomon"
                target="_blank"
                rel="noreferrer"
              >
                npm
              </a>
            </footer>
          </main>
        </div>
      </div>

      <button
        type="button"
        className={`${btnPrimary} fixed bottom-3.5 left-3.5 z-[55] hidden shadow-[0_3px_10px_rgba(0,0,0,0.4)] max-md:block`}
        id="menubtn"
        onClick={() => setDrawerOpen(true)}
      >
        ☰ {t.menuOpen}
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Esc already closes the drawer */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only backdrop; keyboard users close via Esc or the drawer button */}
      <div
        id="scrim"
        className={`fixed inset-0 z-[59] bg-[rgba(6,6,14,0.6)] ${drawerOpen ? "block" : "hidden"}`}
        onClick={() => setDrawerOpen(false)}
      />

      <ViewsDialog
        target={viewsTarget}
        bg={bg}
        locale={locale}
        t={t}
        dict={dict}
        onClose={() => setViewsTarget(null)}
      />
      <HelpDialog open={helpOpen} t={t} onClose={() => setHelpOpen(false)} />
      <ToastHost />

      {player && (
        <WalkingPlayer
          key={player.id}
          seed={player.seed}
          opts={player.opts ?? opts}
          x0={player.x}
          y0={player.y}
          hint={coarsePointer ? t.playerHintTouch : t.playerHint}
          onDismiss={() => setPlayer(null)}
        />
      )}
    </>
  );
}
