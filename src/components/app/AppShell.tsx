import type { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f7f4ee] text-zinc-950 dark:bg-[#080807] dark:text-zinc-50">
      <MobileHeader title={title} />
      <main className="mx-auto grid max-w-3xl gap-5 px-5 pb-28 pt-5">{children}</main>
      <BottomNavigation />
    </div>
  );
}
