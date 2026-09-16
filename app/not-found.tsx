import Link from "next/link";
import { PageKicker, PageShell, PageTitle } from "@/components/page-shell";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <PageKicker>Missing</PageKicker>
      <PageTitle>This page is not in the catalog</PageTitle>
      <p className="mt-4 max-w-xl text-muted-foreground">
        The slug may have been typed by hand, or a spec was renamed. The
        catalog and search are the reliable indexes.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/catalog" className={buttonVariants()}>
          Catalog
        </Link>
        <Link href="/search" className={buttonVariants({ variant: "outline" })}>
          Search
        </Link>
      </div>
    </PageShell>
  );
}
