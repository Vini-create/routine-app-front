import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  iconClassName,
  showWordmark = true,
  logoSrc,
}: {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  logoSrc?: string;
}) {
  const resolvedLogoSrc = logoSrc ?? "/winperium-logo.svg";

  return (
    <div className={cn("inline-flex items-center gap-3 alfredLogoSlot", className)} data-logo-slot="winperium-brand">
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center overflow-hidden",
          iconClassName,
        )}
        aria-hidden="true"
        data-logo-slot="winperium-symbol"
      >
        <Image
          src={resolvedLogoSrc}
          alt=""
          fill
          unoptimized
          className="winperiumLogoImage object-contain"
          sizes="56px"
        />
      </span>
      {showWordmark ? (
        <span className="font-wordmark translate-y-1 text-[2rem] font-normal leading-none tracking-normal text-[var(--text-primary)] sm:text-[2.35rem]">
          Winperium
        </span>
      ) : null}
    </div>
  );
}
