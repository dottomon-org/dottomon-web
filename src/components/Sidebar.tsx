import { presets, type Legs, type Preset } from "@dotmon/core";
import type { LocaleDict } from "@dotmon/core/locales";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
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

export default function Sidebar(p: Props) {
  return (
    <aside className={"panel" + (p.open ? " open" : "")} id="sidebar">
      <button className="dl" id="menuclose" title={p.t.close} aria-label={p.t.close} onClick={p.onCloseDrawer}>
        ✕
      </button>

      <section>
        <h2>{p.t.nameSection}</h2>
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
        <h2>{p.t.styleSection}</h2>
        <div className="styles">
          {PRESET_KEYS.map((k) => (
            <button key={k} className={"stylecard" + (p.preset === k ? " sel" : "")} type="button" onClick={() => p.onSelectPreset(k)}>
              <div className="thumb">
                <MonsterAvatar seed={p.seed} options={presets[k]} size={48} title={dictName(p.dict, k)} />
              </div>
              <span>
                <span className="sname">{p.dict.presets[k]}</span>
                <br />
                <span className="sdesc">{p.dict.presetDescriptions[k]}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>{p.t.tweakSection}</h2>
        <div className="tweaks">
          {p.preset !== "chaos" && (
            <label className="trow">
              <input type="checkbox" checked={p.tweaks.outline} onChange={(e) => p.onTweaks({ ...p.tweaks, outline: e.target.checked })} />
              {p.t.outline}
            </label>
          )}
          {p.preset !== "chaos" && (
            <label className="trow">
              <input type="checkbox" checked={p.tweaks.face} onChange={(e) => p.onTweaks({ ...p.tweaks, face: e.target.checked })} />
              {p.t.face}
            </label>
          )}
          {p.preset !== "mochi" && (
            <label className="trow">
              <input type="checkbox" checked={p.tweaks.gapFill} onChange={(e) => p.onTweaks({ ...p.tweaks, gapFill: e.target.checked })} />
              {p.t.gapFill}
            </label>
          )}
          {p.preset === "mochi" && (
            <div className="trow">
              <label htmlFor="o-legs">{p.t.legsLabel}</label>
              <select id="o-legs" value={p.tweaks.legs} onChange={(e) => p.onTweaks({ ...p.tweaks, legs: e.target.value as Legs })}>
                {LEG_OPTIONS.map((l) => (
                  <option key={l} value={l}>{p.dict.legs[l]}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Shared across every style, unlike the per-style options above */}
      <section>
        <h2>{p.t.displaySection}</h2>
        <div className="tweaks">
          <label className="trow">
            <input type="checkbox" checked={p.animate} onChange={(e) => p.onAnimate(e.target.checked)} />
            {p.t.animation}
          </label>
          <div className="trow">
            <span>{p.t.background}</span>
            <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <input type="checkbox" checked={p.bgTrans} onChange={(e) => p.onBgTrans(e.target.checked)} />
              {p.t.transparent}
            </label>
            <input
              type="color"
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
