import Link from "next/link";
import { notFound } from "next/navigation";
import { PatternSection } from "@/components/pattern-section";
import { PageKicker, PageShell } from "@/components/page-shell";
import { getPattern, patterns } from "@/lib/patterns";
import { buttonVariants } from "@/components/ui/button";

export function generateStaticParams() {
  return patterns.map((pattern) => ({ slug: pattern.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) return { title: "Not found" };
  return { title: pattern.title, description: pattern.summary };
}

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) notFound();

  return (
    <PageShell>
      <PageKicker>Deployment pattern</PageKicker>
      <p className="mt-2">
        <Link
          href="/patterns"
          className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          All patterns
        </Link>
      </p>
      <div className="mt-6">
        <PatternSection pattern={pattern} titleAs="h1" />
      </div>
      <p className="mt-8">
        <Link href="/patterns" className={buttonVariants({ variant: "outline" })}>
          Back to the matrix
        </Link>
      </p>
    </PageShell>
  );
}
