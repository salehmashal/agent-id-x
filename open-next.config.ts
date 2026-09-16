import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// SSG/static site: cache prerendered pages from worker assets.
// No R2/KV bucket required (those would need extra Cloudflare resources).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
