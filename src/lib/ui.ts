// Shared Tailwind class recipes. Kept in one place so controls that repeat
// across components (buttons, chips, form fields) stay visually in sync.
// Rule of thumb: a recipe never stacks two utilities for the same property —
// call sites override via variants (max-md:, pointer-coarse:, hover:) or add
// the missing axis (size, flex) themselves.

/** Acid focus ring used by every interactive control */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(184,245,66,0.55)]";

/** Shape shared by push buttons (colors/size added by btn / btnPrimary / call site) */
export const btnShell = `cursor-pointer rounded-lg border font-mono ${focusRing}`;

/** Default push button */
export const btn = `${btnShell} border-line bg-panel2 px-3 py-2.25 text-[12.5px] text-ink`;

/** Accent (primary) push button */
export const btnPrimary = `${btnShell} border-acid bg-acid px-3 py-2.25 text-[12.5px] font-bold text-bg`;

/**
 * Overlay chip: the translucent dark icon buttons layered on monsters
 * (download/GIF/play/share/star/close). Size, font-size, background shade and
 * resting opacity come from the call site so cells (18px), bars (22px) and
 * touch menus (36px) can differ.
 */
export const chip =
  "grid flex-none cursor-pointer place-items-center rounded-[5px] font-mono font-bold text-white " +
  "hover:bg-[rgba(16,16,31,0.9)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-acid " +
  "[&>svg]:block [&>svg]:size-full";

/** Text input (name field) */
export const inputText = `min-w-0 flex-1 rounded-lg border border-line bg-bg px-2.75 py-2.25 font-mono text-[14px] text-ink outline-none focus:border-acid ${focusRing}`;

/** Select (legs picker) */
export const selectCls = `cursor-pointer rounded-lg border border-line bg-bg px-2 py-1.5 font-mono text-[12px] text-ink outline-none focus:border-acid ${focusRing}`;

/** Checkbox (option rows) */
export const checkboxCls = `size-[15px] accent-acid ${focusRing}`;

/** Color swatch input (background picker) */
export const colorInputCls = `h-7 w-10 cursor-pointer rounded-lg border border-line bg-bg p-0.5 ${focusRing}`;

/** Card panel (sidebar, sections, dialogs share the surface tokens) */
export const panel = "rounded-xl border border-line bg-panel p-4.5 max-md:p-3";

/** Uppercase panel heading */
export const panelH2 = "mb-3 text-[11px] font-bold tracking-[0.3em] text-dim uppercase";

/** Option row inside the sidebar (dashed divider between rows) */
export const trow = "flex items-center gap-2 border-t border-dashed border-line py-2.25 text-[13px] first:border-t-0 first:pt-0.5";

/** Modal dialog surface (views/help) with dimmed backdrop */
export const dialogCls =
  "fixed inset-0 m-auto max-h-[calc(100vh-60px)] w-[calc(100%-40px)] max-w-[560px] overflow-y-auto rounded-xl border border-line bg-panel p-4.5 font-mono text-ink outline-none backdrop:bg-[rgba(6,6,14,0.72)]";

/** Dialog header row (title + close chip) */
export const dialogHead = "mb-3 flex items-center justify-between gap-2.5";

/** 22px overlay chip with its default shade/opacity (bars, dialog buttons) */
export const chipMd = `${chip} size-[22px] bg-[rgba(16,16,31,0.72)] p-[3px] opacity-60 hover:opacity-100`;

/** ▸-bulleted list (dialog notes / help) */
export const vlist = "grid list-none gap-[3px] p-0 [&>li]:before:text-acid [&>li]:before:content-['▸_']";

/** Dimmed footnote text under lists/dialogs */
export const vnote = "mt-3 text-[11px] text-dim";
