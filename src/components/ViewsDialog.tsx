import { useEffect, useMemo, useRef, useState } from "react";
import { generateSvg, presetKeyFromOpts, type Locale, type ResolvedOpts, type View } from "@dotmon/core";
import type { LocaleDict } from "@dotmon/core/locales";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
import { downloadGif, downloadPng, downloadZip } from "../lib/actions";
import { bgStyle } from "../lib/checker";
import { DlIcon } from "./Icons";
import StatsPanel from "./StatsPanel";

export interface ViewsTarget {
  seed: string;
  opts: ResolvedOpts;
}

const VIEWS: View[] = ["front", "back", "left", "right"];

interface Props {
  target: ViewsTarget | null;
  bg: string;
  locale: Locale;
  t: Strings;
  dict: LocaleDict;
  onClose: () => void;
}

export default function ViewsDialog({ target, bg, locale, t, dict, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = ref.current!;
    if (target && !d.open) d.showModal();
    if (!target && d.open) d.close();
  }, [target]);

  useEffect(() => {
    const d = ref.current!;
    const h = () => onClose();
    d.addEventListener("close", h);
    return () => d.removeEventListener("close", h);
  }, [onClose]);

  const drawn = useMemo(
    () => (target ? generateSvg(target.seed, { ...target.opts, view: "front", frame: 0 }).drawnLegStyle : "none"),
    [target],
  );

  // Show only the options the user can control for this style in the options panel
  // (mochi: outline/face/legs, retro: outline/face/gapFill, chaos: gapFill).
  // Combinations that match no preset (= custom) show every row
  const presetKey = target ? presetKeyFromOpts(target.opts) : "custom";
  const items = target
    ? [
        [t.styleSection, presetLabel(target.opts, t, dict)],
        ...(presetKey !== "chaos" ? [[t.outline, onOff(target.opts.outline, t)], [t.face, onOff(target.opts.face, t)]] : []),
        ...(presetKey === "mochi" || presetKey === "custom" ? [[t.legsLabel, dict.legs[drawn]]] : []),
        ...(presetKey !== "mochi" ? [[t.gapFill, onOff(target.opts.gapFill, t)]] : []),
      ]
    : [];

  return (
    <dialog id="views" ref={ref} onClick={(e) => e.target === ref.current && ref.current!.close()}>
      {target && (
        <>
          <div className="vhead">
            <span className="t">
              <span id="vtitle">{target.seed}</span>{t.viewsTitle}
            </span>
            <button className="dl" title={t.close} aria-label={t.close} onClick={() => ref.current!.close()}>✕</button>
          </div>
          <ul className="vopts">
            {items.map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
          <div className="vgrid">
            {VIEWS.map((v) => (
              <div className="vtile" key={v}>
                {/* Checker background only behind the image so the label below
                    stays readable on the dialog background. height:auto — the
                    default 100% resolves against the tile's own (auto) height,
                    which would push the label out of the tile box */}
                <div className="vimg" style={{ background: bgStyle(bg, 14) }}>
                  <MonsterAvatar seed={target.seed} options={target.opts} view={v} size="100%" style={{ aspectRatio: "1", height: "auto", display: "block" }} />
                </div>
                <div className="s">{t.viewLabels[v]}</div>
                <div className="dlbar">
                  <button className="dl" title={t.dlPng} aria-label={`${t.viewLabels[v]}: ${t.dlPng}`} onClick={() => downloadPng(target.seed, target.opts, v, 512, bg)}>
                    <DlIcon />
                  </button>
                  <button className="dl" title={t.dlGif} aria-label={`${t.viewLabels[v]}: ${t.dlGif}`} onClick={() => downloadGif(target.seed, target.opts, v, 256, bg)}>
                    GIF
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="vstats">
            <StatsPanel seed={target.seed} opts={target.opts} dict={dict} />
          </div>
          <div className="btnrow" style={{ marginTop: 14 }}>
            <button
              className="primary"
              style={{ flex: 1 }}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await downloadZip(target.seed, target.opts, bg, locale);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? t.zipBusy : t.zipButton}
            </button>
          </div>
          <ul className="vnote vlist">
            {t.viewNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </>
      )}
    </dialog>
  );
}

function onOff(v: boolean, t: Strings) {
  return v ? t.optOn : t.optOff;
}

function presetLabel(opts: ResolvedOpts, t: Strings, dict: LocaleDict) {
  const key = presetKeyFromOpts(opts);
  return key === "custom" ? t.customStyle : dict.presets[key];
}
