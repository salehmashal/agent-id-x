import Link from "next/link";
import { PatternToy } from "@/components/explainers/pattern-toy";
import { ProtocolPill } from "@/components/pattern-protocol-pills";
import { matrixColumns, protocolsByFit } from "@/lib/patterns";
import {
  MATRIX_SIGNAL_LABEL,
  type DeploymentPattern,
  type MatrixSignal,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const signalClass: Record<MatrixSignal, string> = {
  yes: "text-moss",
  no: "text-muted-foreground",
  sometimes: "text-brass",
};

function Signal({ value }: { value: MatrixSignal }) {
  return (
    <span className={cn("font-mono text-[11px] uppercase", signalClass[value])}>
      {MATRIX_SIGNAL_LABEL[value]}
    </span>
  );
}

export function PatternMatrix({ patterns }: { patterns: DeploymentPattern[] }) {
  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-xl border border-border/80 md:block">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Deployment patterns versus user presence, authorization server,
            workload identity, portable agent identity, and primary protocols.
            Each row includes a compact topology of the actors.
          </caption>
          <thead className="bg-card/80">
            <tr className="border-b border-border/80">
              <th className="sticky left-0 bg-card/95 px-3 py-3 font-heading font-medium">
                Pattern
              </th>
              {matrixColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 font-heading font-medium"
                  title={column.hint}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-3 font-heading font-medium">
                Primary protocols
              </th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((pattern) => (
              <tr
                key={pattern.slug}
                className="border-b border-border/60 last:border-0 hover:bg-muted/20"
              >
                <th className="sticky left-0 bg-background/95 px-3 py-3 font-heading font-medium">
                  <Link
                    href={`#${pattern.slug}`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {pattern.matrixTitle}
                  </Link>
                  <div className="mt-2 font-normal">
                    <PatternToy topology={pattern.topology} />
                  </div>
                </th>
                {matrixColumns.map((column) => (
                  <td key={column.key} className="px-3 py-3">
                    <Signal value={pattern[column.key]} />
                  </td>
                ))}
                <td className="px-3 py-3">
                  <ProtocolPillListCompact pattern={pattern} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {patterns.map((pattern) => (
          <li
            key={pattern.slug}
            className="rounded-xl border border-border/80 bg-card/40 p-4"
          >
            <Link
              href={`#${pattern.slug}`}
              className="font-heading text-base text-foreground underline-offset-4 hover:underline"
            >
              {pattern.matrixTitle}
            </Link>
            <div className="mt-2">
              <PatternToy topology={pattern.topology} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {matrixColumns.map((column) => (
                <div key={column.key}>
                  <dt className="text-muted-foreground">{column.label}</dt>
                  <dd className="mt-0.5">
                    <Signal value={pattern[column.key]} />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3">
              <ProtocolPillListCompact pattern={pattern} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProtocolPillListCompact({
  pattern,
}: {
  pattern: DeploymentPattern;
}) {
  const items = protocolsByFit(pattern, "primary");
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <li key={`${item.slug ?? item.label}-${index}`}>
          <ProtocolPill item={item} />
        </li>
      ))}
    </ul>
  );
}
