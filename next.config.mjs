/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes a plain HTML/CSS/JS site to /out
  // (deploy that folder to Netlify or any static host).
  output: "export",
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
