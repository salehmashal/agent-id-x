import { compares } from "@/lib/compares";
import { flows } from "@/lib/flows";
import { glossary } from "@/lib/glossary";
import { patternHaystack, patterns } from "@/lib/patterns";
import { pickerHaystack } from "@/lib/pattern-picker";
import { deepDiveHaystack, specs } from "@/lib/specs";

export type SearchHitKind =
  | "spec"
  | "flow"
  | "compare"
  | "glossary"
  | "pattern";

export interface SearchHit {
  kind: SearchHitKind;
  href: string;
  title: string;
  subtitle: string;
}

export function searchAll(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const spec of specs) {
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
    if (hay.includes(q)) {
      hits.push({
        kind: "spec",
        href: `/specs/${spec.slug}`,
        title: spec.shortName,
        subtitle: spec.id,
      });
    }
  }

  for (const pattern of patterns) {
    if (patternHaystack(pattern).includes(q)) {
      hits.push({
        kind: "pattern",
        href: `/patterns/${pattern.slug}`,
        title: pattern.title,
        subtitle: pattern.matrixTitle,
      });
    }
  }

  for (const flow of flows) {
    const hay = `${flow.title} ${flow.summary} ${flow.caveats} ${flow.detail?.join(" ") ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        kind: "flow",
        href: `/flows/${flow.slug}`,
        title: flow.title,
        subtitle: flow.pattern,
      });
    }
  }

  for (const compare of compares) {
    const hay = `${compare.title} ${compare.subtitle} ${compare.takeaway} ${compare.fieldNotes?.map((n) => `${n.title} ${n.body}`).join(" ") ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        kind: "compare",
        href: `/compare/${compare.slug}`,
        title: compare.title,
        subtitle: "Comparison",
      });
    }
  }

  for (const term of glossary) {
    const hay = `${term.term} ${term.definition}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        kind: "glossary",
        href: `/glossary#${encodeURIComponent(term.term)}`,
        title: term.term,
        subtitle: "Glossary",
      });
    }
  }

  if (pickerHaystack().includes(q)) {
    hits.push({
      kind: "pattern",
      href: "/patterns#picker",
      title: "What is your shape?",
      subtitle: "Pattern picker",
    });
  }

  return hits;
}
