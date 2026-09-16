"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LAYER_LABEL,
  RELEVANCE_LABEL,
  STATUS_LABEL,
  STABILITY_LABEL,
  type AgentRelevance,
  type Layer,
  type SpecStatus,
  type Stability,
} from "@/lib/types";

const statuses = Object.keys(STATUS_LABEL) as SpecStatus[];
const layers = Object.keys(LAYER_LABEL) as Layer[];
const relevances = Object.keys(RELEVANCE_LABEL) as AgentRelevance[];
const stabilities = Object.keys(STABILITY_LABEL) as Stability[];

function toggleParam(
  params: URLSearchParams,
  key: string,
  value: string,
  current: string[],
) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  params.delete(key);
  for (const item of next) params.append(key, item);
}

export function CatalogFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedStatus = searchParams.getAll("status");
  const selectedLayer = searchParams.getAll("layer");
  const selectedRelevance = searchParams.getAll("relevance");
  const selectedStability = searchParams.getAll("stability");
  const q = searchParams.get("q") ?? "";

  function update(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function Chip({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          active
            ? "inline-flex cursor-pointer rounded-full border border-primary bg-primary/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-foreground"
            : "inline-flex cursor-pointer rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }
      >
        {children}
      </button>
    );
  }

  const empty = resultCount === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          placeholder="Filter by name, RFC, or draft id"
          aria-label="Filter catalog"
          onChange={(event) =>
            update((params) => {
              const value = event.target.value;
              if (value) params.set("q", value);
              else params.delete("q");
            })
          }
        />
        <Button
          variant="outline"
          onClick={() => router.replace(pathname, { scroll: false })}
        >
          Reset
        </Button>
      </div>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Status
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((status) => (
            <Chip
              key={status}
              active={selectedStatus.includes(status)}
              onClick={() =>
                update((params) =>
                  toggleParam(params, "status", status, selectedStatus),
                )
              }
            >
              {STATUS_LABEL[status]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Layer
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {layers.map((layer) => (
            <Chip
              key={layer}
              active={selectedLayer.includes(layer)}
              onClick={() =>
                update((params) =>
                  toggleParam(params, "layer", layer, selectedLayer),
                )
              }
            >
              {LAYER_LABEL[layer]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Relevance to agents
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {relevances.map((relevance) => (
            <Chip
              key={relevance}
              active={selectedRelevance.includes(relevance)}
              onClick={() =>
                update((params) =>
                  toggleParam(params, "relevance", relevance, selectedRelevance),
                )
              }
            >
              {RELEVANCE_LABEL[relevance]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Stability
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {stabilities.map((stability) => (
            <Chip
              key={stability}
              active={selectedStability.includes(stability)}
              onClick={() =>
                update((params) =>
                  toggleParam(params, "stability", stability, selectedStability),
                )
              }
            >
              {STABILITY_LABEL[stability]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
        {empty ? "No specs match these filters." : `${resultCount} documents`}
      </p>
    </div>
  );
}
