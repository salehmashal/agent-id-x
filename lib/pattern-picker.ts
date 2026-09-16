export interface PickerLink {
  href: string;
  label: string;
}

export interface PickerResult {
  slug: string | null;
  headline: string;
  why: string;
  also: PickerLink[];
}

export interface PickerAnswer {
  id: string;
  label: string;
  hint?: string;
  next?: string;
  result?: PickerResult;
}

export interface PickerQuestion {
  id: string;
  prompt: string;
  help: string;
  answers: PickerAnswer[];
}

export const pickerQuestions: Record<string, PickerQuestion> = {
  user: {
    id: "user",
    prompt: "Is a human in the loop for this call?",
    help: "Not 'does the product have users.' Is a person authenticating or approving this hop.",
    answers: [
      {
        id: "screen",
        label: "Yes — they are at a product UI",
        hint: "Browser, IDE, or desktop chat. Consent happens here.",
        next: "wire",
      },
      {
        id: "other-device",
        label: "Yes — but on another device",
        hint: "Phone, factory-floor operator, SSH. The agent itself has no browser.",
        result: {
          slug: "headless-async-delegated",
          headline: "Headless / async user-delegated",
          why: "Authorization code needs a redirect user-agent the agent does not have. CIBA starts the grant on the back channel and pushes the human onto an authentication device. RFC 9470 steps up an existing grant. AAuth person-server interaction relay is the same idea when there is no OAuth AS in the hop. Do not scrape an authorize page.",
          also: [
            { href: "/specs/ciba", label: "CIBA" },
            { href: "/specs/step-up", label: "RFC 9470" },
            { href: "/patterns/unattended-batch", label: "If there is no human at all" },
          ],
        },
      },
      {
        id: "idp",
        label: "The company IdP already has their SSO session",
        hint: "Enterprise Copilot calling Slack or ServiceNow. Admin policy may skip a second consent.",
        result: {
          slug: "enterprise-idp-brokered",
          headline: "Enterprise SaaS / IdP-brokered",
          why: "XAA / ID-JAG is the IdP-brokered profile: the user is already signed in; the IdP mints a JWT grant the SaaS AS redeems (RFC 7523). Identity chaining is the general two-AS form. This is not AAuth p2p (there is very much an AS) and not MCP (the wire to Slack is Slack's API).",
          also: [
            { href: "/specs/xaa", label: "XAA / ID-JAG" },
            { href: "/specs/identity-chaining", label: "Identity chaining" },
            { href: "/compare/aauth-vs-oauth", label: "AAuth vs OAuth" },
          ],
        },
      },
      {
        id: "no-user",
        label: "No user on this hop",
        hint: "Cron, mesh sidecar, open-world HTTP, or other agents calling you.",
        next: "no-user",
      },
    ],
  },
  wire: {
    id: "wire",
    prompt: "What is the wire on this hop?",
    help: "Same human, different protocol. MCP HTTP is an OAuth 2.1 profile. Ordinary SaaS APIs are still authorization-code OAuth. If others call you, you are the resource.",
    answers: [
      {
        id: "mcp",
        label: "MCP HTTP tools (host → remote MCP server)",
        result: {
          slug: "mcp-host-server",
          headline: "MCP host ↔ MCP server",
          why: "The host is the OAuth client. The MCP server is the resource. Protected Resource Metadata, CIMD, authorization code + PKCE, audience = the MCP server. Not AAuth p2p by default. Stdio MCP is a local pipe and MUST NOT use this profile.",
          also: [
            { href: "/specs/mcp-auth", label: "MCP authorization" },
            { href: "/specs/prm", label: "RFC 9728" },
            { href: "/patterns/aauth-p2p", label: "If you deliberately leave MCP-OAuth" },
          ],
        },
      },
      {
        id: "apis",
        label: "Ordinary APIs (Gmail, Jira, internal REST)",
        next: "host",
      },
      {
        id: "i-am-resource",
        label: "Others call my agent — I am the HTTP resource",
        result: {
          slug: "agent-as-resource",
          headline: "Agent as HTTP resource / tool provider",
          why: "Publish how to authorize (RFC 9728 and/or an A2A Agent Card), then enforce that scheme on every request. A signed Agent Card is tamper evidence for the card, not request authentication. AAuth two-party is the option if you refuse to stand up an AS.",
          also: [
            { href: "/specs/prm", label: "RFC 9728" },
            { href: "/specs/a2a", label: "A2A Agent Card" },
            { href: "/patterns/a2a-tasking", label: "If the protocol is A2A tasks" },
          ],
        },
      },
    ],
  },
  host: {
    id: "host",
    prompt: "Where does the OAuth client actually run?",
    help: "Same grant (authorization code + PKCE). Different token-storage failure modes. RFC 10017 for browsers, RFC 8252 for native apps.",
    answers: [
      {
        id: "browser",
        label: "Browser / chat SPA",
        result: {
          slug: "interactive-user-delegated",
          headline: "Interactive user-delegated (browser host)",
          why: "A human is in a product UI. Authorization code + PKCE, OIDC for the user, audience-restricted access tokens. The host-runtime row is the same grant with RFC 10017 token-storage rules: prefer a BFF with HTTP-only cookies; never localStorage. AAuth identity-based p2p has no auth-code redirect — wrong tool unless you are replacing the AS.",
          also: [
            { href: "/patterns/host-runtime", label: "Host runtime (RFC 10017 / 8252)" },
            { href: "/specs/browser-apps", label: "RFC 10017" },
            { href: "/specs/pkce", label: "PKCE" },
          ],
        },
      },
      {
        id: "native",
        label: "Native app, CLI, or desktop companion",
        result: {
          slug: "interactive-user-delegated",
          headline: "Interactive user-delegated (native host)",
          why: "Still authorization code + PKCE with a human at a screen. RFC 8252: system browser, claimed HTTPS or loopback, no embedded webview. Claude Desktop and IDE plugins that pop a browser live here, not on the MCP-stdio row.",
          also: [
            { href: "/patterns/host-runtime", label: "Host runtime" },
            { href: "/specs/native-apps", label: "RFC 8252" },
            { href: "/patterns/mcp-host-server", label: "If the wire is MCP HTTP" },
          ],
        },
      },
      {
        id: "server",
        label: "Server-side runtime (tokens never hit the page)",
        result: {
          slug: "interactive-user-delegated",
          headline: "Interactive user-delegated (server host)",
          why: "Confidential client. Authenticate with a key; sender-constrain the access token with DPoP or mTLS. The browser, if any, gets a session cookie, not the refresh token. Still a user-delegated grant — not client credentials, and not AAuth p2p.",
          also: [
            { href: "/patterns/host-runtime", label: "Host runtime" },
            { href: "/specs/dpop", label: "DPoP" },
            { href: "/specs/mtls", label: "mTLS" },
          ],
        },
      },
    ],
  },
  "no-user": {
    id: "no-user",
    prompt: "If there is no user on this hop, what is the shape?",
    help: "Batch jobs, mesh identities, signed HTTP with no AS, and agent-to-agent tasks are different rows. Pick the one you are actually building.",
    answers: [
      {
        id: "batch",
        label: "Cron / queue worker acting as itself",
        result: {
          slug: "unattended-batch",
          headline: "Unattended batch / service agent",
          why: "Client credentials and workload identity. Never the password grant. Never a long-lived user refresh token stuffed into the job. If a human must approve a specific action, that is CIBA — go back and pick 'another device.'",
          also: [
            { href: "/specs/oauth-2-1", label: "OAuth 2.1 client credentials" },
            { href: "/specs/spiffe", label: "SPIFFE" },
            { href: "/patterns/headless-async-delegated", label: "If a human must approve" },
          ],
        },
      },
      {
        id: "mesh",
        label: "Mesh sidecar / SPIFFE workload",
        result: {
          slug: "workload-sidecar",
          headline: "Workload / mesh sidecar",
          why: "SPIFFE/SPIRE names the binary; WIMSE WIT/WPT prove it; mTLS carries it. That string is 'payment-api in prod', not Alice. Optional AS only for client-credentials. Do not put a user sub in the SPIFFE ID.",
          also: [
            { href: "/specs/spiffe", label: "SPIFFE" },
            { href: "/specs/wimse-arch", label: "WIMSE" },
            { href: "/#principals", label: "Four principals" },
          ],
        },
      },
      {
        id: "p2p-family",
        label: "Talking to another party with no user grant",
        hint: "Open-world HTTP, Agent Cards, or a pairwise DID. These are not the same.",
        next: "p2p-which",
      },
      {
        id: "obo",
        label: "Orchestrator fanning out inside one cluster",
        result: {
          slug: "multi-hop-obo",
          headline: "Multi-hop on-behalf-of (one domain)",
          why: "RFC 8693 act records who is acting. Transaction tokens freeze purpose. WIMSE re-binds workload identity at each hop. Never forward the original user access token. If the next hop is another company's AS, that is cross-domain chaining, not this row.",
          also: [
            { href: "/specs/token-exchange", label: "RFC 8693" },
            { href: "/specs/transaction-tokens", label: "Transaction tokens" },
            { href: "/patterns/cross-domain-chaining", label: "Cross-domain chaining" },
          ],
        },
      },
      {
        id: "cross",
        label: "The grant must be accepted at another company's AS",
        result: {
          slug: "cross-domain-chaining",
          headline: "Cross-domain identity chaining",
          why: "Identity chaining (I-D, RFC Editor queue as of July 2026 — no RFC number yet) composes RFC 8693 and RFC 7523. RFC 9207 mix-up defenses exist because two issuers are in play. Transaction tokens are same-domain and the wrong tool here.",
          also: [
            { href: "/specs/identity-chaining", label: "Identity chaining" },
            { href: "/specs/iss-param", label: "RFC 9207" },
            { href: "/patterns/enterprise-idp-brokered", label: "IdP-brokered XAA variant" },
          ],
        },
      },
    ],
  },
  "p2p-which": {
    id: "p2p-which",
    prompt: "Which of the three 'p2p' stories is this?",
    help: "AAuth p2p, A2A tasking, and did:peer / DIDComm are not interchangeable. The matrix keeps them apart on purpose.",
    answers: [
      {
        id: "aauth",
        label: "Signed HTTP, no AS, portable agent token",
        result: {
          slug: "aauth-p2p",
          headline: "AAuth identity-based / two-party",
          why: "No authorization server in the path. The agent signs with RFC 9421; Signature-Key carries aa-agent+jwt. Identity-based: the resource decides from the agent token. Two-party: the resource runs its own login and issues a session bound to the agent's key. OAuth Bearer does not apply. Individual draft — pin a revision.",
          also: [
            { href: "/specs/aauth", label: "AAuth" },
            { href: "/specs/http-message-signatures", label: "RFC 9421" },
            { href: "/compare/delegated-vs-p2p", label: "Delegated vs p2p" },
          ],
        },
      },
      {
        id: "a2a",
        label: "Agent Cards and a task protocol",
        result: {
          slug: "a2a-tasking",
          headline: "Agent-to-agent tasking (A2A)",
          why: "A2A v1.0 is how they talk. Authentication is whatever the card advertised — usually OAuth. This is not AAuth identity-based p2p (no Signature-Key) and not did:peer (Agent Cards are globally fetched JSON). Do not forward caller credentials in-band down the chain (A2A §7.6.3).",
          also: [
            { href: "/specs/a2a", label: "A2A" },
            { href: "/patterns/aauth-p2p", label: "AAuth p2p (different wire)" },
            { href: "/patterns/agent-as-resource", label: "If you host the card" },
          ],
        },
      },
      {
        id: "did",
        label: "Pairwise DID / DIDComm wallet messaging",
        result: {
          slug: null,
          headline: "did:peer / DIDComm is not a deployment row",
          why: "Pairwise, not globally resolvable, and not how a stranger's first HTTP call is authenticated. They sit in the catalog as adjacent identity/messaging. Do not substitute them for AAuth p2p, and do not substitute A2A Agent Cards for a DID document.",
          also: [
            { href: "/specs/did-peer", label: "did:peer" },
            { href: "/specs/didcomm", label: "DIDComm" },
            { href: "/patterns/aauth-p2p", label: "AAuth p2p" },
            { href: "/patterns/a2a-tasking", label: "A2A tasking" },
          ],
        },
      },
    ],
  },
};

export const PICKER_START = "user";

export function getPickerQuestion(id: string): PickerQuestion | undefined {
  return pickerQuestions[id];
}

export function pickerHaystack(): string {
  const parts = Object.values(pickerQuestions).flatMap((question) => [
    question.prompt,
    question.help,
    ...question.answers.flatMap((answer) => [
      answer.label,
      answer.hint ?? "",
      answer.result?.headline ?? "",
      answer.result?.why ?? "",
    ]),
  ]);
  return [...parts, "what are you building", "pattern picker", "this is your shape"].join(" ").toLowerCase();
}
