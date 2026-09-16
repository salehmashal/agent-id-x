import { Badge } from "@/components/ui/badge";
import {
  LAYER_LABEL,
  RELEVANCE_LABEL,
  STATUS_LABEL,
  STABILITY_LABEL,
  type Layer,
  type AgentRelevance,
  type SpecStatus,
  type Stability,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClass: Record<SpecStatus, string> = {
  rfc: "border-moss/40 bg-moss/15 text-moss",
  "wg-draft": "border-brass/40 bg-brass/15 text-brass",
  "individual-draft": "border-brass/30 bg-brass/10 text-brass",
  "oidf-final": "border-moss/40 bg-moss/15 text-moss",
  w3c: "border-chart-3/40 bg-chart-3/15 text-chart-3",
  protocol: "border-chart-3/40 bg-chart-3/15 text-chart-3",
};

export function StatusBadge({ status }: { status: SpecStatus }) {
  return (
    <Badge variant="outline" className={cn("font-mono text-[10px] uppercase", statusClass[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function LayerBadge({ layer }: { layer: Layer }) {
  return (
    <Badge variant="secondary" className="font-mono text-[10px] uppercase">
      {LAYER_LABEL[layer]}
    </Badge>
  );
}

export function RelevanceBadge({ relevance }: { relevance: AgentRelevance }) {
  return (
    <Badge variant="outline" className="font-mono text-[10px] uppercase">
      {RELEVANCE_LABEL[relevance]}
    </Badge>
  );
}

export function StabilityBadge({ stability }: { stability: Stability }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[10px] uppercase",
        stability === "stable"
          ? "border-moss/40 text-moss"
          : stability === "draft"
            ? "border-brass/40 text-brass"
            : "border-chart-3/40 text-chart-3",
      )}
    >
      {STABILITY_LABEL[stability]}
    </Badge>
  );
}
