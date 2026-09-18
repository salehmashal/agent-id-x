import { spawnSync } from "node:child_process";

function envFlag(name) {
  const value = process.env[name];
  if (value == null || value === "") return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "0" && normalized !== "false" && normalized !== "no";
}

/**
 * Cloudflare Workers Builds runs `npm run build` then `npx wrangler deploy`.
 * Wrangler is pointed at `.open-next/worker.js`, so the first CI invocation
 * must run OpenNext.
 *
 * OpenNext then calls `npm run build` again with NEXT_PRIVATE_STANDALONE=true
 * to compile the Next app. That inner call must be plain `next build` or we
 * recurse forever.
 */
const innerNextBuild =
  process.env.NEXT_PRIVATE_STANDALONE === "true" ||
  process.env.NEXT_PRIVATE_STANDALONE === "1" ||
  envFlag("OPEN_NEXT_INNER");

const useOpenNext =
  !innerNextBuild &&
  (envFlag("WORKERS_CI") ||
    envFlag("CLOUDFLARE") ||
    envFlag("OPEN_NEXT") ||
    envFlag("OPENNEXT"));

const command = useOpenNext ? "opennextjs-cloudflare" : "next";
const env = { ...process.env };
 if (useOpenNext) {
  env.OPEN_NEXT_INNER = "1";
}

const result = spawnSync(command, ["build"], {
  stdio: "inherit",
  env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
