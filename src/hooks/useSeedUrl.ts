// ?seed= is treated as plain text only (control chars stripped + trim + 100-char cap)
export function readSeedFromUrl(): string | null {
  try {
    const q = new URLSearchParams(location.search).get("seed");
    if (!q) return null;
    const cleaned = q
      // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping control characters from user input is the point
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 100);
    return cleaned || null;
  } catch {
    return null;
  }
}

// The URL is not live-synced: share links (built by the share buttons) are a
// one-shot initializer, consumed on load and then stripped — see lib/shareUrl
