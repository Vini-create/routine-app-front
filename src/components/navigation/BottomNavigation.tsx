"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/components/app/LanguageProvider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", labelKey: "home", icon: "⌂" },
  { href: "/routine", labelKey: "routine", icon: "◷" },
  { href: "/habits", labelKey: "habits", icon: "✓" },
  { href: "/feedback", labelKey: "feedback", icon: "◈" },
  { href: "/assistant", labelKey: "ai", icon: "✦" },
  { href: "/settings", labelKey: "profile", icon: "◎" },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();
  const nav = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/70 bg-white/90 px-3 pb-3 pt-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto grid max-w-3xl grid-cols-6 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "grid min-h-14 place-items-center rounded-2xl px-1 text-xs font-semibold text-zinc-500 transition",
                active && "bg-zinc-950 text-white shadow-soft dark:bg-white dark:text-zinc-950",
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
