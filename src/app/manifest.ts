import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Winperium",
    short_name: "Winperium",
    description: "Organize sua rotina, estruture hábitos e transforme metas em progresso.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0e",
    theme_color: "#111114",
    icons: [
      {
        src: "/icons/winperium-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/winperium-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/winperium-maskable-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/winperium-maskable-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
