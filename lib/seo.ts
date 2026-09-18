import type { Metadata } from "next";
import type { Spec } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

/** Live Worker URL. OpenNext production has no trailing slash. */
export const DEFAULT_SITE_URL = "https://agent-id-x.testopen.workers.dev";
export const SITE_NAME = "Agent Identity Landscape";
export const SITE_SOURCE = "https://github.com/salehmashal/agent-id-x";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/** Path without a trailing slash (`/` stays `/` for composition, then home canonical drops it). */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/\/+$/, "");
}

export function canonicalUrl(path: string): string {
  const p = canonicalPath(path);
  if (p === "/") return getSiteUrl();
  return `${getSiteUrl()}${p}`;
}

export const HOME_TITLE =
  "AI agent identity, authentication, and authorization — AAuth, OAuth 2.1, OIDC";
