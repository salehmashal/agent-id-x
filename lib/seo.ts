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

export const HOME_DESCRIPTION =
  "A field guide to AI agent identity, authentication, and authorization: AAuth, OAuth 2.1, OpenID Connect, WIMSE, MCP, and A2A. Nested specs, four principals, and the four doors people call p2p.";

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Agent Identity Landscape — AI agent identity, authentication, and authorization",
} as const;

export function metaDescription(text: string, max = 160): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  const sliced = compact.slice(0, max - 1);
  const breakAt = sliced.lastIndexOf(" ");
  const cut = sliced.slice(0, breakAt > 80 ? breakAt : max - 1);
  return `${cut.replace(/[.,;—–-]+$/, "")}…`;
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = canonicalUrl(path);
  const desc = metaDescription(description);
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description: desc,
      images: [OG_IMAGE],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const ROUTE_META = {
  home: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
  },
  catalog: {
    title: "Specification catalog for AI agent identity and authorization",
    description:
      "Filter IETF, OIDF, W3C, and related documents for AI agent identity, authentication, and authorization — RFCs, Working Group drafts, individual drafts, and protocols.",
    path: "/catalog",
  },
  patterns: {
    title: "Deployment patterns for AI agent identity — MCP hosts, sidecars, AAuth p2p",
    description:
      "How an AI agent is deployed — browser, MCP host, mesh sidecar, AAuth p2p — and which identity and authorization protocols actually apply.",
    path: "/patterns",
  },
  flows: {
    title: "Protocol flows for AI agent authentication and authorization",
    description:
      "Hop-by-hop sequences for user-delegated OAuth, AAuth p2p, MCP HTTP, A2A, on-behalf-of token exchange, and CIBA human-in-the-loop.",
    path: "/flows",
  },
  compare: {
    title: "Compare OAuth 2.1, OIDC, AAuth, and p2p agent access",
    description:
      "Side-by-side: OAuth 2.0 vs 2.1, OpenID Connect vs OAuth, AAuth vs vanilla OAuth, and user-delegated vs p2p agent access.",
    path: "/compare",
  },
  glossary: {
    title: "Glossary of AI agent identity terms — p2p, AAuth, act, MCP",
    description:
      "Overloaded words in agent identity: p2p, act, person server, bearer, MCP host, sidecar — each linked to the spec or flow that defines it.",
    path: "/glossary",
  },
  search: {
    title: "Search AI agent identity specs, patterns, and glossary",
    description:
      "Client-side search over the bundled catalog of agent identity specifications, deployment patterns, flows, and glossary terms. Nothing leaves the page.",
    path: "/search",
  },
} as const;

/** Short tails so spec <title> tags are unique and match how people search. */
const SPEC_TITLE_TAIL: Record<string, string> = {
  aauth: "agent identity and HTTP signatures",
  "http-signature-keys": "Signature-Key for AAuth and RFC 9421",
  "aauth-r3": "rich authorization requests for agents",
  "oauth-2-0": "the authorization framework agents still run on",
  "oauth-bearer": "Bearer tokens and why agents leak them",
  "oauth-2-1": "authorization code, PKCE, and agent clients",
  pkce: "proof key for OAuth public clients",
  jwt: "JSON Web Token claims agents must validate",
  "oauth-security-bcp": "RFC 9700 security practices for OAuth",
  "native-apps": "OAuth for native and CLI agent hosts",
  "browser-apps": "OAuth for browser-based agent hosts",
  "jwt-client-auth": "private_key_jwt client authentication",
  "oidc-core": "user identity for delegated agents",
  "oidc-discovery": "OpenID Provider metadata discovery",
  ciba: "backchannel user approval for unattended agents",
  "openid-federation": "federated OpenID provider and client trust",
  "fapi-2": "high-security OAuth profile for high-risk tools",
  "mcp-auth": "OAuth 2.1 for Model Context Protocol",
  a2a: "agent-to-agent tasks, not AAuth p2p",
  dpop: "sender-constrained OAuth access tokens",
  "token-exchange": "on-behalf-of act claims and chaining",
  "wimse-arch": "workload identity for services and agents",
  par: "pushed authorization requests",
  aims: "IETF map of identity building blocks for AI agents",
  spiffe: "workload identity, not the user",
  "did-peer": "pairwise DIDs, not AAuth p2p HTTP",
};

export function specPageTitle(spec: Spec): string {
  const tail = SPEC_TITLE_TAIL[spec.slug];
  const head = `${spec.officialName} (${spec.id})`;
  return tail ? `${head} — ${tail}` : head;
}

export function specPageDescription(spec: Spec): string {
  return metaDescription(spec.whyAgentCares);
}

export function specLede(spec: Spec): string {
  const status = STATUS_LABEL[spec.status];
  const dated = spec.date ? `, ${spec.date}` : "";
  return `${spec.officialName} (${spec.id}) is ${status}${dated}. ${spec.whyAgentCares}`;
}

export function patternPageTitle(title: string): string {
  return `${title} — AI agent identity deployment pattern`;
}

export function flowPageTitle(title: string, protocol?: string): string {
  const kind = protocol ? `${protocol} agent identity flow` : "agent identity flow";
  return `${title} — ${kind}`;
}

export function comparePageTitle(title: string): string {
  return `${title} — compared for agent identity`;
}

export type FaqItem = { question: string; answer: string };

export const HOME_FAQ: FaqItem[] = [
  {
    question: "What is AAuth?",
    answer:
      "AAuth is the AAuth Protocol, published as the individual Internet-Draft draft-hardt-oauth-aauth-protocol-10 (Dick Hardt, 6 August 2026). It defines cryptographic agent identity and agent-to-resource authorization using HTTP Message Signatures. It is not an RFC and not an OAuth Working Group document. Pin a snapshot before you implement.",
  },
  {
    question: "What is the difference between p2p and A2A?",
    answer:
      "They are different doors. Next to AAuth, p2p usually means identity-based or two-party HTTP access: the agent and the resource, with no authorization server. A2A (Agent2Agent) is a Linux Foundation protocol for agent-to-agent tasks, using Agent Cards. did:peer and DIDComm are a third sense of p2p. This site treats those three as distinct.",
  },
  {
    question: "What is the difference between OAuth 2.1 and OAuth 2.0?",
    answer:
      "OAuth 2.1 is not a new protocol. It is OAuth 2.0 with the unsafe bits removed and current practice folded in: authorization code plus PKCE, no implicit grant, no password grant, no access tokens in URLs, exact redirect matching. As of September 2026 it was still a Working Group draft (draft-ietf-oauth-v2-1-16), not an RFC.",
  },
  {
    question: "What are the four principals in agent identity?",
    answer:
      "User (which human this is for), agent instance (which running agent is calling), workload (which binary in which trust domain), and resource (which API). Each principal has a different proof. Putting the user into a SPIFFE ID, or treating an ID Token as an access token, collapses the map.",
  },
  {
    question: "Is AAuth an RFC?",
    answer:
      "No. It is an individual Internet-Draft: not endorsed by the IETF, no RFC number. Draft-10 describes four resource access modes; the editor’s copy has been known to add a fifth. Read the datatracker HTML for the snapshot you pin.",
  },
  {
    question: "Does OpenID Connect replace OAuth for AI agents?",
    answer:
      "No. OIDC is the user-identity layer on OAuth. OAuth 2.1 still does not tell a resource who the human is. User-delegated agents still use OIDC so the authorization server knows which person consented; the access token is what the API sees.",
  },
];

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SITE_NAME,
        url,
        description: HOME_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE_NAME,
        url,
        sameAs: [SITE_SOURCE],
      },
    ],
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export const SITEMAP_LASTMOD = "2026-09-18";

export const INDEX_PATHS = [
  "/",
  "/catalog",
  "/patterns",
  "/compare",
  "/flows",
  "/glossary",
  "/search",
] as const;
