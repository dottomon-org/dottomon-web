import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { generateSvg, type ResolvedOpts, type View } from "@dotmon/core";

const KEYMAP: Record<string, "up" | "down" | "left" | "right"> = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
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

export default function WalkingPlayer({ seed, opts, x0, y0, hint, onDismiss }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const st = useRef({
    x: x0, y: y0, dir: "front" as View, moving: false, walkFrame: 0,
    walkTimer: 0, keys: new Set<string>(), last: 0, curSvg: "",
  });

  const optsKey = JSON.stringify(opts);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      let dx = 0, dy = 0;
      if (s.keys.has("left")) dx -= 1;
      if (s.keys.has("right")) dx += 1;
      if (s.keys.has("up")) dy -= 1;
      if (s.keys.has("down")) dy += 1;
      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        if (dx < 0) s.dir = "left";
        else if (dx > 0) s.dir = "right";
        else if (dy < 0) s.dir = "back";
        else s.dir = "front";
        const spd = 0.16 * dt;
        const norm = dx && dy ? Math.SQRT1_2 : 1;
        s.x = Math.min(Math.max(s.x + dx * spd * norm, 0), window.innerWidth - 64);
        s.y = Math.min(Math.max(s.y + dy * spd * norm, 0), window.innerHeight - 64);
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

  return createPortal(
    <>
      <div id="player" ref={elRef} onClick={onDismiss} />
      <div id="playhint">{hint}</div>
    </>,
    document.body,
  );
}
