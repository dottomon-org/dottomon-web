import { useEffect } from "react";

// ?seed= はテキストとしてのみ扱う（制御文字除去 + trim + 100文字上限）
export function readSeedFromUrl(): string | null {
  try {
    const q = new URLSearchParams(location.search).get("seed");
    if (!q) return null;
    // eslint-disable-next-line no-control-regex
    const cleaned = q.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100);
    return cleaned || null;
  } catch {
    return null;
  }
}

// replaceStateなのでブラウザの戻るには影響しない
export function useSyncSeedUrl(seed: string) {
  useEffect(() => {
    if (!seed) return;
    try {
      const url = new URL(location.href);
      url.searchParams.set("seed", seed);
      window.history.replaceState(null, "", url);
    } catch { /* ignore */ }
  }, [seed]);
}
