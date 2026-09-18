import { spawnSync } from "node:child_process";

function envFlag(name) {
  const value = process.env[name];
  if (value == null || value === "") return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "0" && normalized !== "false" && normalized !== "no";
}

/**
 * Cloudflare Workers Builds runs `npm run build` then `npx wrangler deploy`.
 * Wrangler is pointed at `.open-next/worker.js`, so CI must run OpenNext —
 * a plain `next build` (even without `output: "export"`) is not enough.
 */
const useOpenNext =
  envFlag("WORKERS_CI") ||
  envFlag("CLOUDFLARE") ||
  envFlag("OPEN_NEXT") ||
  envFlag("OPENNEXT");

const command = useOpenNext ? "opennextjs-cloudflare" : "next";
const result = spawnSync(command, ["build"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
