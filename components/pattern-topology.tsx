import { Piece } from "@/components/explainers/shared";
import type { PatternTopology } from "@/lib/types";

export function PatternTopologyDiagram({
  topology,
}: {
  topology: PatternTopology;
}) {
  const nodeById = new Map(topology.nodes.map((node) => [node.id, node]));

  return (
    <figure className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {topology.nodes.map((node) => (
          <Piece key={node.id} kind={node.kind} label={node.label} size="sm" />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {topology.edges.map((edge, index) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          return (
            <li
              key={`${edge.from}-${edge.to}-${index}`}
              className="grid gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"
            >
              <span className="min-w-0">
                {from ? (
                  <Piece kind={from.kind} label={from.label} size="sm" />
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {edge.from}
                  </span>
                )}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-brass md:text-center">
                <span className="hidden md:inline">→ </span>
                {edge.label}
                <span className="md:hidden"> →</span>
              </span>
              <span className="min-w-0 md:justify-self-end">
                {to ? (
                  <Piece kind={to.kind} label={to.label} size="sm" />
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {edge.to}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {topology.caption}
      </figcaption>
    </figure>
  );
}
