import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — a gentle companion`,
    short_name: APP_NAME,
    description: "A soft daily companion. Everything stays on this phone.",
    start_url: "/today",
    display: "standalone",
    background_color: "#FDF8FF",
    theme_color: "#FDF8FF",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
