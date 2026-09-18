import type { MetadataRoute } from "next";
import { compares } from "@/lib/compares";
import { flows } from "@/lib/flows";
import { patterns } from "@/lib/patterns";
import { specs } from "@/lib/specs";
import {
  canonicalUrl,
  INDEX_PATHS,
  SITEMAP_LASTMOD,
} from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = SITEMAP_LASTMOD;
  const index: MetadataRoute.Sitemap = INDEX_PATHS.map((path, i) => ({
    url: canonicalUrl(path),
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : i < 4 ? 0.8 : 0.6,
  }));

  const specEntries: MetadataRoute.Sitemap = specs.map((spec) => ({
    url: canonicalUrl(`/specs/${spec.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: spec.featured ? 0.8 : 0.6,
  }));

  const patternEntries: MetadataRoute.Sitemap = patterns.map((pattern) => ({
    url: canonicalUrl(`/patterns/${pattern.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const flowEntries: MetadataRoute.Sitemap = flows.map((flow) => ({
    url: canonicalUrl(`/flows/${flow.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const compareEntries: MetadataRoute.Sitemap = compares.map((view) => ({
    url: canonicalUrl(`/compare/${view.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...index,
    ...specEntries,
    ...patternEntries,
    ...flowEntries,
    ...compareEntries,
  ];
}
