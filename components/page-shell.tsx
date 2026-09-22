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
    <div className="prose-study mt-4 space-y-4 text-base text-foreground/80 md:text-lg">
      {children}
    </div>
  );
}

/** Numbered home-map block: one memorable sentence, then the board. */
export function MapSection({
  id,
  index,
  title,
  remember,
  children,
}: {
  id?: string;
  index: string;
  title: string;
  remember: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24 md:mt-20">
      <header className="mb-6 flex gap-4 border-b border-dashed border-border pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
          {index}
        </p>
        <div className="min-w-0">
          <h2 className="font-heading text-2xl leading-tight md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/85">
            {remember}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}
