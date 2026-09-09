import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.siteUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
