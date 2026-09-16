import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/socials";

export function SiteFooter({ asOf }: { asOf: string }) {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
        <p className="max-w-xl leading-relaxed">
          Field notes compiled {asOf} by Saleh Mashal. Drafts move; RFCs do not
          stay alone on the shelf. Check{" "}
          <a
            className="text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            href="https://datatracker.ietf.org/"
          >
            datatracker.ietf.org
          </a>{" "}
          and the issuing SDO before you implement. This is an educational map,
          not a standards document.
        </p>
        <div className="flex flex-col gap-3 md:items-end">
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
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
            aria-label="Outbound links"
          >
            {SOCIAL_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="inline-flex items-center gap-1.5 text-sm hover:text-foreground"
                >
                  <Icon className="size-3.5" aria-hidden />
                  {item.text}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
