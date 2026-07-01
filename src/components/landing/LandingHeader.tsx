"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";
import { Button } from "@/components/ui/Button";

export function LandingHeader() {
  const landing = useTranslations("landing");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="winLandingHeader" data-scrolled={scrolled || menuOpen}>
      <div className="winLandingHeaderInner">
        <Link href="/" aria-label={landing.homeAriaLabel} onClick={closeMenu}>
          <BrandMark iconClassName="size-8 sm:size-9" wordmarkClassName="text-[1.55rem] sm:text-[1.8rem]" />
        </Link>

        <nav className="winLandingDesktopNav text-body" aria-label={landing.mainNavigationLabel}>
          <a href="#produto">{landing.productNav}</a>
          <a href="#recursos">{landing.resourcesNav}</a>
          <a href="#alfred">Alfred</a>
          <Link href="/login">{landing.login}</Link>
        </nav>

        <div className="winLandingHeaderActions">
          <Button href="/register" className="hidden min-h-10 px-4 sm:inline-flex">{landing.startNow}</Button>
          <button
            type="button"
            className="winLandingMenuButton"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={menuOpen ? landing.closeMenu : landing.openMenu}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span /><span />
          </button>
        </div>
      </div>

      <nav
        id="landing-mobile-menu"
        className="winLandingMobileNav text-body"
        data-open={menuOpen}
        aria-label={landing.mobileNavigationLabel}
      >
        <a href="#produto" onClick={closeMenu}>{landing.productNav}</a>
        <a href="#recursos" onClick={closeMenu}>{landing.resourcesNav}</a>
        <a href="#alfred" onClick={closeMenu}>Alfred</a>
        <Link href="/login" onClick={closeMenu}>{landing.login}</Link>
        <Button href="/register" className="w-full" onClick={closeMenu}>{landing.startNow}</Button>
      </nav>
    </header>
  );
}
