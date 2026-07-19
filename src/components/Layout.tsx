import { useEffect, useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { useLocale } from "../i18n";
import { focusRing } from "../lib/ui";
import ToastHost from "./Toast";

/** Locale bundle shared with pages through the router outlet */
export type LocaleCtx = ReturnType<typeof useLocale>;

export function useLocaleCtx() {
  return useOutletContext<LocaleCtx>();
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded ${focusRing} ${isActive ? "text-acid" : "text-dim hover:text-ink"}`;

const navLinkMobile = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 font-mono text-[13px] ${focusRing} ${
    isActive ? "text-acid" : "text-ink hover:bg-panel2"
  }`;

export default function Layout() {
  const ctx = useLocale();
  const { locale, setLocale, t } = ctx;
  const prefix = locale === "ja" ? "/ja" : "";
  const home = prefix === "" ? "/" : "/ja/";
  const [menuOpen, setMenuOpen] = useState(false);

  const items = [
    { to: home, label: t.navPlayground, end: true },
    { to: `${prefix}/react`, label: "React", end: false },
    { to: `${prefix}/cli`, label: "CLI", end: false },
  ];

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggleLocale = () => setLocale(locale === "en" ? "ja" : "en");

  return (
    <div className="mx-auto max-w-[1020px]">
      <header className="mb-5.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 text-[11px] tracking-[0.35em] text-acid uppercase">
              pixel monster maker
            </div>
            <h1 className="text-[clamp(22px,3.6vw,32px)] font-bold tracking-[0.04em]">
              <NavLink to={home} className={focusRing}>
                dottomon
              </NavLink>
              <span className="animate-blink text-acid motion-reduce:animate-none">
                _
              </span>
            </h1>
          </div>
          {/* Desktop: inline nav + locale toggle. Mobile uses the floating menu below. */}
          <div className="flex items-center gap-3 max-md:hidden">
            <nav className="flex items-center gap-3 font-mono text-[12.5px]">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={navLink}
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              className={`flex-none cursor-pointer rounded-lg border border-line bg-panel2 px-3 py-1.5 font-mono text-[11px] text-ink ${focusRing}`}
              onClick={toggleLocale}
            >
              {locale === "en" ? "日本語" : "English"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: a kebab that follows scroll and opens a popover menu */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label={t.navMenu}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={`fixed top-3 right-3 z-[62] grid size-9 place-items-center rounded-lg border border-line bg-panel2 text-ink shadow-[0_3px_10px_rgba(0,0,0,0.4)] ${focusRing}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 4 16" className="size-4" aria-hidden="true">
            <circle cx="2" cy="2" r="1.7" fill="currentColor" />
            <circle cx="2" cy="8" r="1.7" fill="currentColor" />
            <circle cx="2" cy="14" r="1.7" fill="currentColor" />
          </svg>
        </button>

        {menuOpen && (
          <>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: pointer-only dismiss; Esc handled by the keydown effect */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: transparent click-away backdrop */}
            <div
              className="fixed inset-0 z-[61]"
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              className="fixed top-[3.25rem] right-3 z-[63] min-w-[168px] rounded-xl border border-line bg-panel p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Speech-bubble pointer aimed at the kebab */}
              <div className="absolute -top-1.5 right-3 size-3 rotate-45 border-t border-l border-line bg-panel" />
              <nav className="grid gap-0.5">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    role="menuitem"
                    className={navLinkMobile}
                    onClick={() => setMenuOpen(false)}
                  >
                    {it.label}
                  </NavLink>
                ))}
              </nav>
              <div className="my-1.5 border-t border-line" />
              <button
                type="button"
                role="menuitem"
                className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left font-mono text-[13px] text-ink hover:bg-panel2 ${focusRing}`}
                onClick={() => {
                  toggleLocale();
                  setMenuOpen(false);
                }}
              >
                {locale === "en" ? "日本語" : "English"}
              </button>
            </div>
          </>
        )}
      </div>

      <Outlet context={ctx} />

      <footer className="mt-4.5 text-center text-[11px] text-dim">
        {t.footerMade}{" "}
        <a
          className="underline hover:text-acid"
          href="https://github.com/dottomon-org/dottomon"
          target="_blank"
          rel="noreferrer"
        >
          dottomon
        </a>{" "}
        ·{" "}
        <a
          className="underline hover:text-acid"
          href="https://www.npmjs.com/package/dottomon"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
      </footer>
      <ToastHost />
    </div>
  );
}
