import type {
  DeploymentPattern,
} from "@/lib/types";

const multiHop: DeploymentPattern = {
  slug: "multi-hop-obo",
  title: "Multi-hop on-behalf-of inside one domain",
  matrixTitle: "Multi-hop (one domain)",
  summary:
    "Orchestrator → specialist → API, still inside one trust domain. RFC 8693 act records who is acting. Transaction tokens carry immutable purpose. WIMSE re-binds the workload identity at each hop. AAuth call chaining (upstream_token / subagent_token) if you are already on AAuth.",
  inTheWild:
    "An orchestrator agent that fans out to a retrieval agent and a payments agent, all in the same cluster, all acting for the employee who started the task. Internal toolchains where every hop is your mesh. If the next hop is another company's AS, that is the cross-domain row.",
  actors: [
    {
      name: "User (at the start)",
      principal: "user",
      trust: "Authorized the first agent. Must not be silently widened at a later hop.",
    },
    {
      name: "Orchestrator agent",
      principal: "agent-instance",
      trust: "Holds the original grant. Exchanges or re-binds before calling specialists — does not forward the raw user access token.",
    },
    {
      name: "Specialist / downstream API",
      principal: "resource",
      trust: "Sees an attenuated token: subject = user, act = the calling agent, audience = itself, purpose unchanged.",
    },
    {
      name: "Workload identity issuer",
      principal: "workload",
      trust: "SPIRE / WIMSE names each binary so a stolen user token presented by the wrong pod is a different incident.",
    },
  ],
  whyThese:
    "Inside one domain you do not need identity chaining across ASes. You do need a recorded actor (RFC 8693 act), a purpose that cannot grow (transaction tokens), and a workload identity that is re-bound at each hop (WIMSE). Agent-grants and AAP are individual OAuth profiles that try to say the same thing with extra claims — mark them draft/churn. If the fabric is AAuth, call chaining with upstream_token / subagent_token is the analogue: the sub-agent signs with its own key while nested act records the parent. Never expand scopes at a hop. Never forward the original user access token.",
  userPresent: "sometimes",
  asInPath: "yes",
  workloadIdentity: "yes",
  agentPortableIdentity: "sometimes",
  topology: {
    caption:
      "Same trust domain. Each hop attenuates and re-binds. The user grant does not travel as a raw Bearer token.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "orch", label: "Orchestrator", kind: "agent" },
      { id: "spec", label: "Specialist", kind: "agent" },
      { id: "api", label: "API", kind: "resource" },
      { id: "wimse", label: "SPIRE / WIMSE", kind: "workload" },
    ],
    edges: [
      { from: "user", to: "orch", label: "Original grant (OAuth or AAuth)" },
      { from: "wimse", to: "orch", label: "Workload identity for this binary" },
      { from: "wimse", to: "spec", label: "Hop re-bind for the specialist" },
      {
        from: "orch",
        to: "spec",
        label: "RFC 8693 / txn-token / AAuth subagent_token — attenuated",
      },
      { from: "spec", to: "api", label: "Audience-restricted, purpose-frozen call" },
    ],
  },
  protocols: [
    { slug: "token-exchange", fit: "primary", note: "RFC 8693 act." },
    { slug: "transaction-tokens", fit: "primary", note: "WG draft — immutable purpose inside the domain." },
    { slug: "wimse-arch", fit: "primary", note: "Hop re-bind of workload identity." },
    { slug: "wimse-wpt", fit: "optional" },
    {
      slug: "aauth",
      fit: "optional",
      note: "Call chaining: upstream_token / subagent_token. Individual draft; some implementations still incomplete.",
    },
    { slug: "txntokens-agents", fit: "optional", note: "Individual usage profile of transaction tokens. Draft/churn." },
    { slug: "agent-grants", fit: "optional", note: "Individual draft — expect churn." },
    { slug: "aap-oauth", fit: "optional", note: "Individual draft — expect churn. Expired draft-01 unless renewed." },
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — expect churn." },
    { slug: "jwt-access-tokens", fit: "optional" },
    {
      label: "Forwarding the original user access token",
      fit: "anti-pattern",
      note: "Every hop becomes the user. No actor, no attenuation, no audience.",
    },
    {
      label: "Expanding scopes at a hop",
      fit: "anti-pattern",
      note: "On-behalf-of is a narrowing, not a promotion.",
    },
    {
      slug: "identity-chaining",
      fit: "anti-pattern",
      note: "That draft is for crossing authorization servers / domains. Wrong row.",
    },
  ],
  relatedFlows: ["multi-hop-obo", "workload-then-user"],
  aliases: ["on-behalf-of", "OBO", "orchestrator", "act claim"],
  searchTerms: ["multi-hop", "on-behalf-of", "act", "transaction tokens", "call chaining"],
};

const crossDomain: DeploymentPattern = {
  slug: "cross-domain-chaining",
  title: "Cross-domain identity chaining",
  matrixTitle: "Cross-domain chaining",
  summary:
    "The grant starts at AS A and must be accepted at AS B in another organization. Identity chaining (I-D) composes RFC 8693 and RFC 7523. RFC 9207 mix-up defenses exist because two issuers are now in play.",
  inTheWild:
    "An agent reads mail in the company tenant and files a ticket in a vendor SaaS whose AS is not yours. Partner integrations where each side has its own authorization server. Distinct from XAA only in that XAA is the IdP-brokered profile of a similar grant; this row is the general two-AS chain.",
  actors: [
    {
      name: "Client in domain A",
      principal: "agent-instance",
      trust: "Holds a token from AS A. Must not present it at API C in domain B.",
    },
    {
      name: "AS A",
      principal: "other",
      trust: "Token-exchanges a JWT authorization grant audience-restricted to AS B.",
    },
    {
      name: "AS B",
      principal: "other",
      trust: "Redeems that JWT via RFC 7523 and issues an access token for its own resource. Must not be mixed up with AS A.",
    },
    {
      name: "Resource in domain B",
      principal: "resource",
      trust: "Accepts only tokens from AS B, aud = itself.",
    },
  ],
  whyThese:
    "Two authorization servers means identity chaining, not a private JWT format and not a transaction token (txn-tokens are same-domain). RFC 8693 produces the grant; RFC 7523 is how B consumes a JWT assertion; the chaining I-D writes that down as a profile (RFC Editor queue as of July 2026 — no RFC number yet). RFC 9207 iss in the authorization response, plus exact issuer metadata checks, are how you stop mix-up when the client talks to more than one AS. XAA is the IdP-shaped variant; FAPI if B is high-risk.",
  userPresent: "sometimes",
  asInPath: "yes",
  workloadIdentity: "sometimes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Two ASes, two audiences. The client exchanges at A for a grant B will redeem. Mix-up defenses are mandatory.",
    nodes: [
      { id: "user", label: "User", kind: "user" },
      { id: "asa", label: "AS A", kind: "as" },
      { id: "agent", label: "Agent in A", kind: "agent" },
      { id: "asb", label: "AS B", kind: "as" },
      { id: "api", label: "API in B", kind: "resource" },
    ],
    edges: [
      { from: "user", to: "asa", label: "Original delegation" },
      { from: "agent", to: "asa", label: "RFC 8693 exchange → JWT grant, aud = AS B" },
      { from: "agent", to: "asb", label: "RFC 7523 JWT bearer grant (iss checks / RFC 9207)" },
      { from: "asb", to: "agent", label: "Access token for API C" },
      { from: "agent", to: "api", label: "Call in domain B" },
    ],
  },
  protocols: [
    {
      slug: "identity-chaining",
      fit: "primary",
      note: "WG draft in the RFC Editor queue — cite the I-D until an RFC number exists.",
    },
    { slug: "jwt-client-auth", fit: "primary", note: "RFC 7523." },
    { slug: "token-exchange", fit: "primary", note: "RFC 8693." },
    { slug: "iss-param", fit: "primary", note: "RFC 9207 mix-up defenses." },
    { slug: "xaa", fit: "optional", note: "IdP-brokered profile of a similar grant." },
    { slug: "fapi-2", fit: "optional" },
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00) — expect churn." },
    { slug: "as-metadata", fit: "optional", note: "Exact issuer metadata comparison." },
    {
      slug: "transaction-tokens",
      fit: "anti-pattern",
      note: "Same-domain context propagation, not a cross-AS grant.",
    },
    {
      label: "Presenting AS A's access token at API C",
      fit: "anti-pattern",
      note: "Wrong audience, wrong issuer, classic confused deputy.",
    },
    {
      label: "A private cross-domain token format",
      fit: "anti-pattern",
      note: "The chaining I-D exists so you do not invent one.",
    },
  ],
  relatedFlows: ["multi-hop-obo"],
  aliases: ["identity chaining", "cross-domain", "RFC 7523", "mix-up"],
  searchTerms: ["cross-domain", "identity chaining", "7523", "9207", "mix-up"],
};

const sidecar: DeploymentPattern = {
  slug: "workload-sidecar",
  title: "Workload / mesh sidecar (unattended, no user)",
  matrixTitle: "Mesh sidecar",
  summary:
    "The agent is a binary in a mesh. SPIFFE/SPIRE names it, WIMSE WIT/WPT prove it, mTLS carries it. Client credentials or SPIFFE client auth if an AS is still in the picture. Not an OIDC user sub.",
  inTheWild:
    "An inference service in Kubernetes with a SPIRE agent (or mesh sidecar) issuing X.509-SVIDs. Internal tool-calling microservices with no human on the request. Sidecar proxies that present mTLS to the next hop so the app code never sees a static API key.",
  actors: [
    {
      name: "Workload (agent binary)",
      principal: "workload",
      trust: "Identified by a SPIFFE ID / WIMSE identifier. That string is 'payment-api in prod', not 'Alice'.",
    },
    {
      name: "SPIRE / identity server",
      principal: "other",
      trust: "Attests the platform and issues short-lived SVIDs or WIT/WIC.",
    },
    {
      name: "Sidecar / mesh proxy",
      principal: "other",
      trust: "Often the process that actually presents mTLS. The workload identity is still the app's, not the proxy vendor's.",
    },
    {
      name: "Relying workload / API",
      principal: "resource",
      trust: "Authenticates the peer cert or WPT. Authorization is policy on the SPIFFE ID, optionally plus an OAuth client-credentials token.",
    },
  ],
  whyThese:
    "There is no user on this hop, so OIDC user sub is the wrong identifier to stuff into a SPIFFE ID. SPIFFE/SPIRE is how production meshes already name binaries. WIMSE generalizes that across systems (WIT must not be used as Bearer; WPT or HTTP signatures or mTLS are the proof). If the API still wants OAuth, the client authenticates with SPIFFE (or mTLS RFC 8705) and uses the client-credentials grant — the token is the workload's, not Alice's. AIMS is the BCP that says this out loud. AAuth portable agent identity is a different scope (open-world HTTP clients, not your cluster).",
  userPresent: "no",
  asInPath: "sometimes",
  workloadIdentity: "yes",
  agentPortableIdentity: "no",
  topology: {
    caption:
      "Platform attests the binary. Sidecar or the app presents mTLS / WPT. Optional AS only for client-credentials, never for a user sub.",
    nodes: [
      { id: "spire", label: "SPIRE / WIMSE issuer", kind: "workload" },
      { id: "sidecar", label: "Sidecar", kind: "other" },
      { id: "agent", label: "Agent workload", kind: "agent" },
      { id: "as", label: "Optional AS", kind: "as" },
      { id: "api", label: "Peer API", kind: "resource" },
    ],
    edges: [
      { from: "spire", to: "agent", label: "X.509-SVID or WIT+WIC" },
      { from: "agent", to: "sidecar", label: "Workload API / identity for this pod" },
      { from: "sidecar", to: "api", label: "mTLS / WPT / HTTP signatures" },
      { from: "agent", to: "as", label: "Optional: SPIFFE client auth + client_credentials" },
    ],
  },
  protocols: [
    { slug: "spiffe", fit: "primary" },
    { slug: "wimse-arch", fit: "primary" },
    { slug: "wimse-creds", fit: "primary", note: "WIT / WIC. WIT is not a Bearer token." },
    { slug: "wimse-wpt", fit: "primary" },
    { slug: "mtls", fit: "primary" },
    { slug: "spiffe-client-auth", fit: "optional", note: "When the workload must also be an OAuth client." },
    { slug: "oauth-2-1", fit: "optional", note: "Client credentials only — there is no user." },
    { slug: "aims", fit: "optional", note: "WIMSE WG draft (aims-00). Agents as workloads." },
    { slug: "wimse-ai-agent", fit: "optional", note: "Individual draft: why workload ID is not owner ID." },
    { slug: "aap-oauth", fit: "optional", note: "Individual draft — structured claims on a client-credentials token." },
    {
      slug: "oidc-core",
      fit: "anti-pattern",
      note: "Do not put the user sub in the SPIFFE ID, and do not send an ID Token to the API.",
    },
    {
      label: "Static API keys in the sidecar env",
      fit: "anti-pattern",
      note: "The SVID is supposed to replace that.",
    },
  ],
  relatedFlows: ["workload-then-user"],
  aliases: ["sidecar", "mesh", "SPIFFE", "SPIRE", "unattended workload"],
  searchTerms: ["sidecar", "mesh", "SPIFFE", "SPIRE", "WIMSE", "WIT", "WPT", "mTLS"],
};

export { multiHop, crossDomain, sidecar };
