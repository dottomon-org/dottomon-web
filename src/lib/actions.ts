import {
  generateSvg,
  type Locale,
  type ResolvedOpts,
  safeFileName,
  type View,
} from "dottomon";
import {
  assetReadme,
  buildZip,
  SHEET_POSES,
  toAssetZip,
  toGif,
  toPng,
  toSpriteSheet,
  type ZipEntry,
} from "dottomon/render";

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export async function downloadPng(
  seed: string,
  opts: ResolvedOpts,
  view: View,
  size: number,
  background: string,
) {
  const blob = await toPng(generateSvg(seed, { ...opts, view, frame: 0 }).svg, {
    size,
    background,
  });
  downloadBlob(
    blob,
    `${safeFileName(seed) + (view !== "front" ? `-${view}` : "")}.png`,
  );
}

export async function downloadGif(
  seed: string,
  opts: ResolvedOpts,
  view: View,
  size: number,
  background: string,
) {
  const blob = await toGif(
    [
      generateSvg(seed, { ...opts, view, frame: 1 }).svg,
      generateSvg(seed, { ...opts, view, frame: 2 }).svg,
    ],
    { size, background },
  );
  downloadBlob(
    blob,
    `${safeFileName(seed) + (view !== "front" ? `-${view}` : "")}.gif`,
  );
}

export async function downloadZip(
  seed: string,
  opts: ResolvedOpts,
  background: string,
  locale: Locale,
) {
  const blob = await toAssetZip(seed, { ...opts, background, locale });
  downloadBlob(blob, `${safeFileName(seed)}-sprites.zip`);
}

const VIEWS: View[] = ["front", "back", "left", "right"];

/**
 * One archive with every favorite, one folder per monster. Mirrors the file
 * layout of core's toAssetZip (README, per-view pose PNGs + GIF, sprite
 * sheet); worth moving into core as a file-list API if this grows.
 */
export async function downloadFavoritesZip(
  favs: { seed: string; opts: ResolvedOpts }[],
  background: string,
  locale: Locale,
  onProgress?: (done: number, total: number) => void,
) {
  const files: ZipEntry[] = [];
  const usedDirs = new Set<string>();
  let done = 0;
  for (const f of favs) {
    // Two favorites may share a seed (different options) — suffix the folder
    let dir = safeFileName(f.seed);
    if (usedDirs.has(dir)) {
      let n = 2;
      while (usedDirs.has(`${dir}-${n}`)) n++;
      dir = `${dir}-${n}`;
    }
    usedDirs.add(dir);
    files.push({
      name: `${dir}/README.txt`,
      data: new TextEncoder().encode(assetReadme(f.seed, locale)),
    });
    for (const view of VIEWS) {
      for (const [pose, frame] of SHEET_POSES) {
        const png = await toPng(
          generateSvg(f.seed, { ...f.opts, view, frame }).svg,
          { size: 512, background },
        );
        files.push({
          name: `${dir}/${view}_${pose}.png`,
          data: new Uint8Array(await png.arrayBuffer()),
        });
      }
      const gif = await toGif(
        [
          generateSvg(f.seed, { ...f.opts, view, frame: 1 }).svg,
          generateSvg(f.seed, { ...f.opts, view, frame: 2 }).svg,
        ],
        { size: 256, background },
      );
      files.push({
        name: `${dir}/${view}.gif`,
        data: new Uint8Array(await gif.arrayBuffer()),
      });
    }
    const sheet = await toSpriteSheet(f.seed, f.opts);
    files.push({
      name: `${dir}/sheet.png`,
      data: new Uint8Array(await sheet.png.arrayBuffer()),
    });
    files.push({
      name: `${dir}/sheet.json`,
      data: new TextEncoder().encode(JSON.stringify(sheet.json, null, 2)),
    });
    done++;
    onProgress?.(done, favs.length);
  }
  downloadBlob(buildZip(files), "dottomon-favorites.zip");
}
