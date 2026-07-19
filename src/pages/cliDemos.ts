// Real CLI output captured from `npx dottomon@0.12.0` in a truecolor
// terminal (COLORTERM=truecolor, via `script`), with the ANSI SGR stream
// converted to per-line styled runs. Re-capture the same commands and convert
// the 38;2/48;2 color codes to regenerate after CLI output changes.
import type { TermRun } from "../components/TermShot";

/** npx dottomon Poko */
export const DEMO_BASIC: TermRun[][] = [
  [
    { t: "      " },
    { t: "▄", fg: "rgb(26,26,36)" },
    { t: "▀▀", fg: "rgb(26,26,36)", bg: "rgb(97,236,166)" },
    { t: "▄", fg: "rgb(26,26,36)" },
  ],
  [
    { t: "    " },
    { t: "▄", fg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(97,236,166)" },
    { t: "▀▀▀▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(97,236,166)" },
    { t: "▄", fg: "rgb(26,26,36)" },
  ],
  [
    { t: "   " },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(97,236,166)" },
    { t: "▀▀▀▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(26,26,36)" },
  ],
  [
    { t: "  " },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(26,26,36)" },
    { t: "▀▀▀▀▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(97,236,166)" },
    { t: "▀▀▀▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(26,26,36)" },
  ],
  [
    { t: "   " },
    { t: "▀", fg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀▀▀▀▀▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(26,26,36)" },
  ],
  [
    { t: "   " },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(97,236,166)" },
    { t: "▀", fg: "rgb(26,26,36)", bg: "rgb(26,26,36)" },
  ],
  [
    { t: "   " },
    { t: "▀", fg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀▀", fg: "rgb(26,26,36)" },
    { t: "  " },
    { t: "▀▀", fg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(97,236,166)", bg: "rgb(26,26,36)" },
    { t: "▀", fg: "rgb(26,26,36)" },
  ],
  [{ t: "Poko" }],
];
