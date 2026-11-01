import type { AnimationActor, AnimationStep } from "@/lib/animations";

export function HopList({
  actors,
  steps,
}: {
  actors: AnimationActor[];
  steps: AnimationStep[];
}) {
  const labels = new Map(actors.map((actor) => [actor.id, actor.label]));
  return (
    <ol className="mt-4 space-y-2">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-relaxed"
        >
          <span className="mt-0.5 flex size-6 items-center justify-center rounded-full border border-primary/40 font-mono text-[11px] text-primary">
            {index + 1}
          </span>
          <p>
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {labels.get(step.from) ?? step.from}
              <span className="mx-1.5 text-primary">→</span>
              {labels.get(step.to) ?? step.to}
              {step.citation ? (
                <span className="ml-2 text-brass">{step.citation}</span>
              ) : null}
            </span>
            <span className="mt-0.5 block text-foreground/90">{step.action}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
