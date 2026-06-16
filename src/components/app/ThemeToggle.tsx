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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#2B2B31] bg-[#0B0B0D]/35 p-4 alfredThemeControl">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#F6F1E8]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8B847B]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggleTheme}
        className="relative grid h-9 w-[4.75rem] shrink-0 rounded-full border border-transparent bg-[linear-gradient(#17171A,#17171A)_padding-box,linear-gradient(135deg,#D8B08C,#B87333,#6F3A1B)_border-box] p-1 shadow-[inset_0_1px_0_rgba(246,241,232,0.12)] transition"
        aria-label={isLight ? darkLabel : lightLabel}
      >
        <span
          className="grid size-7 place-items-center rounded-full bg-[#F6F1E8] text-xs font-black text-[#0B0B0D] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.9)] transition-transform data-[light=true]:translate-x-9"
          data-light={isLight}
        >
          {isLight ? "☼" : "☾"}
        </span>
      </button>
    </div>
  );
}
