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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2B2B31] bg-[#0B0B0D]/92 px-3 pb-3 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-6 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative grid min-h-14 place-items-center rounded-xl px-1 text-xs font-semibold text-[#8B847B] transition hover:bg-[#17171A] hover:text-[#EDE6DA]",
                active && "bg-[#17171A] text-[#D8B08C] shadow-soft before:absolute before:top-0 before:h-0.5 before:w-8 before:rounded-full before:bg-[linear-gradient(90deg,#6F3A1B,#D8B08C,#B87333)]",
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
