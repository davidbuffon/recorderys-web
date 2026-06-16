import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RECORDERYS",
    short_name: "RECORDERYS",
    description:
      "Guarda tus compras importantes y controla devoluciones y garantías.",
    start_url: "/login",
    display: "standalone",
    background_color: "#F8FBFC",
    theme_color: "#0A7394",
    icons: [
      {
        src: "/brand-icons/android.png",
        sizes: "196x196",
        type: "image/png",
      },
      {
        src: "/brand-icons/iphone.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
