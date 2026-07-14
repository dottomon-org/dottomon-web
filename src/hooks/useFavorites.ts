import type { ResolvedOpts } from "dottomon";
import { useCallback, useEffect, useState } from "react";

// Old entry shapes (bare seed strings / legMode) are migrated on load
const FAV_KEY = "dottomon:favorites";
// Keys from earlier service names; migrated to FAV_KEY on load
const OLD_FAV_KEYS = ["dotmon:favorites", "monsterlab:favorites"];

export interface Fav {
  seed: string;
  opts: ResolvedOpts | null;
}

export function sameOpts(
  a: ResolvedOpts | null,
  b: ResolvedOpts | null,
): boolean {
  if (!a || !b) return a === b;
  return (
    a.connected === b.connected &&
    a.symmetric === b.symmetric &&
    a.outline === b.outline &&
    a.face === b.face &&
    a.legs === b.legs &&
    a.gapFill === b.gapFill
  );
}

function normalize(f: unknown): Fav | null {
  if (typeof f === "string") return { seed: f, opts: null };
  if (!f || typeof f !== "object" || typeof (f as Fav).seed !== "string")
    return null;
  const raw = f as {
    seed: string;
    opts?: (ResolvedOpts & { legMode?: string }) | null;
  };
  if (!raw.opts) return { seed: raw.seed, opts: null };
  const { legMode, ...rest } = raw.opts;
  return {
    seed: raw.seed,
    opts: {
      ...rest,
      legs: rest.legs ?? (legMode as ResolvedOpts["legs"]) ?? "auto",
      // Favorites saved before gapFill existed are backfilled with the same dynamic
      // default core uses (ON for retro-shaped options)
      gapFill: rest.gapFill ?? (!rest.connected && rest.symmetric),
    },
  };
}

function load(): Fav[] {
  try {
    const raw =
      localStorage.getItem(FAV_KEY) ??
      OLD_FAV_KEYS.map((k) => localStorage.getItem(k)).find((v) => v !== null);
    const v = JSON.parse(raw ?? "null");
    if (!Array.isArray(v)) return [];
    return v.map(normalize).filter((f): f is Fav => f !== null);
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<Fav[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favs));
      for (const k of OLD_FAV_KEYS) localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }, [favs]);

  const isFav = useCallback(
    (seed: string, opts: ResolvedOpts | null) =>
      favs.some((f) => f.seed === seed && sameOpts(f.opts, opts)),
    [favs],
  );
  const toggle = useCallback((seed: string, opts: ResolvedOpts | null) => {
    setFavs((prev) =>
      prev.some((f) => f.seed === seed && sameOpts(f.opts, opts))
        ? prev.filter((f) => !(f.seed === seed && sameOpts(f.opts, opts)))
        : [...prev, { seed, opts }],
    );
  }, []);
  const clear = useCallback(() => setFavs([]), []);
  /** Reorder: exchange the favorites at positions `a` and `b` */
  const swap = useCallback((a: number, b: number) => {
    setFavs((prev) => {
      if (a === b || a < 0 || b < 0 || a >= prev.length || b >= prev.length)
        return prev;
      const next = prev.slice();
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  }, []);

  return { favs, isFav, toggle, clear, swap };
}
