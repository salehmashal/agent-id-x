import type { NextConfig } from "next";

function envFlag(name: string): boolean {
  const value = process.env[name];
  if (value == null || value === "") return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "0" && normalized !== "false" && normalized !== "no";
}

/**
 * Static HTML export (`out/`) is the default for Vercel, Netlify, and
 * drag-and-drop hosts. OpenNext on Cloudflare Workers cannot consume
 * `output: "export"` — it needs a normal Next.js build (standalone).
 *
 * Opt out of export when:
 * - `STATIC_EXPORT=0` (explicit)
 * - `OPEN_NEXT` / `CLOUDFLARE` is set
 * - Cloudflare Workers Builds (`WORKERS_CI=1`) — dashboard runs `npm run build`
 * - OpenNext invoked `next build` (`NEXT_PRIVATE_STANDALONE=true`)
 * - the npm script is `opennextjs-cloudflare` / `cf:build`
 */
function isOpenNextBuild(): boolean {
  if (process.env.STATIC_EXPORT === "0" || process.env.STATIC_EXPORT === "false") {
    return true;
  }
  if (
    envFlag("OPEN_NEXT") ||
    envFlag("OPENNEXT") ||
    envFlag("CLOUDFLARE") ||
    envFlag("WORKERS_CI")
  ) {
    return true;
  }
  if (
    process.env.NEXT_PRIVATE_STANDALONE === "true" ||
    process.env.NEXT_PRIVATE_STANDALONE === "1"
  ) {
    return true;
  }
  const argv = process.argv.join(" ");
  const npmScript = process.env.npm_lifecycle_script ?? "";
  const npmEvent = process.env.npm_lifecycle_event ?? "";
  if (
    argv.includes("opennextjs-cloudflare") ||
    npmScript.includes("opennextjs-cloudflare") ||
    npmEvent === "cf:build" ||
    npmEvent === "preview"
  ) {
    return true;
  }
  return false;
}

const useStaticExport = !isOpenNextBuild();
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(useStaticExport ? { output: "export" as const } : {}),
  // next/image optimization needs a server. Unoptimize so both static
  // export and OpenNext work even if someone adds <Image> later.
  images: { unoptimized: true },
  // Directory index files (`about/index.html`) work on GitHub Pages and most CDNs.
  // Only enable the slash at production export time. In `next dev`,
  // `trailingSlash: true` 308s `/_next/hmr` → `/_next/hmr/`, the WebSocket
  // handshake fails, Turbopack never hydrates, and clicks hit static HTML.
  trailingSlash: useStaticExport && isProd,
  skipTrailingSlashRedirect: !isProd,
  // `next dev --hostname 0.0.0.0` treats 127.0.0.1 as cross-origin, which
  // blocks `/_next/hmr` and leaves pages as static HTML with no handlers.
  allowedDevOrigins: ["127.0.0.1"],
  // Canonical URLs in lib/seo.ts match OpenNext / wrangler (no trailing slash),
  // even when static export sets trailingSlash in production.
  // next.config `headers()` is ignored with `output: "export"`. Security headers
  // live in vercel.json, public/_headers (Cloudflare Pages), and netlify.toml.
};

export default nextConfig;
