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

const kindBoost: Record<SearchHitKind, number> = {
  spec: 5,
  glossary: 4,
  flow: 3,
  pattern: 2,
  compare: 1,
};

function score(title: string, subtitle: string, hay: string, q: string, kind: SearchHitKind): number {
  const t = title.toLowerCase();
  const s = subtitle.toLowerCase();
  const boost = kindBoost[kind];
  if (t === q) return 1000 + boost;
  if (t.startsWith(q) || t.split(/[\s/]+/).includes(q)) return 800 + boost;
  if (t.includes(q)) return 600 + boost;
  if (s === q || s.startsWith(q) || s.includes(q)) return 400 + boost;
  if (hay.includes(q)) return 200 + boost;
  return 0;
}

export function searchAll(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: (SearchHit & { score: number })[] = [];

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
    const item: SearchHit = {
      kind: "spec",
      href: `/specs/${spec.slug}`,
      title: spec.shortName,
      subtitle: spec.id,
    };
    const n = score(item.title, item.subtitle, hay, q, item.kind);
    if (n > 0) scored.push({ ...item, score: n });
  }

  for (const pattern of patterns) {
    const hay = patternHaystack(pattern);
    const item: SearchHit = {
      kind: "pattern",
      href: `/patterns/${pattern.slug}`,
      title: pattern.title,
      subtitle: pattern.matrixTitle,
    };
    const n = score(item.title, item.subtitle, hay, q, item.kind);
    if (n > 0) scored.push({ ...item, score: n });
  }

  for (const flow of flows) {
    const hay =
      `${flow.title} ${flow.summary} ${flow.caveats} ${flow.question ?? ""} ${flow.takeaway ?? ""} ${flow.protocol ?? ""} ${flow.detail?.join(" ") ?? ""} ${flow.slug}`.toLowerCase();
    const item: SearchHit = {
      kind: "flow",
      href: `/flows/${flow.slug}`,
      title: flow.title,
      subtitle: flow.pattern,
    };
    const n = score(item.title, item.subtitle, hay, q, item.kind);
    if (n > 0) scored.push({ ...item, score: n });
  }

  for (const compare of compares) {
    const hay = `${compare.title} ${compare.subtitle} ${compare.takeaway} ${compare.fieldNotes?.map((n) => `${n.title} ${n.body}`).join(" ") ?? ""}`.toLowerCase();
    const item: SearchHit = {
      kind: "compare",
      href: `/compare/${compare.slug}`,
      title: compare.title,
      subtitle: "Comparison",
    };
    const n = score(item.title, item.subtitle, hay, q, item.kind);
    if (n > 0) scored.push({ ...item, score: n });
  }

  for (const term of glossary) {
    const hay = `${term.term} ${term.definition} ${term.seeAlso?.join(" ") ?? ""} ${term.seeFlows?.join(" ") ?? ""}`.toLowerCase();
    const item: SearchHit = {
      kind: "glossary",
      href: `/glossary#${encodeURIComponent(term.term)}`,
      title: term.term,
      subtitle: "Glossary",
    };
    const n = score(item.title, item.subtitle, hay, q, item.kind);
    if (n > 0) scored.push({ ...item, score: n });
  }

  if (pickerHaystack().includes(q)) {
    scored.push({
      kind: "pattern",
      href: "/patterns#picker",
      title: "What is your shape?",
      subtitle: "Pattern picker",
      score: 150,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return scored.map((item) => ({
    kind: item.kind,
    href: item.href,
    title: item.title,
    subtitle: item.subtitle,
  }));
}
