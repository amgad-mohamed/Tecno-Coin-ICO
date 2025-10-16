import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default function robots(): MetadataRoute.Robots {
  const host = headers().get("host") || "localhost:3000";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  const base = `${protocol}://${host}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host,
  };
}