import { type Legs, type Preset, presets } from "@dotmon/core";
import type { LocaleDict } from "@dotmon/core/locales";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
import {
  checkboxCls,
  colorInputCls,
  focusRing,
  panelH2,
  selectCls,
  trow,
} from "../lib/ui";
import NameForm from "./NameForm";

export interface Tweaks {
  outline: boolean;
  face: boolean;
  legs: Legs;
  gapFill: boolean;
}

interface Props {
  open: boolean;
  onCloseDrawer: () => void;
  t: Strings;
  dict: LocaleDict;
  input: string;
  onInput: (v: string) => void;
  onGenerate: () => void;
  onRandom: () => void;
  canBack: boolean;
  onBack: () => void;
  onHelp: () => void;
  seed: string;
  preset: Preset;
  onSelectPreset: (p: Preset) => void;
  tweaks: Tweaks;
  onTweaks: (t: Tweaks) => void;
  animate: boolean;
  onAnimate: (v: boolean) => void;
  bgTrans: boolean;
  onBgTrans: (v: boolean) => void;
  bgColor: string;
  onBgColor: (v: string) => void;
}

const PRESET_KEYS: Preset[] = ["mochi", "retro", "chaos"];
const LEG_OPTIONS: Legs[] = ["auto", "none", "two", "many"];

// Sticky panel on desktop; a left slide-in drawer below md (the せってい button
// in App opens it, the scrim/✕ close it)
const ASIDE =
  "overflow-y-auto rounded-xl border border-line bg-panel p-4.5 [&_section+section]:mt-5.5 " +
  "md:sticky md:top-5 md:max-h-[calc(100vh-40px)] " +
  "max-md:fixed max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:z-[60] max-md:w-[min(320px,86vw)] " +
  "max-md:rounded-l-none max-md:transition-transform max-md:duration-[220ms] motion-reduce:transition-none";

export default function Sidebar(p: Props) {
  return (
    <aside
      className={`${ASIDE} ${p.open ? "max-md:translate-x-0" : "max-md:-translate-x-[105%]"}`}
      id="sidebar"
    >
      <button
        type="button"
        className={`hidden size-[26px] cursor-pointer place-items-center rounded-md bg-[rgba(16,16,31,0.72)] font-mono text-[12px] font-bold text-white opacity-60 hover:bg-[rgba(16,16,31,0.9)] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-acid max-md:absolute max-md:top-2.5 max-md:right-2.5 max-md:grid`}
        title={p.t.close}
        aria-label={p.t.close}
        onClick={p.onCloseDrawer}
      >
        ✕
      </button>

      <section>
        <h2 className={panelH2}>{p.t.nameSection}</h2>
        <NameForm
          t={p.t}
          input={p.input}
          onInput={p.onInput}
          onGenerate={p.onGenerate}
          onRandom={p.onRandom}
          canBack={p.canBack}
          onBack={p.onBack}
          onHelp={p.onHelp}
        />
      </section>

      <section>
        <h2 className={panelH2}>{p.t.styleSection}</h2>
        <div className="grid gap-2">
          {PRESET_KEYS.map((k) => {
            const sel = p.preset === k;
            return (
              <button
                key={k}
                className={`grid w-full cursor-pointer grid-cols-[54px_1fr] items-center gap-2.5 rounded-[10px] border-2 bg-panel2 px-2.5 py-2.25 text-left font-mono ${
                  sel
                    ? "border-acid shadow-[0_0_0_3px_rgba(184,245,66,0.12)]"
                    : "border-line hover:border-dim"
                } ${focusRing}`}
                type="button"
                onClick={() => p.onSelectPreset(k)}
              >
                <div className="grid size-[54px] place-items-center rounded-md [background:repeating-conic-gradient(#ffffff_0%_25%,#f0f0e8_0%_50%)_0_0/9px_9px]">
                  <MonsterAvatar
                    seed={p.seed}
                    options={presets[k]}
                    size={48}
                    title={dictName(p.dict, k)}
                  />
                </div>
                <span>
                  <span
                    className={`text-[13px] font-bold ${sel ? "text-acid" : "text-ink"}`}
                  >
                    {p.dict.presets[k]}
                  </span>
                  <br />
                  <span className="text-[10px] leading-normal text-dim">
                    {p.dict.presetDescriptions[k]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className={panelH2}>{p.t.tweakSection}</h2>
        <div className="grid">
          {p.preset !== "chaos" && (
            <label className={trow}>
              <input
                type="checkbox"
                className={checkboxCls}
                checked={p.tweaks.outline}
                onChange={(e) =>
                  p.onTweaks({ ...p.tweaks, outline: e.target.checked })
                }
              />
              {p.t.outline}
            </label>
          )}
          {p.preset !== "chaos" && (
            <label className={trow}>
              <input
                type="checkbox"
                className={checkboxCls}
                checked={p.tweaks.face}
                onChange={(e) =>
                  p.onTweaks({ ...p.tweaks, face: e.target.checked })
                }
              />
              {p.t.face}
            </label>
          )}
          {p.preset !== "mochi" && (
            <label className={trow}>
              <input
                type="checkbox"
                className={checkboxCls}
                checked={p.tweaks.gapFill}
                onChange={(e) =>
                  p.onTweaks({ ...p.tweaks, gapFill: e.target.checked })
                }
              />
              {p.t.gapFill}
            </label>
          )}
          {p.preset === "mochi" && (
            <div className={trow}>
              <label htmlFor="o-legs">{p.t.legsLabel}</label>
              <select
                id="o-legs"
                className={selectCls}
                value={p.tweaks.legs}
                onChange={(e) =>
                  p.onTweaks({ ...p.tweaks, legs: e.target.value as Legs })
                }
              >
                {LEG_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {p.dict.legs[l]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Shared across every style, unlike the per-style options above */}
      <section>
        <h2 className={panelH2}>{p.t.displaySection}</h2>
        <div className="grid">
          <label className={trow}>
            <input
              type="checkbox"
              className={checkboxCls}
              checked={p.animate}
              onChange={(e) => p.onAnimate(e.target.checked)}
            />
            {p.t.animation}
          </label>
          <div className={trow}>
            <span>{p.t.background}</span>
            <label className="flex items-center gap-[5px]">
              <input
                type="checkbox"
                className={checkboxCls}
                checked={p.bgTrans}
                onChange={(e) => p.onBgTrans(e.target.checked)}
              />
              {p.t.transparent}
            </label>
            <input
              type="color"
              className={colorInputCls}
              value={p.bgColor}
              title={p.t.bgPickTitle}
              onChange={(e) => {
                p.onBgColor(e.target.value);
                p.onBgTrans(false);
              }}
            />
          </div>
        </div>
      </section>
    </aside>
  );
}

function dictName(dict: LocaleDict, k: Preset) {
  return dict.presets[k];
}
