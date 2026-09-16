import Link from "next/link";
import {
  isDraftChurn,
  protocolDisplayName,
  resolveSpec,
} from "@/lib/patterns";
import type { PatternProtocol } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProtocolPill({
  item,
  variant = "default",
}: {
  item: PatternProtocol;
  variant?: "default" | "anti";
}) {
  const spec = resolveSpec(item.slug);
  const name = protocolDisplayName(item);
  if (!name) return null;

  const churn = isDraftChurn(spec);
  const className = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] leading-tight",
    variant === "anti"
      ? "border-destructive/35 text-muted-foreground hover:border-destructive/55"
      : "border-border hover:border-primary/50 hover:text-foreground",
  );

  const inner = (
    <>
      <span className="truncate">{name}</span>
      {churn ? (
        <span className="shrink-0 text-[9px] uppercase tracking-wider text-brass">
          draft
        </span>
      ) : null}
    </>
  );

  if (spec) {
    return (
      <Link href={`/specs/${spec.slug}`} className={className}>
        {inner}
      </Link>
    );
  }

  return <span className={className}>{inner}</span>;
}
