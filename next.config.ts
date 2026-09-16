import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in `out/` so the site can be hosted on any HTTPS CDN
  // (Cloudflare Pages, Netlify, GitHub Pages, Vercel Hobby) without a Node server.
  output: "export",
  // next/image optimization needs a server. Unoptimize so export works even if
  // someone adds <Image> later. This app currently uses no next/image.
  images: { unoptimized: true },
  // Directory index files (`about/index.html`) work on GitHub Pages and most CDNs.
  trailingSlash: true,
  // next.config `headers()` is ignored with `output: "export"`. Security headers
  // live in vercel.json, public/_headers (Cloudflare Pages), and netlify.toml.
};

export default nextConfig;
