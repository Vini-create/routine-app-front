"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({
  title = "Appearance",
  description = "Switch between Winperium dark and warm light mode.",
  lightLabel = "Light mode",
  darkLabel = "Dark mode",
}: {
  title?: string;
  description?: string;
  lightLabel?: string;
  darkLabel?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="alfredThemeControl flex items-center justify-between gap-4 rounded-2xl p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggleTheme}
        className="relative grid h-9 w-[4.75rem] shrink-0 rounded-full border border-[var(--border-medium)] bg-[var(--surface-standard)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition"
        aria-label={isLight ? darkLabel : lightLabel}
      >
        <span
          className="grid size-7 place-items-center rounded-full bg-[var(--text-primary)] text-xs font-black text-[var(--background-primary)] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.9)] transition-transform data-[light=true]:translate-x-9"
          data-light={isLight}
        >
          {isLight ? "☼" : "☾"}
        </span>
      </button>
    </div>
  );
}
