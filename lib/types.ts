export const RESEARCH_AS_OF = "22 September 2026";

export type SpecStatus =
  | "rfc"
  | "wg-draft"
  | "individual-draft"
  | "oidf-final"
  | "w3c"
  | "protocol";

export type Layer = "identity" | "authn" | "authz" | "mixed";

export type AgentRelevance = "foundation" | "agent-specific" | "adjacent";

export type Stability = "stable" | "draft" | "vendor-protocol";

export type Org =
  | "IETF"
  | "OIDF"
  | "W3C"
  | "Linux Foundation"
  | "CNCF"
  | "DIF"
  | "MCP Steering"
  | "AAIF";

export interface ClaimNote {
  name: string;
  meaning: string;
}

export interface SpecLink {
  label: string;
  href: string;
}

/** Quoted from the named spec, or an illustrative example that is not a verbatim requirement. */
export type ClaimSource = "quoted" | "illustrative";

export interface DeepDiveClaim {
  name: string;
  meaning: string;
  source: ClaimSource;
}

export interface DeepDiveFlow {
  id: string;
  title: string;
  when?: string;
  steps: string[];
  notes?: string;
}

export interface DeepDiveComposition {
  specSlug: string;
  how: string;
}

export interface DeepDivePitfall {
  title: string;
  body: string;
}

/**
 * Optional field-guide chapter for main documents.
 * Non-main specs omit this and keep the shorter catalog form.
 */
export interface SpecDeepDive {
  /** Problem and the exact gap for agents (user vs agent vs workload vs resource). */
  agentGap: string[];
  /** Actors and trust boundaries in more than a role list. */
  trustBoundaries: string[];
  /** Endpoints, grants, token types, headers — summarize, do not dump the RFC. */
  mechanics: string[];
  claims?: DeepDiveClaim[];
  /** One numbered flow, or one per access mode. */
  flows: DeepDiveFlow[];
  /** Identity vs authentication vs authorization in THIS document. */
  layerDetail: string[];
  /** How this document composes with OAuth 2.1, OIDC, AAuth, RFC 8693, DPoP, WIMSE, MCP. */
  composition: DeepDiveComposition[];
  /** Sender-constraint, audience, mix-up, confused deputy, replay, overbroad act, … */
  pitfalls: DeepDivePitfall[];
  /** RFC vs WG draft vs individual; what you can ship today. */
  stabilityDetail: string[];
}

export interface Spec {
  slug: string;
  shortName: string;
  officialName: string;
  id: string;
  status: SpecStatus;
  stability: Stability;
  date?: string;
  authors?: string;
  org: Org;
  layer: Layer;
  relevance: AgentRelevance;
  problem: string;
  identityVsAuthnVsAuthz: string;
  actors: string[];
  flow: string;
  tokensAndClaims: ClaimNote[];
  related: string[];
  implementerNotes: string;
  whyAgentCares: string;
  urls: SpecLink[];
  featured?: boolean;
  aliases?: string[];
  /** Attached from lib/deep-dives for main documents. */
  deepDive?: SpecDeepDive;
  /** Short note for adjacent DID/VC/etc. pages — not a full field guide. */
  agentAdjacentNote?: string;
}

/** Payload chip on a sequence hop. from-spec = protocol noun; illustrative = example value. */
export type ChipSource = "from-spec" | "illustrative";

export interface PayloadChip {
  label: string;
  source: ChipSource;
  hint?: string;
}

export function specChip(label: string, hint?: string): PayloadChip {
  return hint
    ? { label, source: "from-spec", hint }
    : { label, source: "from-spec" };
}

export function egChip(label: string, hint?: string): PayloadChip {
  return hint
    ? { label, source: "illustrative", hint }
    : { label, source: "illustrative" };
}

export interface FlowStep {
  from: string;
  to: string;
  /** Who sends what, to whom — short hop label. */
  action: string;
  note?: string;
  /** Optional hop length for the animated sequence player. */
  durationMs?: number;
  /** Why this hop exists (one sentence). */
  why?: string;
  /** One-line site metaphor (pass / wax seal / photocopy / glued-to-a-key). */
  caption?: string;
  /** Short RFC or draft name shown on the hop, e.g. RFC 7636. */
  citation?: string;
  /** Payload chips: codes, token typ, header names. */
  chips?: PayloadChip[];
  /** Sticky “now” line: plain language plus the spec term. */
  now?: string;
  chapter?: string;
  challenge?: boolean;
  fail?: boolean;
  /** Tokens that appear on an actor after this hop (actor = FlowStep name). */
  held?: { actor: string; label: string }[];
}

export interface AgentFlow {
  slug: string;
  title: string;
  summary: string;
  /** Protocol or cluster name for the sequence title, e.g. OAuth 2.1. */
  protocol?: string;
  /** Question this sequence answers. */
  question?: string;
  /** Line shown when the last hop of a loop finishes. */
  takeaway?: string;
  pattern:
    | "user-delegated"
    | "p2p"
    | "agent-as-client"
    | "agent-as-resource"
    | "multi-hop"
    | "consent";
  actors: string[];
  steps: FlowStep[];
  specs: string[];
  caveats: string;
  /** Extra practitioner prose; omitted on thinner flows. */
  detail?: string[];
  alsoSee?: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Catalog slugs on `/specs/[slug]`. */
  seeAlso?: string[];
  /** Flow slugs on `/flows/[slug]` — the walk that defines the term. */
  seeFlows?: string[];
  /** Compare slugs on `/compare/[pair]`. */
  seeCompares?: string[];
}

export interface CompareSection {
  title: string;
  body: string;
}

export interface CompareView {
  slug: string;
  title: string;
  subtitle: string;
  leftTitle: string;
  rightTitle: string;
  rows: { aspect: string; left: string; right: string }[];
  takeaway: string;
  specSlugs: string[];
  /** Deeper notes that do not belong in the table. */
  fieldNotes?: CompareSection[];
}

/** Yes / no / sometimes for the deployment matrix. */
export type MatrixSignal = "yes" | "no" | "sometimes";

export const MATRIX_SIGNAL_LABEL: Record<MatrixSignal, string> = {
  yes: "Yes",
  no: "No",
  sometimes: "Sometimes",
};

export type ProtocolFit = "primary" | "optional" | "anti-pattern";

/**
 * A protocol (or named anti-practice) that applies to a deployment pattern.
 * Prefer `slug` so the UI can link into `/specs/[slug]`. Unknown slugs are skipped at render.
 */
export interface PatternProtocol {
  slug?: string;
  /** Used when there is no catalog slug, or as a display override. */
  label?: string;
  fit: ProtocolFit;
  note?: string;
}

export type TopologyKind =
  | "user"
  | "agent"
  | "workload"
  | "resource"
  | "as"
  | "other";

export interface TopologyNode {
  id: string;
  label: string;
  kind: TopologyKind;
}

export interface TopologyEdge {
  from: string;
  to: string;
  label: string;
}

export interface PatternTopology {
  caption: string;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface PatternActor {
  name: string;
  /** Mental-model principal, or `other` for AS / IdP / person server. */
  principal: "user" | "agent-instance" | "workload" | "resource" | "other";
  trust: string;
}

export interface HostVariant {
  slug: string;
  title: string;
  situation: string;
  topology: PatternTopology;
  primarySlugs: string[];
  pitfalls: string;
}

/**
 * How the agent is deployed (runtime topology) and which protocols actually apply.
 * Distinct from AgentFlow: flows are protocol sequences; these are deployment shapes.
 */
export interface DeploymentPattern {
  slug: string;
  title: string;
  matrixTitle: string;
  summary: string;
  inTheWild: string;
  actors: PatternActor[];
  whyThese: string;
  userPresent: MatrixSignal;
  asInPath: MatrixSignal;
  workloadIdentity: MatrixSignal;
  agentPortableIdentity: MatrixSignal;
  topology: PatternTopology;
  hostVariants?: HostVariant[];
  protocols: PatternProtocol[];
  relatedFlows: string[];
  relatedCompares?: string[];
  aliases?: string[];
  searchTerms?: string[];
}

export const STATUS_LABEL: Record<SpecStatus, string> = {
  rfc: "RFC",
  "wg-draft": "WG draft",
  "individual-draft": "Individual draft",
  "oidf-final": "OIDF Final",
  w3c: "W3C",
  protocol: "Related protocol",
};

export const LAYER_LABEL: Record<Layer, string> = {
  identity: "Identity",
  authn: "Authentication",
  authz: "Authorization",
  mixed: "Identity + Authn + Authz",
};

export const RELEVANCE_LABEL: Record<AgentRelevance, string> = {
  foundation: "Foundation",
  "agent-specific": "Agent-specific",
  adjacent: "Adjacent",
};

export const STABILITY_LABEL: Record<Stability, string> = {
  stable: "Stable",
  draft: "Draft — expect change",
  "vendor-protocol": "Vendor / protocol (not an RFC)",
};
