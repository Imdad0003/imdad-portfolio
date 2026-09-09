import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imdad Digital Studio",
    short_name: "Imdad",
    description:
      "Imdad builds and grows e-commerce businesses — from marketplace listings and product creatives to websites, content and digital marketing.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F4E9",
    theme_color: "#F8F4E9",
    icons: [
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/imdad-logo.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
