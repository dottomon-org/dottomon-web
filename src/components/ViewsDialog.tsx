import {
  generateSvg,
  type Locale,
  presetKeyFromOpts,
  type ResolvedOpts,
  type View,
} from "dottomon";
import type { LocaleDict } from "dottomon/locales";
import { MonsterAvatar } from "dottomon/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Strings } from "../i18n";
import { downloadGif, downloadPng, downloadZip } from "../lib/actions";
import { bgStyle } from "../lib/checker";
import { buildShareUrlFromOpts } from "../lib/shareUrl";
import {
  btn,
  btnPrimary,
  chipMd,
  dialogCls,
  dialogHead,
  vlist,
  vnote,
} from "../lib/ui";
import { DlIcon } from "./Icons";
import StatsPanel from "./StatsPanel";
import { toast } from "./Toast";

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

export default function ViewsDialog({
  target,
  bg,
  locale,
  t,
  dict,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = ref.current!;
    if (target && !d.open) d.showModal();
    if (!target && d.open) d.close();
    setCopied(false);
  }, [target]);

  useEffect(() => {
    const d = ref.current!;
    const h = () => onClose();
    d.addEventListener("close", h);
    return () => d.removeEventListener("close", h);
  }, [onClose]);

  const drawn = useMemo(
    () =>
      target
        ? generateSvg(target.seed, { ...target.opts, view: "front", frame: 0 })
            .drawnLegStyle
        : "none",
    [target],
  );

  // Show only the options the user can control for this style in the options panel
  // (mochi: outline/face/legs, retro: outline/face/gapFill, chaos: gapFill).
  // Combinations that match no preset (= custom) show every row
  const presetKey = target ? presetKeyFromOpts(target.opts) : "custom";
  const items = target
    ? [
        [t.styleSection, presetLabel(target.opts, t, dict)],
        ...(presetKey !== "chaos"
          ? [
              [t.outline, onOff(target.opts.outline, t)],
              [t.face, onOff(target.opts.face, t)],
            ]
          : []),
        ...(presetKey === "mochi" || presetKey === "custom"
          ? [[t.legsLabel, dict.legs[drawn]]]
          : []),
        ...(presetKey !== "mochi"
          ? [[t.gapFill, onOff(target.opts.gapFill, t)]]
          : []),
      ]
    : [];

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close only; <dialog> closes on Esc natively
    <dialog
      id="views"
      className={dialogCls}
      ref={ref}
      onClick={(e) => e.target === ref.current && ref.current!.close()}
    >
      {target && (
        <>
          <div className={dialogHead}>
            <span className="text-[14px] break-all text-dim">
              <span className="text-[19px] font-bold text-acid" id="vtitle">
                {target.seed}
              </span>
              {t.viewsTitle}
            </span>
            <button
              type="button"
              className={`${chipMd} text-[11px]`}
              title={t.close}
              aria-label={t.close}
              onClick={() => ref.current!.close()}
            >
              ✕
            </button>
          </div>
          <div className="mb-3.5 px-0.5">
            <StatsPanel seed={target.seed} opts={target.opts} dict={dict} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5">
            {VIEWS.map((v) => (
              <div
                className="relative rounded-lg border border-line px-2 pt-2 pb-1.5 text-center"
                key={v}
              >
                {/* Checker background only behind the image so the label below
                    stays readable on the dialog background. height:auto — the
                    default 100% resolves against the tile's own (auto) height,
                    which would push the label out of the tile box */}
                <div
                  className="rounded-md"
                  style={{ background: bgStyle(bg, 14) }}
                >
                  <MonsterAvatar
                    seed={target.seed}
                    options={target.opts}
                    view={v}
                    size="100%"
                    style={{
                      aspectRatio: "1",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
                <div className="mt-[5px] text-[13px] font-bold tracking-[0.08em] text-ink">
                  {t.viewLabels[v]}
                </div>
                <div className="absolute top-[3px] right-[3px] z-[2] flex gap-[3px]">
                  <button
                    type="button"
                    className={`${chipMd} text-[7.5px]`}
                    title={t.dlPng}
                    aria-label={`${t.viewLabels[v]}: ${t.dlPng}`}
                    onClick={() =>
                      downloadPng(target.seed, target.opts, v, 512, bg)
                    }
                  >
                    <DlIcon />
                  </button>
                  <button
                    type="button"
                    className={`${chipMd} text-[7.5px]`}
                    title={t.dlGif}
                    aria-label={`${t.viewLabels[v]}: ${t.dlGif}`}
                    onClick={() =>
                      downloadGif(target.seed, target.opts, v, 256, bg)
                    }
                  >
                    GIF
                  </button>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-3 grid list-none grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-3.5 gap-y-[3px] px-0.5 text-[11px] text-dim [&>li]:before:text-acid [&>li]:before:content-['▸_']">
            {items.map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
          <div className="mt-3.5 flex gap-2">
            <button
              type="button"
              className={`${btn} flex-1 disabled:cursor-default`}
              disabled={copied}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    buildShareUrlFromOpts(target.seed, target.opts),
                  );
                } catch {
                  return;
                }
                toast(t.shareToast);
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
            >
              {copied ? t.shareCopied : t.shareLink}
            </button>
            <button
              type="button"
              className={`${btnPrimary} flex-1 disabled:cursor-default`}
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
          <ul className={`${vnote} ${vlist}`}>
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
