/** @type {import('next').NextConfig} */
const nextConfig = {
  // Support static export only when explicitly requested via env variable,
  // enabling full Next.js ISR (Incremental Static Regeneration) and Route Handlers for production server.
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" } : {}),
  // /screens/ → /screens/index.html — works on every static host without rewrites
  trailingSlash: true,
  images: {
    // Unsplash stock is resized by Unsplash's CDN; local files are served
    // as-is by the custom loader (no image server needed, so it exports).
    loader: "custom",
    loaderFile: "./lib/imageLoader.js",
    remotePatterns: [new URL("https://images.unsplash.com/**")],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75],
    deviceSizes: [420, 640, 828, 1080, 1440, 1920],
  },
  // Note: `redirects()` is not available in static export. The /home → /
  // redirect lives in public/_redirects (Netlify) and app/home/page.jsx.
};

export default nextConfig;
