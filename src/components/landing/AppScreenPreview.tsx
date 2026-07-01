import Image from "next/image";

const appScreens: Record<string, { src: string; width: number; height: number }> = {
  "/routine": {
    src: "/images/app-screens/WhatsApp Image 2026-06-30 at 23.07.10.jpeg",
    width: 1080,
    height: 2263,
  },
  "/goals": {
    src: "/images/app-screens/WhatsApp Image 2026-06-30 at 23.07.11(1).jpeg",
    width: 1080,
    height: 2254,
  },
  "/feedback": {
    src: "/images/app-screens/WhatsApp Image 2026-06-30 at 23.07.11(2).jpeg",
    width: 1080,
    height: 2259,
  },
  "/assistant": {
    src: "/images/app-screens/WhatsApp Image 2026-06-30 at 23.07.11(3).jpeg",
    width: 1080,
    height: 2100,
  },
  "/habits": {
    src: "/images/app-screens/WhatsApp Image 2026-06-30 at 23.07.11.jpeg",
    width: 1080,
    height: 2261,
  },
};

export function AppScreenPreview({
  route,
  title,
}: {
  route: string;
  title: string;
}) {
  const screen = appScreens[route];

  if (!screen) return null;

  return (
    <figure
      className="appScreenPreview appScreenPreview--screenshot"
      style={{ aspectRatio: `${screen.width} / ${screen.height}` }}
    >
      <Image
        src={screen.src}
        alt={title}
        width={screen.width}
        height={screen.height}
        sizes="(max-width: 767px) calc(100vw - 2rem), 31rem"
        className="appScreenScreenshot"
      />
      <span className="appScreenScreenshotReflection" aria-hidden="true" />
    </figure>
  );
}
