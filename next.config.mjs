/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Unsplash stock is resized by Unsplash's CDN; local files by Next.js.
    loader: "custom",
    loaderFile: "./lib/imageLoader.js",
    remotePatterns: [new URL("https://images.unsplash.com/**")],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75],
    deviceSizes: [420, 640, 828, 1080, 1440, 1920],
  },
  async redirects() {
    // The original starter exposed the landing page at /home as well as /.
    // Keep that URL working without duplicate content.
    return [{ source: "/home", destination: "/", permanent: true }];
  },
};

export default nextConfig;
