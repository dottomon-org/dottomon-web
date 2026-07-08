import { useCallback, useEffect, useState } from "react";
import type { ResolvedOpts } from "@dotmon/core";

// Old entry shapes (bare seed strings / legMode) are migrated on load
const FAV_KEY = "dotmon:favorites";
// Key from before the service was named; migrated to FAV_KEY on load
const OLD_FAV_KEY = "monsterlab:favorites";

export interface Fav {
  seed: string;
  opts: ResolvedOpts | null;
}

export function sameOpts(a: ResolvedOpts | null, b: ResolvedOpts | null): boolean {
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
  if (!f || typeof f !== "object" || typeof (f as Fav).seed !== "string") return null;
  const raw = f as { seed: string; opts?: (ResolvedOpts & { legMode?: string }) | null };
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
    const v = JSON.parse(localStorage.getItem(FAV_KEY) ?? localStorage.getItem(OLD_FAV_KEY) ?? "null");
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
      localStorage.removeItem(OLD_FAV_KEY);
    } catch { /* ignore */ }
  }, [favs]);

  const isFav = useCallback(
    (seed: string, opts: ResolvedOpts | null) => favs.some((f) => f.seed === seed && sameOpts(f.opts, opts)),
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
  /** Reorder: move the favorite at `from` to position `to` */
  const move = useCallback((from: number, to: number) => {
    setFavs((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  return { favs, isFav, toggle, clear, move };
}
