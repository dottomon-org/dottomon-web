import {
  type Legs,
  type Preset,
  presetKeyFromOpts,
  type ResolvedOpts,
} from "dottomon";
import type { Tweaks } from "../components/Sidebar";

/** Default tweaks per style (= what the style buttons reset to) */
export function tweaksFor(preset: Preset): Tweaks {
  // gapFill defaults to each style's standard look (retro = ON / chaos = OFF)
  return {
    outline: true,
    face: preset !== "retro",
    legs: "auto",
    gapFill: preset === "retro",
  };
}

const PRESETS: Preset[] = ["mochi", "retro", "chaos"];
const LEGS: Legs[] = ["auto", "none", "two", "many"];

// Which options the user can control per style — mirrors the sidebar UI
const CONTROLLABLE: Record<Preset, (keyof Tweaks)[]> = {
  mochi: ["outline", "face", "legs"],
  retro: ["outline", "face", "gapFill"],
  chaos: ["gapFill"],
};

const PARAM_OF: Record<keyof Tweaks, string> = {
  outline: "outline",
  face: "face",
  legs: "legs",
  gapFill: "gapfill",
};

const SHARE_KEYS = ["seed", "style", ...Object.values(PARAM_OF)];

/**
 * Share links are the ONLY place style/options (and seed) appear in a URL:
 * the address bar is otherwise kept clean, so casually copying it shares the
 * site itself (fresh random monster), not whatever state the copier was in.
 * Every controllable key is written explicitly, so a link keeps meaning the
 * same look even if the site's defaults change later.
 */
export function buildShareUrl(
  seed: string,
  preset: Preset,
  tweaks: Tweaks,
): string {
  const url = new URL(location.href);
  url.search = "";
  url.searchParams.set("seed", seed);
  url.searchParams.set("style", preset);
  for (const key of CONTROLLABLE[preset]) {
    url.searchParams.set(
      PARAM_OF[key],
      key === "legs" ? tweaks.legs : tweaks[key] ? "1" : "0",
    );
  }
  return url.toString();
}

/**
 * Share URL for a monster held as resolved options (views dialog, favorites).
 * Combinations that match no preset can't be expressed as share params, so
 * they fall back to a seed-only link.
 */
export function buildShareUrlFromOpts(
  seed: string,
  opts: ResolvedOpts,
): string {
  const key = presetKeyFromOpts(opts);
  if (key === "custom") {
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("seed", seed);
    return url.toString();
  }
  return buildShareUrl(seed, key, {
    outline: opts.outline,
    face: opts.face,
    legs: opts.legs,
    gapFill: opts.gapFill,
  });
}

/**
 * Parse style/options from the URL (share links are a one-shot initializer —
 * see clearShareParams). Missing or invalid values fall back to the style's
 * current defaults, which is also how links from before an option existed
 * degrade.
 */
export function readShareFromUrl(): { preset: Preset; tweaks: Tweaks } {
  try {
    const q = new URLSearchParams(location.search);
    const s = q.get("style");
    const preset: Preset = (PRESETS as string[]).includes(s ?? "")
      ? (s as Preset)
      : "mochi";
    const tweaks = tweaksFor(preset);
    for (const key of CONTROLLABLE[preset]) {
      const v = q.get(PARAM_OF[key]);
      if (v === null) continue;
      if (key === "legs") {
        if ((LEGS as string[]).includes(v)) tweaks.legs = v as Legs;
      } else if (v === "1" || v === "0") {
        tweaks[key] = v === "1";
      }
    }
    return { preset, tweaks };
  } catch {
    return { preset: "mochi", tweaks: tweaksFor("mochi") };
  }
}

/**
 * Strip share params after they have been applied, so the address bar goes
 * back to a clean URL and never claims a state the user has since changed
 */
export function clearShareParams(): void {
  try {
    const url = new URL(location.href);
    let changed = false;
    for (const k of SHARE_KEYS) {
      if (url.searchParams.has(k)) {
        url.searchParams.delete(k);
        changed = true;
      }
    }
    if (changed) window.history.replaceState(null, "", url);
  } catch {
    /* ignore */
  }
}
