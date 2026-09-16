import type { FlowStep } from "@/lib/types";

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
            </p>
            <p className="mt-1 text-sm leading-relaxed">{step.action}</p>
            {step.note ? (
              <p className="mt-2 text-sm text-muted-foreground">{step.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
