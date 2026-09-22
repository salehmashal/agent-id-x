"use client";

import { Link2, Share } from "lucide-react";
import { boardFocusClass } from "@/lib/identity-visuals";
import { Linkedin } from "@/lib/socials";
import type { ShareHop } from "@/lib/share";
import { cn } from "@/lib/utils";
import { useShare } from "@/components/use-share";

function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M14.23 10.36 22.4 1h-1.94L13.37 9.07 7.9 1H1.5l8.57 12.47L1.5 23h1.94l7.48-8.7L16.1 23h6.4L14.23 10.36ZM12.1 12.96l-.87-1.24L4.07 2.5h2.97l5.58 7.98.87 1.24 7.26 10.38h-2.97L12.1 12.96Z" />
    </svg>
  );
}

const actionClass = cn(
  "inline-flex min-h-8 shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground transition-colors select-none",
  "hover:bg-muted hover:text-foreground",
  boardFocusClass,
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const intentClass = cn(
  "inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors",
  "hover:bg-muted hover:text-foreground",
  boardFocusClass,
);

export function ShareBar({
  path,
  title,
  hop = null,
}: {
  path: string;
  title: string;
  hop?: ShareHop | null;
}) {
  const share = useShare({ path, title, hop });
  const copyLabel = hop?.number
    ? "Copy link to this sequence step"
    : "Copy link to this page";

  if (share.empty) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label={share.label}
    >
      <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
        Share
      </span>
      <button
        type="button"
        className={actionClass}
        aria-label={share.copied ? "Link copied" : copyLabel}
        onClick={() => {
          void share.copyLink();
        }}
      >
        <Link2 className="size-3.5" aria-hidden />
        {share.copied ? "Copied" : "Copy link"}
      </button>
      {share.canNativeShare ? (
        <button
          type="button"
          className={actionClass}
          aria-label={share.label}
          onClick={() => {
            void share.nativeShare();
          }}
        >
          <Share className="size-3.5" aria-hidden />
          Share
        </button>
      ) : null}
      {share.linkedInHref ? (
        <a
          href={share.linkedInHref}
          target="_blank"
          rel="noopener noreferrer"
          className={intentClass}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="size-3.5" aria-hidden />
          LinkedIn
        </a>
      ) : null}
      {share.xHref ? (
        <a
          href={share.xHref}
          target="_blank"
          rel="noopener noreferrer"
          className={intentClass}
          aria-label="Share on X"
        >
          <XMark className="size-3.5" />
          X
        </a>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {share.copied ? "Copied" : ""}
      </span>
    </div>
  );
}
