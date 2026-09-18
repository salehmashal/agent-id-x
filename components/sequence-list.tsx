import type { FlowStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SequenceList({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li
          key={`${step.from}-${step.to}-${index}`}
          className="grid grid-cols-[auto_1fr] gap-3"
        >
          <span className="mt-0.5 flex size-7 items-center justify-center rounded-full border border-primary/40 font-mono text-xs text-primary">
            {index + 1}
          </span>
          <div className="rounded-lg border border-border/80 bg-card/50 p-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {step.from}
              <span className="mx-2 text-primary">→</span>
              {step.to}
              {step.citation ? (
                <span className="ml-2 text-primary">{step.citation}</span>
              ) : null}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{step.action}</p>
            {step.now ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.now}
              </p>
            ) : step.note ? (
              <p className="mt-2 text-sm text-muted-foreground">{step.note}</p>
            ) : null}
            {step.why ? (
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brass">
                  Why{" "}
                </span>
                {step.why}
              </p>
            ) : null}
            {step.caption ? (
              <p className="mt-2 border-l-2 border-brass pl-2 text-sm leading-relaxed text-foreground/90">
                {step.caption}
              </p>
            ) : null}
            {step.now && step.note && step.note !== step.now ? (
              <p className="mt-2 text-sm text-muted-foreground">{step.note}</p>
            ) : null}
            {step.chips && step.chips.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {step.chips.map((chip) => (
                  <li key={`${chip.source}:${chip.label}`}>
                    <span
                      title={
                        chip.hint ??
                        (chip.source === "from-spec"
                          ? "Noun from the spec"
                          : "Illustrative example")
                      }
                      className={cn(
                        "inline-flex max-w-full items-center rounded-md px-2 py-0.5 font-mono text-[11px] leading-snug",
                        chip.source === "from-spec"
                          ? "border border-border bg-card text-foreground"
                          : "border border-dashed border-muted-foreground/45 bg-muted/60 text-muted-foreground",
                      )}
                    >
                      {chip.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
