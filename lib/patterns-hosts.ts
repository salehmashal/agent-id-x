import type {
  DeploymentPattern,
} from "@/lib/types";

const hostRuntime: DeploymentPattern = {
  slug: "host-runtime",
  title: "Browser, native, and server-side agent hosts",
  matrixTitle: "Host runtime",
  summary:
    "Where the OAuth client actually runs changes token storage and client type. RFC 10017 for browser-based hosts, RFC 8252 for native apps, confidential client + DPoP or mTLS for server-side runtimes. Same grant, different failure modes.",
  inTheWild:
    "A chat SPA that holds the agent's tokens in the page. A desktop companion (Claude Desktop, a CLI with a loopback redirect). A backend worker that is the confidential client and never shows tokens to the model or the browser. This row is orthogonal to the others: an interactive delegated agent is also one of these three hosts.",
  actors: [
    {
      name: "Human",
      principal: "user",
      trust: "Still authenticates at the AS. The host type decides which user-agent and where tokens land afterwards.",
    },
    {
      name: "Agent host (the OAuth client)",
      principal: "agent-instance",
      trust: "Public client in a browser or many native apps; confidential client on a server. Must not leak tokens into model context, logs, or XSS-reachable storage.",
    },
    {
      name: "Authorization server",
      principal: "other",
      trust: "Enforces PKCE, exact redirect URIs, and (for confidential clients) client authentication.",
    },
  ],
  whyThese:
    "OAuth 2.1 does not change the fact that browsers cannot hide secrets, native apps must not embed a webview, and servers can keep a key. RFC 10017 is the browser BCP: prefer a Backend-for-Frontend with HTTP-only cookies; if tokens must live in the page, keep them in memory, never localStorage. RFC 8252 is the native BCP: system browser, PKCE, claimed HTTPS or loopback redirects. Server-side agents are confidential clients and should sender-constrain with DPoP or mTLS so a leaked access token is not replayable from a laptop. Token storage is the incident: XSS in the chat page, an embedded webview, a refresh token in localStorage, or a token concatenated into a prompt.",
  userPresent: "yes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Three places the same OAuth client can live. Pick one; do not mix their token-storage rules.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "browser", label: "Browser host", kind: "agent" },
      { id: "native", label: "Native host", kind: "agent" },
      { id: "server", label: "Server runtime", kind: "workload" },
      { id: "as", label: "Authorization server", kind: "as" },
    ],
    edges: [
      { from: "user", to: "browser", label: "SPA / chat UI (RFC 10017)" },
      { from: "user", to: "native", label: "System browser (RFC 8252)" },
      { from: "user", to: "server", label: "Optional; server holds the client key" },
      { from: "browser", to: "as", label: "Auth code + PKCE; prefer BFF cookies" },
      { from: "native", to: "as", label: "Auth code + PKCE; claimed HTTPS or loopback" },
      { from: "server", to: "as", label: "Confidential client + DPoP or mTLS" },
    ],
  },
  hostVariants: [
    {
      slug: "browser",
      title: "Browser-based agent host",
      situation:
        "The product UI is the OAuth client: a chat SPA, an embedded assistant, anything whose JavaScript could see a token.",
      topology: {
        caption: "RFC 10017: PKCE always. Tokens belong in a BFF cookie or in memory — not in localStorage.",
        nodes: [
          { id: "user", label: "User", kind: "user" },
          { id: "spa", label: "Browser agent host", kind: "agent" },
          { id: "bff", label: "Optional BFF", kind: "workload" },
          { id: "as", label: "AS", kind: "as" },
          { id: "api", label: "API", kind: "resource" },
        ],
        edges: [
          { from: "user", to: "spa", label: "Uses the chat UI" },
          { from: "spa", to: "bff", label: "Prefer the BFF as the confidential client" },
          { from: "bff", to: "as", label: "Auth code + PKCE" },
          { from: "bff", to: "api", label: "Server-side call; HTTP-only session cookie to the page" },
        ],
      },
      primarySlugs: ["browser-apps", "pkce", "oauth-2-1"],
      pitfalls:
        "XSS on the chat page is token theft. localStorage and sessionStorage survive XSS. Do not put access tokens in the DOM, in analytics, or in model prompts. Implicit flow is gone.",
    },
    {
      slug: "native",
      title: "Native app host",
      situation:
        "Desktop or mobile companion: Claude Desktop, a CLI, an IDE plugin that opens a browser for login.",
      topology: {
        caption: "RFC 8252: system browser, PKCE, claimed HTTPS or loopback. No embedded webview.",
        nodes: [
          { id: "user", label: "User", kind: "user" },
          { id: "app", label: "Native agent host", kind: "agent" },
          { id: "browser", label: "System browser", kind: "other" },
          { id: "as", label: "AS", kind: "as" },
        ],
        edges: [
          { from: "app", to: "browser", label: "Open authorize URL" },
          { from: "user", to: "browser", label: "Authenticate and consent" },
          { from: "browser", to: "app", label: "Authorization code on claimed HTTPS or loopback" },
          { from: "app", to: "as", label: "Code + PKCE exchange" },
        ],
      },
      primarySlugs: ["native-apps", "pkce", "oauth-2-1"],
      pitfalls:
        "Embedded webviews are in-scope for phishing the password. Custom URI schemes are a last resort if claimed HTTPS is unavailable. OS token stores beat a plaintext file next to the binary.",
    },
    {
      slug: "server",
      title: "Server-side agent runtime",
      situation:
        "The agent is a backend process. It can keep a client key. The browser, if any, never sees access tokens.",
      topology: {
        caption: "Confidential client. Authenticate with a key; sender-constrain the access token.",
        nodes: [
          { id: "user", label: "User (optional UI)", kind: "user" },
          { id: "ui", label: "Front end (no tokens)", kind: "other" },
          { id: "rt", label: "Server-side agent", kind: "workload" },
          { id: "as", label: "AS", kind: "as" },
          { id: "api", label: "API", kind: "resource" },
        ],
        edges: [
          { from: "user", to: "ui", label: "Session cookie only" },
          { from: "rt", to: "as", label: "Client auth (private_key_jwt / mTLS) + user grant or client_credentials" },
          { from: "rt", to: "api", label: "DPoP or mTLS-bound access token" },
        ],
      },
      primarySlugs: ["oauth-2-1", "dpop", "mtls"],
      pitfalls:
        "Tokens in logs, traces, and tool arguments are the usual leak. Do not ship the client secret to the browser 'for convenience.' Do not hand the model the refresh token.",
    },
  ],
  protocols: [
    { slug: "browser-apps", fit: "primary", note: "RFC 10017 — browser-based hosts." },
    { slug: "native-apps", fit: "primary", note: "RFC 8252 — native / CLI hosts." },
    { slug: "oauth-2-1", fit: "primary" },
    { slug: "pkce", fit: "primary" },
    { slug: "dpop", fit: "primary", note: "Server-side (and anywhere you can) sender-constraint." },
    { slug: "mtls", fit: "optional", note: "Confidential clients that already have a cert." },
    { slug: "oauth-security-bcp", fit: "optional", note: "RFC 9700." },
    {
      label: "Tokens in localStorage or the DOM",
      fit: "anti-pattern",
      note: "XSS reads them. RFC 10017 is explicit.",
    },
    {
      label: "Embedded webview for login",
      fit: "anti-pattern",
      note: "RFC 8252: use the system browser.",
    },
    {
      label: "Client secret in browser JavaScript",
      fit: "anti-pattern",
      note: "There is no confidential client in the page.",
    },
  ],
  relatedFlows: ["user-delegated-api", "agent-as-client-mcp"],
  aliases: ["RFC 10017", "RFC 8252", "BFF", "native app", "SPA agent"],
  searchTerms: [
    "browser",
    "native app",
    "server-side",
    "token storage",
    "localStorage",
    "BFF",
    "RFC 10017",
    "RFC 8252",
  ],
};

const unattended: DeploymentPattern = {
  slug: "unattended-batch",
  title: "Unattended batch / service agent",
  matrixTitle: "Unattended batch",
  summary:
    "A cron, a queue worker, a service account with no human on the request. Client credentials and workload identity. Never the password grant. Never a long-lived user refresh token stuffed into the job.",
  inTheWild:
    "Nightly summarization over a corpus the service owns, a pipeline that classifies tickets as itself, a scheduled agent that calls internal APIs with a workload identity. If a human must approve a specific action, that is headless/async (CIBA), not this row.",
  actors: [
    {
      name: "Service agent",
      principal: "workload",
      trust: "Acts as itself. Identified by client_id plus workload identity, not by a user sub.",
    },
    {
      name: "Authorization server (optional)",
      principal: "other",
      trust: "Issues a client-credentials access token audience-restricted to the API.",
    },
    {
      name: "Resource",
      principal: "resource",
      trust: "Authorizes a service account / SPIFFE ID. There is no 'on behalf of Alice' unless you moved to an OBO row.",
    },
  ],
  whyThese:
    "Client credentials (OAuth 2.1) and workload identity (SPIFFE/WIMSE) answer 'which robot is this?' They do not answer 'which human?' — and this row has no human. The password grant is gone (OAuth 2.1 / RFC 9700) and was always the wrong way to let a batch job impersonate someone. A long-lived user refresh token in a cron secret is delegated access with no session, no rotation story, and no way for the user to know the job is still running. If you need a user, use CIBA or an interactive grant at the time of action. AAP and AIMS are draft profiles/BCPs on this shape; treat them as churn.",
  userPresent: "no",
  asInPath: "sometimes",
  workloadIdentity: "yes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "No user. The job authenticates as itself — client credentials and/or a workload SVID — then calls the API.",
    nodes: [
      { id: "cron", label: "Batch / cron agent", kind: "workload" },
      { id: "spire", label: "SPIRE / issuer", kind: "other" },
      { id: "as", label: "AS", kind: "as" },
      { id: "api", label: "API", kind: "resource" },
    ],
    edges: [
      { from: "spire", to: "cron", label: "Workload identity" },
      { from: "cron", to: "as", label: "client_credentials (SPIFFE or mTLS client auth)" },
      { from: "cron", to: "api", label: "Service-account call; aud = this API" },
    ],
  },
  protocols: [
    { slug: "oauth-2-1", fit: "primary", note: "Client credentials grant." },
    { slug: "spiffe", fit: "primary" },
    { slug: "jwt-client-auth", fit: "optional", note: "RFC 7523 private_key_jwt client auth or JWT grants." },
    { slug: "spiffe-client-auth", fit: "optional" },
    { slug: "mtls", fit: "optional" },
    { slug: "wimse-creds", fit: "optional" },
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — expect churn." },
    { slug: "aap-oauth", fit: "optional", note: "Individual draft — client-credentials plus structured agent claims." },
    { slug: "oauth-security-bcp", fit: "optional", note: "RFC 9700." },
    {
      label: "Resource Owner Password Credentials",
      fit: "anti-pattern",
      note: "Never. Removed from OAuth 2.1.",
    },
    {
      label: "Long-lived user refresh token in a cron",
      fit: "anti-pattern",
      note: "That is someone else's grant, parked in a job. Use client credentials, or CIBA when a human must approve.",
    },
    {
      slug: "oidc-core",
      fit: "anti-pattern",
      note: "No user on this hop. An ID Token is not an access token.",
    },
  ],
  relatedFlows: ["workload-then-user", "ciba-hitl"],
  aliases: ["cron agent", "service account", "batch", "client credentials"],
  searchTerms: [
    "unattended",
    "batch",
    "cron",
    "client credentials",
    "service agent",
    "password grant",
  ],
};

export { hostRuntime, unattended };
