"use client";

import Link from "next/link";
import { BrandMark } from "@/components/app/BrandMark";
import { useTranslations } from "@/components/app/LanguageProvider";

export function LandingFooter() {
  const landing = useTranslations("landing");

  return (
    <footer className="winLandingFooter text-body">
      <BrandMark iconClassName="size-8" wordmarkClassName="text-2xl" />
      <p>{landing.footer}</p>
      <div>
        <Link href="/login">{landing.login}</Link>
        <Link href="/register">{landing.startNow}</Link>
        <Link href="/terms">{landing.terms}</Link>
        <Link href="/privacy">{landing.privacy}</Link>
      </div>
    </footer>
  );
}
