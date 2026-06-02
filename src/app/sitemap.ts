import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cammictest.com";
  
  const routes = [
    "",
    "/webcam-test",
    "/microphone-test",
    "/speaker-test",
    "/speed-test",
    "/device-check",
    "/faq",
    "/blog",
    "/blog/why-is-my-webcam-black",
    "/blog/how-to-enable-camera-mic",
    "/privacy",
    "/terms",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route.includes("blog") ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.includes("test") || route.includes("check") ? 0.9 : 0.7,
  }));
}
