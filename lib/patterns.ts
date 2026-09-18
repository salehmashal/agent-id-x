import { getFlow } from "@/lib/flows";
import { getSpec } from "@/lib/specs";
import type {
  AgentFlow,
  DeploymentPattern,
  HostVariant,
  PatternProtocol,
  ProtocolFit,
  Spec,
} from "@/lib/types";
import {
  enterprise,
  headless,
  interactive,
  mcpHost,
} from "@/lib/patterns-delegated";
import {
  a2aTasking,
  aauthP2p,
  aauthPs,
  agentAsResource,
} from "@/lib/patterns-agent-native";
import { crossDomain, multiHop, sidecar } from "@/lib/patterns-workload";
import { hostRuntime, unattended } from "@/lib/patterns-hosts";

export { matrixColumns, patternScopeNotes } from "@/lib/patterns-delegated";

export const patterns: DeploymentPattern[] = [
  interactive,
  headless,
  enterprise,
  mcpHost,
  agentAsResource,
  a2aTasking,
  aauthP2p,
  aauthPs,
  multiHop,
  crossDomain,
  sidecar,
  hostRuntime,
  unattended,
];

const bySlug = new Map(patterns.map((pattern) => [pattern.slug, pattern]));

export function getPattern(slug: string): DeploymentPattern | undefined {
  return bySlug.get(slug);
}

export const PATTERN_COUNT = patterns.length;

export function protocolsByFit(
  pattern: DeploymentPattern,
  fit: ProtocolFit,
): PatternProtocol[] {
  return pattern.protocols.filter((item) => item.fit === fit);
}

export function primaryProtocolSlugs(pattern: DeploymentPattern): string[] {
  return protocolsByFit(pattern, "primary")
    .map((item) => item.slug)
    .filter((slug): slug is string => Boolean(slug));
}

/** Skip unknown catalog slugs instead of throwing. */
export function resolveSpec(slug: string | undefined): Spec | undefined {
  if (!slug) return undefined;
  return getSpec(slug);
}

export function resolveSpecs(slugs: string[]): Spec[] {
  return slugs
    .map((slug) => getSpec(slug))
    .filter((spec): spec is Spec => Boolean(spec));
}

export function resolveFlows(slugs: string[]): AgentFlow[] {
  return slugs
    .map((slug) => getFlow(slug))
    .filter((flow): flow is AgentFlow => Boolean(flow));
}

export function protocolDisplayName(item: PatternProtocol): string | undefined {
  if (item.label) return item.label;
  if (!item.slug) return undefined;
  return getSpec(item.slug)?.shortName ?? undefined;
}

/** True when the catalog marks this document as an individual draft (agent-grants, AAP, AAuth, …). */
export function isDraftChurn(spec: Spec | undefined): boolean {
  return spec?.status === "individual-draft";
}

export function patternHaystack(pattern: DeploymentPattern): string {
  const protocolNames = pattern.protocols
    .map((item) => {
      const spec = item.slug ? getSpec(item.slug) : undefined;
      return [item.slug, item.label, item.note, spec?.shortName, spec?.id]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
  const variantText = (pattern.hostVariants ?? [])
    .map((variant) => hostVariantHaystack(variant))
    .join(" ");
  return [
    pattern.title,
    pattern.matrixTitle,
    pattern.summary,
    pattern.inTheWild,
    pattern.whyThese,
    pattern.slug,
    ...(pattern.aliases ?? []),
    ...(pattern.searchTerms ?? []),
    ...pattern.actors.map((actor) => `${actor.name} ${actor.trust}`),
    pattern.topology.caption,
    protocolNames,
    variantText,
  ]
    .join(" ")
    .toLowerCase();
}

function hostVariantHaystack(variant: HostVariant): string {
  return [
    variant.title,
    variant.situation,
    variant.pitfalls,
    variant.topology.caption,
    ...variant.primarySlugs,
  ].join(" ");
}

export function searchPatterns(query: string): DeploymentPattern[] {
  const q = query.trim().toLowerCase();
  if (!q) return patterns;
  return patterns.filter((pattern) => patternHaystack(pattern).includes(q));
}
