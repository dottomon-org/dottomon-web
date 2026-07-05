import { generateSvg, safeFileName, type Locale, type ResolvedOpts, type View } from "@dotmon/core";
import { toAssetZip, toGif, toPng } from "@dotmon/core/render";

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export async function downloadPng(seed: string, opts: ResolvedOpts, view: View, size: number, background: string) {
  const blob = await toPng(generateSvg(seed, { ...opts, view, frame: 0 }).svg, { size, background });
  downloadBlob(blob, safeFileName(seed) + (view !== "front" ? "-" + view : "") + ".png");
}

export async function downloadGif(seed: string, opts: ResolvedOpts, view: View, size: number, background: string) {
  const blob = await toGif(
    [generateSvg(seed, { ...opts, view, frame: 1 }).svg, generateSvg(seed, { ...opts, view, frame: 2 }).svg],
    { size, background },
  );
  downloadBlob(blob, safeFileName(seed) + (view !== "front" ? "-" + view : "") + ".gif");
}

export async function downloadZip(seed: string, opts: ResolvedOpts, background: string, locale: Locale) {
  const blob = await toAssetZip(seed, { ...opts, background, locale });
  downloadBlob(blob, safeFileName(seed) + "-sprites.zip");
}
