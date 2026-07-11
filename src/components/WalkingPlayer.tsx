import { generateSvg, type ResolvedOpts, type View } from "@dotmon/core";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

const KEYMAP: Record<string, "up" | "down" | "left" | "right"> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};
const DIRS: View[] = ["front", "back", "left", "right"];

interface Props {
  seed: string;
  opts: ResolvedOpts;
  x0: number;
  y0: number;
  hint: string;
  onDismiss: () => void;
}

// Virtual joystick: the touch point becomes the stick base, and the drag offset from it
// decides the movement direction and speed
const STICK_RADIUS = 48;
const STICK_DEADZONE = 10;

export default function WalkingPlayer({
  seed,
  opts,
  x0,
  y0,
  hint,
  onDismiss,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const st = useRef({
    x: x0,
    y: y0,
    dir: "front" as View,
    moving: false,
    walkFrame: 0,
    walkTimer: 0,
    keys: new Set<string>(),
    last: 0,
    curSvg: "",
    stick: null as {
      id: number;
      cx: number;
      cy: number;
      vx: number;
      vy: number;
    } | null,
  });

  const optsKey = JSON.stringify(opts);
  // biome-ignore lint/correctness/useExhaustiveDependencies: opts changes are tracked via its serialized key
  const sprites = useMemo(() => {
    const s = {} as Record<View, { idle: string; walk: [string, string] }>;
    for (const d of DIRS) {
      s[d] = {
        idle: generateSvg(seed, { ...opts, view: d, frame: 0 }).svg,
        walk: [
          generateSvg(seed, { ...opts, view: d, frame: 1 }).svg,
          generateSvg(seed, { ...opts, view: d, frame: 2 }).svg,
        ],
      };
    }
    return s;
  }, [seed, optsKey]);

  useEffect(() => {
    const el = elRef.current!;
    const s = st.current;
    s.curSvg = "";
    const draw = () => {
      const sp = sprites[s.dir];
      const svg = s.moving ? sp.walk[s.walkFrame] : sp.idle;
      if (s.curSvg !== svg) {
        el.innerHTML = svg;
        s.curSvg = svg;
      }
      el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    };
    draw();
    let raf = 0;
    const tick = (tms: number) => {
      const dt = Math.min(50, tms - s.last);
      s.last = tms;
      // Treat key input (±1) and the stick (-1..1 analog) as the same velocity vector
      let vx = 0,
        vy = 0;
      if (s.keys.has("left")) vx -= 1;
      if (s.keys.has("right")) vx += 1;
      if (s.keys.has("up")) vy -= 1;
      if (s.keys.has("down")) vy += 1;
      if (vx && vy) {
        vx *= Math.SQRT1_2;
        vy *= Math.SQRT1_2;
      }
      if (!vx && !vy && s.stick) {
        vx = s.stick.vx;
        vy = s.stick.vy;
      }
      const moving = vx !== 0 || vy !== 0;
      if (moving) {
        if (Math.abs(vx) >= Math.abs(vy)) s.dir = vx < 0 ? "left" : "right";
        else s.dir = vy < 0 ? "back" : "front";
        const spd = 0.16 * dt;
        s.x = Math.min(Math.max(s.x + vx * spd, 0), window.innerWidth - 64);
        s.y = Math.min(Math.max(s.y + vy * spd, 0), window.innerHeight - 64);
        s.walkTimer += dt;
        if (s.walkTimer > 180) {
          s.walkTimer = 0;
          s.walkFrame ^= 1;
        }
      }
      s.moving = moving;
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame((tms) => {
      s.last = tms;
      raf = requestAnimationFrame(tick);
    });
    const kd = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Escape") {
        onDismiss();
        return;
      }
      const d = KEYMAP[e.code];
      if (d) {
        s.keys.add(d);
        e.preventDefault();
      }
    };
    const ku = (e: KeyboardEvent) => {
      const d = KEYMAP[e.code];
      if (d) s.keys.delete(d);
    };
    document.addEventListener("keydown", kd);
    document.addEventListener("keyup", ku);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", kd);
      document.removeEventListener("keyup", ku);
    };
  }, [sprites, onDismiss]);

  // ---- virtual joystick (touch devices only; #stickzone accepts input only for coarse pointers) ----
  const stickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    const s = st.current;
    if (s.stick) return; // ignore a second finger
    s.stick = { id: e.pointerId, cx: e.clientX, cy: e.clientY, vx: 0, vy: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture can fail for synthetic events; the stick still works without it */
    }
    const base = baseRef.current!;
    base.style.left = `${e.clientX}px`;
    base.style.top = `${e.clientY}px`;
    base.style.display = "block";
    knobRef.current!.style.transform = "translate(0px, 0px)";
  };
  const stickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (!s.stick || e.pointerId !== s.stick.id) return;
    let ox = e.clientX - s.stick.cx;
    let oy = e.clientY - s.stick.cy;
    const d = Math.hypot(ox, oy);
    if (d > STICK_RADIUS) {
      ox *= STICK_RADIUS / d;
      oy *= STICK_RADIUS / d;
    }
    knobRef.current!.style.transform = `translate(${ox}px, ${oy}px)`;
    // analog speed from the tilt (clamped offset / radius = vector of length 0..1)
    const dead = d < STICK_DEADZONE;
    s.stick.vx = dead ? 0 : ox / STICK_RADIUS;
    s.stick.vy = dead ? 0 : oy / STICK_RADIUS;
  };
  const stickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (!s.stick || e.pointerId !== s.stick.id) return;
    s.stick = null;
    baseRef.current!.style.display = "none";
  };

  return createPortal(
    <>
      {/* Virtual joystick: the whole screen is the input zone on touch devices only (desktop passes through) */}
      <div
        id="stickzone"
        className="pointer-events-none fixed inset-0 z-[49] touch-none pointer-coarse:pointer-events-auto"
        onPointerDown={stickDown}
        onPointerMove={stickMove}
        onPointerUp={stickUp}
        onPointerCancel={stickUp}
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Esc also dismisses (see keydown handler) */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the walking sprite is a pointer-only toy layer */}
      <div
        id="player"
        className="fixed top-0 left-0 z-[50] size-16 cursor-pointer drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] [&_svg]:block [&_svg]:size-full"
        ref={elRef}
        onClick={onDismiss}
      />
      {/* Base/knob visibility + position are driven imperatively (inline styles) from the pointer handlers */}
      <div
        id="stickbase"
        className="pointer-events-none fixed z-[52] -mt-12 -ml-12 hidden size-24 rounded-full border-2 border-[rgba(232,232,242,0.4)] bg-[rgba(232,232,242,0.08)]"
        ref={baseRef}
      >
        <div
          id="stickknob"
          className="absolute top-1/2 left-1/2 -mt-5 -ml-5 size-10 rounded-full bg-[rgba(232,232,242,0.5)]"
          ref={knobRef}
        />
      </div>
      <div
        id="playhint"
        className="pointer-events-none fixed bottom-3.5 left-1/2 z-[51] -translate-x-1/2 rounded-lg border border-line bg-[rgba(16,16,31,0.88)] px-3 py-1.5 text-[11px] whitespace-nowrap text-ink"
      >
        {hint}
      </div>
    </>,
    document.body,
  );
}
