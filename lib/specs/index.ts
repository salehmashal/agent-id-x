import type { Spec } from "@/lib/types";
import { agentAdjacentNotes, deepDives } from "@/lib/deep-dives";
import { aauthSpecs } from "@/lib/specs/aauth";
import { foundationSpecs } from "@/lib/specs/foundation";
import { oauthExtensionSpecs } from "@/lib/specs/oauth-extensions";
import { openidSpecs } from "@/lib/specs/openid";
import { protocolSpecs } from "@/lib/specs/protocols";
import { workloadSpecs } from "@/lib/specs/workload";

const catalog: Spec[] = [
  ...foundationSpecs,
  ...oauthExtensionSpecs,
  ...aauthSpecs,
  ...openidSpecs,
  ...workloadSpecs,
  ...protocolSpecs,
];

export const specs: Spec[] = catalog.map((spec) => {
  const deepDive = deepDives[spec.slug];
  const agentAdjacentNote =
    spec.agentAdjacentNote ?? agentAdjacentNotes[spec.slug];
  return {
    ...spec,
    ...(deepDive ? { deepDive } : {}),
    ...(agentAdjacentNote ? { agentAdjacentNote } : {}),
  };
});

const bySlug = new Map(specs.map((spec) => [spec.slug, spec]));

export function getSpec(slug: string): Spec | undefined {
  return bySlug.get(slug);
}

export function getSpecOrThrow(slug: string): Spec {
  const spec = bySlug.get(slug);
  if (!spec) {
    throw new Error(`Unknown spec slug: ${slug}`);
  }
  return spec;
}

export function relatedSpecs(spec: Spec): Spec[] {
  return spec.related
    .map((slug) => bySlug.get(slug))
    .filter((item): item is Spec => Boolean(item));
}

export function featuredSpecs(): Spec[] {
  return specs.filter((spec) => spec.featured);
}

export function searchSpecs(query: string): Spec[] {
  const q = query.trim().toLowerCase();
  if (!q) return specs;
  return specs.filter((spec) => {
    const hay = [
      spec.shortName,
      spec.officialName,
      spec.id,
      spec.problem,
      spec.whyAgentCares,
      spec.authors ?? "",
      spec.agentAdjacentNote ?? "",
      ...(spec.aliases ?? []),
      ...deepDiveHaystack(spec),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export type CatalogFilters = {
  status?: string[];
  layer?: string[];
  relevance?: string[];
  stability?: string[];
  q?: string;
};

export function filterSpecs(filters: CatalogFilters): Spec[] {
  let result = filters.q ? searchSpecs(filters.q) : specs;
  if (filters.status?.length) {
    result = result.filter((spec) => filters.status!.includes(spec.status));
  }
  if (filters.layer?.length) {
    result = result.filter((spec) => filters.layer!.includes(spec.layer));
  }
  if (filters.relevance?.length) {
    result = result.filter((spec) =>
      filters.relevance!.includes(spec.relevance),
    );
  }
  if (filters.stability?.length) {
    result = result.filter((spec) =>
      filters.stability!.includes(spec.stability),
    );
  }
  return result;
}

export const SPEC_COUNT = specs.length;

export function deepDiveHaystack(spec: Spec): string[] {
  const dive = spec.deepDive;
  if (!dive) return [];
  return [
    ...dive.agentGap,
    ...dive.trustBoundaries,
    ...dive.mechanics,
    ...dive.layerDetail,
    ...dive.stabilityDetail,
    ...dive.flows.flatMap((flow) => [
      flow.title,
      flow.when ?? "",
      ...flow.steps,
      flow.notes ?? "",
    ]),
    ...dive.composition.map((item) => item.how),
    ...dive.pitfalls.flatMap((item) => [item.title, item.body]),
    ...(dive.claims ?? []).map((claim) => `${claim.name} ${claim.meaning}`),
  ];
}
