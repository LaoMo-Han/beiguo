import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/community/new", "/search"]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl
  };
}
