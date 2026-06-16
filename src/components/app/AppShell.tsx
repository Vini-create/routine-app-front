import type { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="alfredPage min-h-dvh">
      <MobileHeader />
      <main className="mx-auto grid max-w-3xl gap-5 px-5 pb-28 pt-5">
        <h1 className="font-brand text-4xl font-semibold leading-tight tracking-normal text-[#C78A52] sm:text-5xl">
          {title}
        </h1>
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
