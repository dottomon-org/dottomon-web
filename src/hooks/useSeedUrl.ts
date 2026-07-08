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

// The URL is not live-synced: share links (built by the share buttons) are a
// one-shot initializer, consumed on load and then stripped — see lib/shareUrl
