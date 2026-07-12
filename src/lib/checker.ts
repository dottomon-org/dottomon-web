export const CHECKER = (px: number) =>
  `repeating-conic-gradient(#ffffff 0% 25%, #f0f0e8 0% 50%) 0 0 / ${px}px ${px}px`;

export const bgStyle = (bg: string, px: number) =>
  bg === "transparent" ? CHECKER(px) : bg;
