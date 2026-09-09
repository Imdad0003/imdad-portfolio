import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imdad Digital Studio",
    short_name: "Imdad",
    description:
      "Imdad Digital Studio helps businesses build and grow online with e-commerce solutions, marketplace listings, product creatives, websites, social media, AI services and more.",
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
