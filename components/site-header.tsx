"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Columns2,
  GitBranch,
  LayoutGrid,
  Library,
  Map,
  Menu,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Map", icon: Map },
  { href: "/catalog", label: "Catalog", icon: Library },
  { href: "/patterns", label: "Patterns", icon: LayoutGrid },
  { href: "/compare", label: "Compare", icon: Columns2 },
  { href: "/flows", label: "Flows", icon: GitBranch },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
  { href: "/search", label: "Search", icon: Search },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <Map className="size-3.5" aria-hidden />
          </span>
          <span className="font-heading text-lg tracking-tight">
            Agent Identity
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Authn / Authz
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Navigate</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
