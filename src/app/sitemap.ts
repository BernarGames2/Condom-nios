import type { MetadataRoute } from "next";
import { sitePublico } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${sitePublico.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${sitePublico.url}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
