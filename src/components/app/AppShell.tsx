import type { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { AuthGuard } from "./AuthGuard";
import { PageInfoButton } from "./PageInfoButton";
import { FirstAccessTour } from "./FirstAccessTour";
import type { PageInfoKey } from "@/data/pageInfo";

export function AppShell({
  title,
  children,
  showTitle = true,
  showBottomNavigation = true,
  mainClassName = "",
  infoPage,
}: {
  title: string;
  children: ReactNode;
  showTitle?: boolean;
  showBottomNavigation?: boolean;
  mainClassName?: string;
  infoPage?: PageInfoKey;
}) {
  return (
    <AuthGuard>
    <div className="alfredPage min-h-dvh w-full min-w-0 overflow-x-clip">
      <MobileHeader title={title} infoPage={infoPage} />
      <main className={`mx-auto grid w-full min-w-0 max-w-[1420px] gap-7 overflow-x-clip px-5 pb-[calc(112px+env(safe-area-inset-bottom))] pt-7 sm:px-6 lg:ml-0 lg:gap-8 lg:px-12 lg:pb-14 lg:pl-[150px] lg:pt-10 xl:mx-auto xl:pl-[150px] ${mainClassName}`}>
        {showTitle ? (
          <div className="hidden min-w-0 items-start gap-2.5 sm:gap-4 lg:flex">
            <h1 className="display-title metallicPageTitle min-w-0 flex-1 break-words text-[clamp(2.55rem,12vw,3.25rem)] leading-[0.88] text-[var(--text-primary)] [overflow-wrap:anywhere] sm:text-7xl lg:text-[5.35rem]">{title}</h1>
            {infoPage ? <PageInfoButton page={infoPage} className="mt-1" /> : null}
          </div>
        ) : null}
        {children}
      </main>
      <BottomNavigation showBottomBar={showBottomNavigation} />
      <FirstAccessTour />
    </div>
    </AuthGuard>
  );
}
