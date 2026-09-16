import type { ReactNode } from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-10 ${className}`}>
      {children}
    </div>
  );
}

export function PageKicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
      {children}
    </p>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-2 max-w-3xl font-heading text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
      {children}
    </h1>
  );
}

export function PageLead({ children }: { children: ReactNode }) {
  return (
    <p className="prose-study mt-4 text-base text-foreground/80 md:text-lg">
      {children}
    </p>
  );
}
