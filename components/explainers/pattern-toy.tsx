import { Piece } from "@/components/explainers/shared";
import type { PatternTopology } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PatternToy({
  topology,
  className,
}: {
  topology: PatternTopology;
  className?: string;
}) {
  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}
      title={topology.caption}
    >
      {topology.nodes.map((node, index) => (
        <span key={node.id} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span className="font-mono text-[10px] text-brass/50" aria-hidden>
              ·
            </span>
          ) : null}
          <Piece kind={node.kind} label={node.label} size="xs" />
        </span>
      ))}
    </div>
  );
}
