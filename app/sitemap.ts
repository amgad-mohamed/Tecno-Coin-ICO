import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default function sitemap(): MetadataRoute.Sitemap {
  const host = headers().get("host") || "localhost:3000";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  const base = `${protocol}://${host}`;

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/transactions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}