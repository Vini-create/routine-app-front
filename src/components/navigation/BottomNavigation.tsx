"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import alfredIcon from "../../../new_nav_icons/alfred.svg";
import feedbackIcon from "../../../new_nav_icons/feedback.svg";
import goalsIcon from "../../../new_nav_icons/goals.svg";
import habitsIcon from "../../../new_nav_icons/habits.svg";
import homeIcon from "../../../new_nav_icons/home.svg";
import profileIcon from "../../../new_nav_icons/profile.svg";
import routineIcon from "../../../new_nav_icons/routine.svg";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", labelKey: "home", icon: homeIcon },
  { href: "/routine", labelKey: "routine", icon: routineIcon },
  { href: "/goals", labelKey: "goals", icon: goalsIcon },
  { href: "/habits", labelKey: "habits", icon: habitsIcon },
  { href: "/feedback", labelKey: "feedback", icon: feedbackIcon },
  { href: "/assistant", labelKey: "ai", icon: alfredIcon },
] as const;

function NavigationIcon({
  icon,
  active = false,
  className,
}: {
  icon: StaticImageData;
  active?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={icon}
      alt=""
      aria-hidden="true"
      className={cn("navIcon size-[1.15rem] object-contain", active && "navIconActive", className)}
    />
  );
}

export function BottomNavigation() {
  const pathname = usePathname();
  const nav = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="winperiumSideRail fixed bottom-6 left-6 top-6 z-40 hidden w-[88px] flex-col items-center rounded-[30px] px-3 py-5 lg:flex">
        <Link
          href="/dashboard"
          className="mb-9 grid size-11 place-items-center rounded-[17px] border border-[var(--border-soft)] bg-[var(--surface-ambient)] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]"
          aria-label="Winperium"
        >
          <BrandMark showWordmark={false} iconClassName="size-7" />
        </Link>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={nav[item.labelKey]}
              className={cn(
                "group/navitem relative my-1.5 grid size-11 place-items-center rounded-full text-base font-light text-[var(--text-tertiary)] transition duration-200 hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]",
                active && "bg-[var(--text-primary)] text-[var(--background-primary)] shadow-[0_7px_18px_rgba(0,0,0,.12),inset_0_1px_0_rgba(255,255,255,.28)]",
              )}
            >
              <NavigationIcon icon={item.icon} active={active} />
              <span
                className={cn(
                  "glass-ambient pointer-events-none absolute left-[3.45rem] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] opacity-0 transition",
                  "group-hover/navitem:translate-x-1 group-hover/navitem:opacity-100",
                  active && "translate-x-1 opacity-100",
                )}
              >
                {nav[item.labelKey]}
              </span>
            </Link>
          );
        })}
        <div className="flex-1" />
        <Link
          href="/settings"
          title={nav.profile}
          className={cn(
            "group/navitem relative grid size-10 place-items-center rounded-full text-sm text-[var(--text-tertiary)] transition hover:bg-[var(--surface-ambient)] hover:text-[var(--text-primary)]",
            pathname === "/settings" && "bg-[var(--text-primary)] text-[var(--background-primary)]",
          )}
        >
          <NavigationIcon icon={profileIcon} active={pathname === "/settings"} />
          <span
            className={cn(
              "glass-ambient pointer-events-none absolute left-[3.45rem] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)] opacity-0 transition",
              "group-hover/navitem:translate-x-1 group-hover/navitem:opacity-100",
              pathname === "/settings" && "translate-x-1 opacity-100",
            )}
          >
            {nav.profile}
          </span>
        </Link>
      </aside>

      <button
        type="button"
        aria-label={open ? "Fechar navegação" : "Abrir navegação"}
        onClick={() => setOpen((current) => !current)}
        className="glass-ambient fixed left-4 top-4 z-50 grid size-12 place-items-center rounded-2xl lg:hidden"
      >
        <span className="grid gap-1.5">
          <i className={cn("block h-0.5 w-5 rounded-full bg-[var(--text-primary)] transition", open && "translate-y-2 rotate-45")} />
          <i className={cn("block h-0.5 w-5 rounded-full bg-[var(--text-primary)] transition", open && "opacity-0")} />
          <i className={cn("block h-0.5 w-5 rounded-full bg-[var(--text-primary)] transition", open && "-translate-y-2 -rotate-45")} />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <nav
            className="glass-focus absolute left-4 top-20 grid w-[min(18rem,calc(100vw-2rem))] gap-2 rounded-[1.8rem] p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center gap-3 px-2 py-2">
              <span className="grid size-10 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-standard)] text-[var(--text-primary)]">
                <BrandMark showWordmark={false} iconClassName="size-7" />
              </span>
              <span className="font-wordmark translate-y-0.5 text-2xl text-[var(--text-primary)]">Winperium</span>
            </div>
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "grid min-h-12 grid-cols-[2.5rem_1fr] items-center rounded-[1.15rem] px-2 text-sm font-bold text-[var(--text-secondary)] transition hover:bg-[var(--surface-standard)] hover:text-[var(--text-primary)]",
                    active && "bg-[var(--text-primary)] text-[var(--background-primary)]",
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-full">
                    <NavigationIcon icon={item.icon} active={active} />
                  </span>
                  <span>{nav[item.labelKey]}</span>
                </Link>
              );
            })}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "mt-2 grid min-h-12 grid-cols-[2.5rem_1fr] items-center rounded-[1.15rem] border-t border-[var(--border-soft)] px-2 pt-2 text-sm font-bold text-[var(--text-secondary)] transition hover:bg-[var(--surface-standard)] hover:text-[var(--text-primary)]",
                pathname === "/settings" && "bg-[var(--text-primary)] text-[var(--background-primary)]",
              )}
            >
              <span className="grid size-9 place-items-center rounded-full">
                <NavigationIcon icon={profileIcon} active={pathname === "/settings"} />
              </span>
              <span>{nav.profile}</span>
            </Link>
          </nav>
        </div>
      ) : null}

      <nav className="glass-ambient winperiumMobileNav fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 grid h-[66px] grid-cols-6 items-center rounded-full px-2 lg:hidden" aria-label="Primary">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={nav[item.labelKey]}
              aria-label={nav[item.labelKey]}
              className={cn(
                "grid min-h-11 place-items-center rounded-full text-base text-[var(--text-tertiary)] transition",
                active && "bg-[var(--text-primary)] text-[var(--background-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,.22)]",
              )}
            >
              <NavigationIcon icon={item.icon} active={active} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
