import { canonicalUrl } from "@/lib/seo";

/** 1-based hop in a share URL, plus the line we put on the clipboard. */
export type ShareHop = {
  number: number;
  now?: string;
  caption?: string;
};

export type ShareTarget = {
  path: string;
  title: string;
};

export function hopCaption(hop?: ShareHop | null): string {
  if (!hop) return "";
  return (hop.now ?? hop.caption ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Parse `hop` from the query string. Returns a 0-based index, or null when
 * missing/invalid so the player can ignore it.
 */
export function parseHopParam(
  raw: string | null | undefined,
  stepCount: number,
): number | null {
  if (raw == null || stepCount < 1) return null;
  const trimmed = raw.trim();
  if (!/^[1-9]\d{0,3}$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 1 || n > stepCount) return null;
  return n - 1;
}

/** Canonical page URL, plus `?hop=N` (1-based) when sharing a sequence step. */
export function shareUrl(path: string, hopNumber?: number): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  const base = canonicalUrl(trimmed);
  if (hopNumber == null || hopNumber < 1 || !Number.isFinite(hopNumber)) {
    return base;
  }
  const n = Math.floor(hopNumber);
  if (n < 1) return base;
  return `${base}?hop=${n}`;
}

export function shareClipboardText({
  title,
  url,
  hopNumber,
  line,
}: {
  title: string;
  url: string;
  hopNumber?: number;
  line?: string;
}): string {
  const parts: string[] = [];
  const head = title.replace(/\s+/g, " ").trim();
  if (head) parts.push(head);
  const body = (line ?? "").replace(/\s+/g, " ").trim();
  if (hopNumber != null && hopNumber >= 1) {
    parts.push(body ? `Hop ${hopNumber}: ${body}` : `Hop ${hopNumber}`);
  } else if (body) {
    parts.push(body);
  }
  const href = url.trim();
  if (href) parts.push(href);
  return parts.join("\n");
}

export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function xIntentUrl(title: string, url: string): string {
  const text = [title.replace(/\s+/g, " ").trim(), url.trim()]
    .filter(Boolean)
    .join(" ");
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/** Update `hop` in the address bar without adding history (player jumps). */
export function replaceHopQuery(hopNumber: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(hopNumber) || hopNumber < 1) return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("hop", String(Math.floor(hopNumber)));
    const next = `${url.pathname}${url.search}${url.hash}`;
    const prev = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== prev) {
      window.history.replaceState(window.history.state, "", next);
    }
  } catch {
    // Malformed location — sharing still uses the constructed canonical URL.
  }
}
