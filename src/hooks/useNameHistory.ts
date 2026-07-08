import { useCallback, useEffect, useState } from "react";

const HIST_KEY = "dotmon:history";
// Key from before the service was named; migrated to HIST_KEY on load
const OLD_HIST_KEY = "monstermaker:history";

function load(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(HIST_KEY) ?? localStorage.getItem(OLD_HIST_KEY) ?? "null");
    return Array.isArray(v) ? v.filter((s) => typeof s === "string").slice(-10) : [];
  } catch {
    return [];
  }
}

export function useNameHistory() {
  const [hist, setHist] = useState<string[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(hist));
      localStorage.removeItem(OLD_HIST_KEY);
    } catch { /* ignore */ }
  }, [hist]);

  const push = useCallback((seed: string) => {
    setHist((prev) => (prev[prev.length - 1] === seed ? prev : [...prev, seed].slice(-10)));
  }, []);

  const back = useCallback((): string | null => {
    if (hist.length < 2) return null;
    const prev = hist[hist.length - 2];
    setHist(hist.slice(0, -1));
    return prev;
  }, [hist]);

  return { push, back, canBack: hist.length >= 2 };
}
