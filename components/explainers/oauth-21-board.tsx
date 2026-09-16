"use client";

import { useState } from "react";
import Link from "next/link";
import { InOneBoard, Pass } from "@/components/explainers/shared";
import { Button } from "@/components/ui/button";
import {
  boardChoiceClass,
  boardFocusClass,
  oauthBanMeta,
} from "@/lib/identity-visuals";
import { cn } from "@/lib/utils";

const banned = [
  {
    id: "implicit",
    title: "Implicit grant",
    was: "response_type=token put the access token in the URL fragment. The front channel was the mint.",
    now: "Omitted, following RFC 9700. Do not issue access tokens in the front channel.",
    metaphor:
      "A pass taped to the address bar is a photocopy the whole café can see — logs, Referer, shoulder surfers.",
  },
  {
    id: "password",
    title: "Resource owner password",
    was: "The client collected the user's password and posted it to the authorization server.",
    now: "Omitted. The client must not collect passwords.",
    metaphor:
      "Handing the agent the user's house keys and hoping the prompt forgets them.",
  },
  {
    id: "url",
    title: "Tokens in the URL",
    was: "RFC 6750 allowed access_token in the query string.",
    now: "Omitted. Tokens stay in the Authorization header.",
    metaphor:
      "A pass printed on the ticket stub that proxies, access logs, and browser history all photocopy.",
  },
] as const;

export function Oauth21Board() {
  const [index, setIndex] = useState(0);
  const item = banned[index];

  return (
    <InOneBoard
      kicker="In one board · OAuth 2.1 vs 2.0"
      title="What got banned"
      footnote={
        <>
          OAuth 2.1 is still a working-group draft as of September 2026 (
          <span className="font-mono text-xs">draft-ietf-oauth-v2-1-16</span>
          ) — not an RFC. It is 2.0 with the unsafe bits removed, not a new
          protocol.{" "}
          <Link
            href="/compare/oauth-2-0-vs-2-1"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Side-by-side
          </Link>
          .
        </>
      }
    >
      <div
        role="tablist"
        aria-label="What OAuth 2.1 banned"
        className="flex flex-wrap gap-1.5"
      >
        {banned.map((entry, i) => {
          const Icon = oauthBanMeta[entry.id].icon;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors",
                boardFocusClass,
                boardChoiceClass(i === index),
              )}
              onClick={() => setIndex(i)}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {String(i + 1).padStart(2, "0")} · {entry.title}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-dashed border-border/80 bg-background/40 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            2.0 allowed
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.was}
          </p>
          <div className="mt-3">
            <Pass label="Bearer in the wild" variant="bearer" />
          </div>
        </article>
        <article className="rounded-lg border border-moss/35 bg-moss/10 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-moss">
            2.1 omits
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.now}
          </p>
          <div className="mt-3">
            <Pass label="Authorization header" variant="plain" />
          </div>
        </article>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground/90">
        {item.metaphor}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === banned.length - 1}
          onClick={() =>
            setIndex((value) => Math.min(banned.length - 1, value + 1))
          }
        >
          Next banned bit
        </Button>
      </div>

      <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <li className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">
          Authorization code + PKCE (S256) is the interactive default. Plain
          PKCE is gone.
        </li>
        <li className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">
          Redirect URIs match as exact strings. Bearer is still a photocopy
          unless you add DPoP or mTLS.
        </li>
      </ul>
    </InOneBoard>
  );
}
