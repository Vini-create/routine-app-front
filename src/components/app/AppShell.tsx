import type { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

export function AppShell({
  title,
  children,
  showTitle = true,
  mainClassName = "",
}: {
  title: string;
  children: ReactNode;
  showTitle?: boolean;
  mainClassName?: string;
}) {
  return (
    <div className="alfredPage min-h-dvh">
      <MobileHeader />
      <main className={`mx-auto grid w-full max-w-[1420px] gap-7 px-5 pb-[calc(112px+env(safe-area-inset-bottom))] pt-7 sm:px-6 lg:ml-0 lg:gap-8 lg:px-12 lg:pb-14 lg:pl-[150px] lg:pt-10 xl:mx-auto xl:pl-[150px] ${mainClassName}`}>
        {showTitle ? (
          <h1 className="display-title metallicPageTitle text-[3.25rem] text-[var(--text-primary)] sm:text-7xl lg:text-[5.35rem]">
            {title}
          </h1>
        ) : null}
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
