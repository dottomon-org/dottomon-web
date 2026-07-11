import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale, ResolvedOpts } from "@dotmon/core";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
import type { Fav } from "../hooks/useFavorites";
import { downloadFavoritesZip } from "../lib/actions";
import { bgStyle } from "../lib/checker";
import { buildShareUrlFromOpts } from "../lib/shareUrl";
import { btnShell, focusRing, panel, panelH2, vnote } from "../lib/ui";
import MonsterCell from "./MonsterCell";

interface Props {
  favs: Fav[];
  currentOpts: ResolvedOpts;
  bg: string;
  animate: boolean;
  locale: Locale;
  t: Strings;
  onToggle: (seed: string, opts: ResolvedOpts | null) => void;
  onClear: () => void;
  onSwap: (a: number, b: number) => void;
  onOpen: (seed: string, opts: ResolvedOpts) => void;
  onPng: (seed: string, opts: ResolvedOpts) => void;
  onGif: (seed: string, opts: ResolvedOpts) => void;
  onPlay: (seed: string, opts: ResolvedOpts | null, rect: DOMRect) => void;
}

// iPhone-home-screen style reordering: long-press a favorite to enter reorder
// mode (cells wiggle, other actions are disabled), drag onto another favorite to
// SWAP the two, exit with the done button or Esc
const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 8;
const FLOAT_SIZE = 88;

/** Ghost small button (clear all / download all) */
const ghostBtn = `mb-3 flex-none cursor-pointer rounded-md border border-line bg-transparent px-2.25 py-1 text-[10px] text-dim ${focusRing}`;

export default function FavoritesSection(p: Props) {
  const [reorder, setReorder] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);
  const [zipProgress, setZipProgress] = useState<[number, number] | null>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ idx: number; id: number; x: number; y: number } | null>(null);
  const pressRef = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const onSwapRef = useRef(p.onSwap);
  onSwapRef.current = p.onSwap;

  const clearPress = () => {
    if (pressRef.current) {
      clearTimeout(pressRef.current.timer);
      pressRef.current = null;
    }
  };

  const positionFloat = (x: number, y: number) => {
    const el = floatRef.current;
    if (el) el.style.transform = `translate(${x - FLOAT_SIZE / 2}px, ${y - FLOAT_SIZE / 2}px)`;
  };

  const startDrag = (idx: number, id: number, x: number, y: number) => {
    dragRef.current = { idx, id, x, y };
    setDragIdx(idx);
  };

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDragIdx(null);
    setTargetIdx(null);
  }, []);

  // The favorite slot currently under (x, y), or null when over none
  const slotAt = (x: number, y: number): number | null => {
    const el = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest?.("[data-favslot]") as HTMLElement | null;
    return el ? Number(el.dataset.favslot) : null;
  };

  const exitReorder = useCallback(() => {
    endDrag();
    setReorder(false);
  }, [endDrag]);

  // Document-level listeners while dragging. The list does NOT reorder during
  // the drag; we only highlight the hovered slot, then swap the picked-up index
  // with the drop target on release — so any two cells trade places cleanly,
  // regardless of the drag path (a plain splice-insert would shift the cells in
  // between, which reads as a swap only for left/right neighbours).
  const dragging = dragIdx !== null;
  useEffect(() => {
    if (!dragging) return;
    const last = { x: dragRef.current?.x ?? 0, y: dragRef.current?.y ?? 0 };
    positionFloat(last.x, last.y);
    // The float is pointer-events:none, so slotAt() hits the cell below it
    const retarget = () => {
      const d = dragRef.current;
      const to = slotAt(last.x, last.y);
      setTargetIdx(d && to !== null && to !== d.idx ? to : null);
    };
    retarget();
    const move = (e: PointerEvent) => {
      if (dragRef.current?.id !== e.pointerId) return;
      last.x = e.clientX;
      last.y = e.clientY;
      positionFloat(last.x, last.y);
      retarget();
    };
    const up = (e: PointerEvent) => {
      if (dragRef.current?.id !== e.pointerId) return;
      const d = dragRef.current;
      // Drop lands where the pointer is released
      const to = slotAt(e.clientX, e.clientY);
      if (d && to !== null && to !== d.idx) onSwapRef.current(d.idx, to);
      endDrag();
    };
    // Blocks page scroll during a touch drag, including the drag that starts
    // mid-gesture right after the long press fires
    const touchBlock = (e: TouchEvent) => e.preventDefault();
    // Auto-scroll while the pointer sits near the viewport edge (retargeting as
    // the page moves under a stationary pointer)
    const EDGE = 70;
    const MAX_SPEED = 14;
    let raf = 0;
    const tick = () => {
      const vy =
        last.y < EDGE
          ? -Math.ceil(((EDGE - last.y) / EDGE) * MAX_SPEED)
          : last.y > window.innerHeight - EDGE
            ? Math.ceil(((last.y - (window.innerHeight - EDGE)) / EDGE) * MAX_SPEED)
            : 0;
      if (vy) {
        window.scrollBy(0, vy);
        retarget();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    document.addEventListener("touchmove", touchBlock, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      document.removeEventListener("touchmove", touchBlock);
    };
  }, [dragging, endDrag]);

  useEffect(() => {
    if (!reorder) return;
    const kd = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitReorder();
    };
    // Tapping anywhere that isn't a favorite also leaves reorder mode
    // (ignored mid-drag so a stray second finger can't cancel a move)
    const down = (e: PointerEvent) => {
      if (dragRef.current) return;
      if ((e.target as HTMLElement | null)?.closest?.("[data-favslot]")) return;
      exitReorder();
    };
    document.addEventListener("keydown", kd);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("keydown", kd);
      document.removeEventListener("pointerdown", down);
    };
  }, [reorder, exitReorder]);

  const slotDown = (idx: number) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (reorder) {
      e.preventDefault();
      startDrag(idx, e.pointerId, e.clientX, e.clientY);
      return;
    }
    const { pointerId, clientX, clientY } = e;
    clearPress();
    pressRef.current = {
      x: clientX,
      y: clientY,
      timer: setTimeout(() => {
        pressRef.current = null;
        setReorder(true);
        startDrag(idx, pointerId, clientX, clientY);
      }, LONG_PRESS_MS),
    };
  };
  const slotMove = (e: React.PointerEvent) => {
    const pr = pressRef.current;
    if (pr && Math.hypot(e.clientX - pr.x, e.clientY - pr.y) > MOVE_CANCEL_PX) clearPress();
  };

  // Reorder-mode looks are decided here (not by CSS selectors): the dragged
  // slot ghosts, the hovered slot shows the swap ring, everything else wiggles
  const slotCls = (i: number) => {
    const base = "select-none rounded-lg [-webkit-touch-callout:none]";
    if (!reorder) return `${base} touch-pan-y`;
    const state =
      dragIdx === i
        ? "opacity-35 animate-wiggle even:[animation-delay:0.18s] motion-reduce:animate-none"
        : targetIdx === i
          ? "outline-2 outline-acid outline-offset-1 shadow-[0_0_0_4px_rgba(184,245,66,0.18)]"
          : "animate-wiggle even:[animation-delay:0.18s] motion-reduce:animate-none";
    return `${base} cursor-grab touch-none **:pointer-events-none ${state}`;
  };

  const dragged = dragIdx !== null ? p.favs[dragIdx] : null;

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-x-2.5">
        <h2 className={panelH2}>{p.t.favorites}</h2>
        {reorder ? (
          <button
            id="favdone"
            className={`${btnShell} mb-3 flex-none border-acid bg-acid px-3 py-1 text-[11px] font-bold text-bg`}
            onClick={exitReorder}
          >
            {p.t.favDone}
          </button>
        ) : (
          <div className="flex gap-1.5">
            {p.favs.length > 0 && (
              <button
                id="favzip"
                className={`${ghostBtn} enabled:hover:border-dim enabled:hover:text-ink disabled:cursor-default disabled:tabular-nums`}
                disabled={zipProgress !== null}
                onClick={async () => {
                  if (zipProgress) return;
                  const items = p.favs.map((f) => ({ seed: f.seed, opts: f.opts ?? p.currentOpts }));
                  setZipProgress([0, items.length]);
                  try {
                    await downloadFavoritesZip(items, p.bg, p.locale, (done, total) => setZipProgress([done, total]));
                  } finally {
                    setZipProgress(null);
                  }
                }}
              >
                {zipProgress ? p.t.favZipBusy(zipProgress[0], zipProgress[1]) : p.t.favZip}
              </button>
            )}
            <button
              id="favclear"
              className={`${ghostBtn} hover:border-dim hover:text-ink`}
              onClick={() => {
                if (!p.favs.length) return;
                if (!confirm(p.t.favClearConfirm)) return;
                p.onClear();
              }}
            >
              {p.t.favClear}
            </button>
          </div>
        )}
      </div>
      <div
        className={`grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5 max-sm:grid-cols-3 ${reorder ? "touch-none" : ""}`}
        onContextMenu={(e) => {
          if (reorder || pressRef.current) e.preventDefault();
        }}
      >
        {p.favs.map((f, i) => {
          const fo = f.opts ?? p.currentOpts;
          return (
            <div
              key={f.seed + "|" + JSON.stringify(f.opts)}
              className={slotCls(i)}
              data-favslot={i}
              onPointerDown={slotDown(i)}
              onPointerMove={slotMove}
              onPointerUp={clearPress}
              onPointerLeave={clearPress}
              onPointerCancel={clearPress}
            >
              <MonsterCell
                seed={f.seed}
                opts={fo}
                bg={p.bg}
                animate={p.animate}
                t={p.t}
                favOn={true}
                onToggleFav={() => p.onToggle(f.seed, f.opts)}
                onOpen={() => p.onOpen(f.seed, fo)}
                onPng={() => p.onPng(f.seed, fo)}
                onGif={() => p.onGif(f.seed, fo)}
                onPlay={(rect) => p.onPlay(f.seed, f.opts, rect)}
                onShare={() => buildShareUrlFromOpts(f.seed, fo)}
              />
            </div>
          );
        })}
      </div>
      {p.favs.length === 0 && <div className={vnote}>{p.t.favEmpty}</div>}
      {dragged &&
        createPortal(
          <div
            id="favfloat"
            className="pointer-events-none fixed top-0 left-0 z-[70] size-[88px] rounded-lg border border-line p-[7px] shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
            ref={floatRef}
            style={{ background: bgStyle(p.bg, 12) }}
          >
            <MonsterAvatar
              seed={dragged.seed}
              options={dragged.opts ?? p.currentOpts}
              size="100%"
              style={{ aspectRatio: "1", height: "auto", display: "block" }}
            />
          </div>,
          document.body,
        )}
    </section>
  );
}
