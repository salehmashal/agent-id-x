import { compares } from "@/lib/compares";
import { flows } from "@/lib/flows";
import { patterns } from "@/lib/patterns";
import type { AgentFlow, CompareView, DeploymentPattern } from "@/lib/types";

export function patternsForSpec(slug: string): DeploymentPattern[] {
  return patterns.filter((pattern) => {
    if (pattern.protocols.some((item) => item.slug === slug)) return true;
    return Boolean(
      pattern.hostVariants?.some((variant) => variant.primarySlugs.includes(slug)),
    );
  });
}

export function flowsForSpec(slug: string): AgentFlow[] {
  return flows.filter((flow) => flow.specs.includes(slug));
}

export function comparesForSpec(slug: string): CompareView[] {
  return compares.filter((view) => view.specSlugs.includes(slug));
}

export function patternsForFlow(slug: string): DeploymentPattern[] {
  return patterns.filter((pattern) => pattern.relatedFlows.includes(slug));
}
