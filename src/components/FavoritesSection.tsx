import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale, ResolvedOpts } from "@dotmon/core";
import { MonsterAvatar } from "@dotmon/react";
import type { Strings } from "../i18n";
import type { Fav } from "../hooks/useFavorites";
import { downloadFavoritesZip } from "../lib/actions";
import { bgStyle } from "../lib/checker";
import { buildShareUrlFromOpts } from "../lib/shareUrl";
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
  onMove: (from: number, to: number) => void;
  onOpen: (seed: string, opts: ResolvedOpts) => void;
  onPng: (seed: string, opts: ResolvedOpts) => void;
  onGif: (seed: string, opts: ResolvedOpts) => void;
  onPlay: (seed: string, opts: ResolvedOpts | null, rect: DOMRect) => void;
}

// iPhone-home-screen style reordering: long-press a favorite to enter reorder
// mode (cells wiggle, other actions are disabled), drag to move, exit with the
// done button or Esc
const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 8;
const FLOAT_SIZE = 88;

export default function FavoritesSection(p: Props) {
  const [reorder, setReorder] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [zipProgress, setZipProgress] = useState<[number, number] | null>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ idx: number; id: number; x: number; y: number } | null>(null);
  const pressRef = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const onMoveRef = useRef(p.onMove);
  onMoveRef.current = p.onMove;

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
  }, []);

  const exitReorder = useCallback(() => {
    endDrag();
    setReorder(false);
  }, [endDrag]);

  // Document-level listeners while dragging, so re-renders from live
  // reordering can't drop the pointer stream
  const dragging = dragIdx !== null;
  useEffect(() => {
    if (!dragging) return;
    const last = { x: dragRef.current?.x ?? 0, y: dragRef.current?.y ?? 0 };
    positionFloat(last.x, last.y);
    const retarget = () => {
      // The float itself is pointer-events:none, so this hits the slot below
      const slot = (document.elementFromPoint(last.x, last.y) as HTMLElement | null)?.closest?.("[data-favslot]") as HTMLElement | null;
      const d = dragRef.current;
      if (!slot || !d) return;
      const to = Number(slot.dataset.favslot);
      if (to !== d.idx) {
        onMoveRef.current(d.idx, to);
        d.idx = to;
        setDragIdx(to);
      }
    };
    const move = (e: PointerEvent) => {
      if (dragRef.current?.id !== e.pointerId) return;
      last.x = e.clientX;
      last.y = e.clientY;
      positionFloat(last.x, last.y);
      retarget();
    };
    const up = (e: PointerEvent) => {
      if (dragRef.current?.id !== e.pointerId) return;
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

  const dragged = dragIdx !== null ? p.favs[dragIdx] : null;

  return (
    <section className="panel">
      <div className="favhead">
        <h2>{p.t.favorites}</h2>
        {reorder ? (
          <button id="favdone" className="primary" onClick={exitReorder}>
            {p.t.favDone}
          </button>
        ) : (
          <div className="favbtns">
            {p.favs.length > 0 && (
              <button
                id="favzip"
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
        className={"grid" + (reorder ? " reordering" : "")}
        onContextMenu={(e) => {
          if (reorder || pressRef.current) e.preventDefault();
        }}
      >
        {p.favs.map((f, i) => {
          const fo = f.opts ?? p.currentOpts;
          return (
            <div
              key={f.seed + "|" + JSON.stringify(f.opts)}
              className={"favslot" + (reorder && dragIdx === i ? " ghost" : "")}
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
      {p.favs.length === 0 && <div className="vnote">{p.t.favEmpty}</div>}
      {dragged &&
        createPortal(
          <div id="favfloat" ref={floatRef} style={{ background: bgStyle(p.bg, 12) }}>
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
