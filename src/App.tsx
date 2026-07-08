import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { randomName, resolveOptions, type Preset, type ResolvedOpts } from "@dotmon/core";
import { useLocale } from "./i18n";
import { useFavorites } from "./hooks/useFavorites";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useNameHistory } from "./hooks/useNameHistory";
import { readSeedFromUrl } from "./hooks/useSeedUrl";
import { downloadGif, downloadPng } from "./lib/actions";
import { buildShareUrl, clearShareParams, readShareFromUrl, tweaksFor } from "./lib/shareUrl";
import Sidebar, { type Tweaks } from "./components/Sidebar";
import MainPreview from "./components/MainPreview";
import MonsterCell from "./components/MonsterCell";
import NameForm from "./components/NameForm";
import FavoritesSection from "./components/FavoritesSection";
import ViewsDialog, { type ViewsTarget } from "./components/ViewsDialog";
import HelpDialog from "./components/HelpDialog";
import WalkingPlayer from "./components/WalkingPlayer";
import ToastHost from "./components/Toast";

interface PlayerState {
  id: number;
  seed: string;
  opts: ResolvedOpts | null; // null = 現在の設定でライブ更新、非null = お気に入りのスナップショット
  x: number;
  y: number;
}

function optsFor(preset: Preset, tweaks: Tweaks): ResolvedOpts {
  if (preset === "mochi") return resolveOptions({ preset, ...tweaks });
  if (preset === "retro") return resolveOptions({ preset, outline: tweaks.outline, face: tweaks.face, gapFill: tweaks.gapFill });
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
  const coarsePointer = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  // Phones get a shorter herd (9 in 3 columns) to keep vertical scroll reasonable
  const phone = useMediaQuery("(max-width: 560px)");
  const favorites = useFavorites();
  const nameHistory = useNameHistory();
  // Captured once before the URL is cleaned — the mount effect runs twice
  // under StrictMode, and the second run must see the same value
  const [urlSeed] = useState(readSeedFromUrl);

  useEffect(() => {
    const name = urlSeed ?? randomName(locale);
    setInput(name);
    setSeed(name);
    nameHistory.push(name);
    // Share params are a one-shot initializer (preset/tweaks state read them
    // before mount) — strip them so the address bar stays clean
    clearShareParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = useCallback(
    (name: string) => {
      const n = name || randomName(locale);
      setSeed(n);
      nameHistory.push(n);
    },
    [nameHistory, locale],
  );

  const selectPreset = (p: Preset) => {
    setPreset(p);
    setTweaks(tweaksFor(p));
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

  const spawnPlayer = useCallback((seed_: string, opts_: ResolvedOpts | null, rect: DOMRect) => {
    playerId.current += 1;
    setPlayer({
      id: playerId.current,
      seed: seed_,
      opts: opts_,
      x: Math.min(Math.max(rect.left - 24, 8), window.innerWidth - 72),
      y: Math.min(Math.max(rect.top - 8, 8), window.innerHeight - 72),
    });
  }, []);

  const herdCount = phone ? 9 : 28;
  const herd = useMemo(() => (seed ? Array.from({ length: herdCount }, (_, i) => `${seed}-${i + 1}`) : []), [seed, herdCount]);

  return (
    <>
      <div className="wrap">
        <header>
          <div className="headtop">
            <div>
              <div className="eyebrow">pixel monster maker</div>
              <h1>
                dotmon<span className="blink">_</span>
              </h1>
            </div>
            <button className="localebtn" onClick={() => setLocale(locale === "en" ? "ja" : "en")}>
              {locale === "en" ? "日本語" : "English"}
            </button>
          </div>
          <p className="sub">{t.sub}</p>
        </header>

        <div className="lab">
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
            seed={seed || "dotmon"}
            preset={preset}
            onSelectPreset={selectPreset}
            tweaks={tweaks}
            onTweaks={setTweaks}
            animate={animate}
            onAnimate={setAnimate}
            bgTrans={bgTrans}
            onBgTrans={setBgTrans}
            bgColor={bgColor}
            onBgColor={setBgColor}
          />

          <main className="stage">
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
            <section className="panel" id="quickname">
              <h2>{t.nameSection}</h2>
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

            <section className="panel">
              <h2>{t.herd(herd.length)}</h2>
              <div className="grid">
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
              onMove={favorites.move}
              onOpen={(s, o) => setViewsTarget({ seed: s, opts: o })}
              onPng={(s, o) => downloadPng(s, o, "front", 256, bg)}
              onGif={(s, o) => downloadGif(s, o, "front", 256, bg)}
              onPlay={spawnPlayer}
            />

            <footer>
              {t.footerMade} <a href="https://github.com/dotmon-org/dotmon" target="_blank" rel="noreferrer">@dotmon/core</a> ·{" "}
              <a href="https://www.npmjs.com/package/@dotmon/core" target="_blank" rel="noreferrer">npm</a>
            </footer>
          </main>
        </div>
      </div>

      <button className="primary" id="menubtn" onClick={() => setDrawerOpen(true)}>
        ☰ {t.menuOpen}
      </button>
      <div id="scrim" className={drawerOpen ? "show" : ""} onClick={() => setDrawerOpen(false)} />

      <ViewsDialog target={viewsTarget} bg={bg} locale={locale} t={t} dict={dict} onClose={() => setViewsTarget(null)} />
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
