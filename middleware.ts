import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Canonical public host. Never redirect this (or localhost) to itself. */
const CANONICAL_HOST = "agent-id-x.demooie.com";
/** This Worker’s workers.dev hostname (account subdomain `testopen`). */
const WORKERS_DEV_HOST = "agent-id-x.testopen.workers.dev";
/** wrangler.jsonc `name` — only this Worker’s `*.workers.dev`, not other apps. */
const WORKER_NAME = "agent-id-x";

function hostnameFromHostHeader(hostHeader: string | null): string {
  if (!hostHeader) return "";
  return hostHeader.split(":")[0]?.toLowerCase() ?? "";
}

/**
 * Match `agent-id-x.testopen.workers.dev` and this Worker’s
 * `{name}.{account}.workers.dev` only. Localhost, 127.0.0.1, demooie.com,
 * and other `*.workers.dev` hosts are left untouched.
 */
function isThisWorkersDevHost(hostname: string): boolean {
  if (!hostname || hostname === CANONICAL_HOST) return false;
  if (hostname === WORKERS_DEV_HOST) return true;
  const labels = hostname.split(".");
  return (
    labels.length === 4 &&
    labels[0] === WORKER_NAME &&
    labels[2] === "workers" &&
    labels[3] === "dev"
  );
}

export function middleware(request: NextRequest) {
  const hostname = hostnameFromHostHeader(request.headers.get("host"));
  if (!isThisWorkersDevHost(hostname)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";
  destination.hostname = CANONICAL_HOST;
  destination.port = "";
  return NextResponse.redirect(destination, 308);
}
