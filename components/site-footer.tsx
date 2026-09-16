import Link from "next/link";

export function SiteFooter({ asOf }: { asOf: string }) {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
        <p className="max-w-xl leading-relaxed">
          Field notes compiled {asOf}. Drafts move; RFCs do not stay alone on
          the shelf. Check{" "}
          <a
            className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            href="https://datatracker.ietf.org/"
          >
            datatracker.ietf.org
          </a>{" "}
          and the issuing SDO before you implement. This is an educational map,
          not a standards document.
        </p>
        <p className="font-mono text-xs uppercase tracking-wider">
          <Link href="/catalog" className="hover:text-foreground">
            Catalog
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href="/patterns" className="hover:text-foreground">
            Patterns
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href="/search" className="hover:text-foreground">
            Search
          </Link>
        </p>
      </div>
    </footer>
  );
}
