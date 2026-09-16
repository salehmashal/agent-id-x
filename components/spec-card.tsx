import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayerBadge,
  RelevanceBadge,
  StabilityBadge,
  StatusBadge,
} from "@/components/spec-badges";
import type { Spec } from "@/lib/types";
import { BookMarked } from "lucide-react";

export function SpecCard({ spec }: { spec: Spec }) {
  return (
    <Link href={`/specs/${spec.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/60 hover:ring-primary/25">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={spec.status} />
            <StabilityBadge stability={spec.stability} />
            <LayerBadge layer={spec.layer} />
            <RelevanceBadge relevance={spec.relevance} />
            {spec.deepDive ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                <BookMarked className="size-3" aria-hidden />
                Field guide
              </span>
            ) : null}
          </div>
          <CardTitle className="mt-2">{spec.shortName}</CardTitle>
          <CardDescription className="font-mono text-xs">
            {spec.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {spec.whyAgentCares}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
