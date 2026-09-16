import { AauthModesBoard } from "@/components/explainers/aauth-modes-board";
import { Oauth21Board } from "@/components/explainers/oauth-21-board";
import { TokenHopBoard } from "@/components/explainers/token-hop-board";
import {
  A2aBoard,
  DpopBoard,
  McpBoard,
  OidcBoard,
} from "@/components/explainers/spec-boards";

const MAIN_EXPLAINERS = new Set([
  "aauth",
  "oauth-2-1",
  "oidc-core",
  "token-exchange",
  "dpop",
  "wimse-arch",
  "mcp-auth",
  "a2a",
]);

export function isMainExplainerSpec(slug: string): boolean {
  return MAIN_EXPLAINERS.has(slug);
}

export function SpecExplainer({ slug }: { slug: string }) {
  switch (slug) {
    case "aauth":
      return <AauthModesBoard />;
    case "oauth-2-1":
      return <Oauth21Board />;
    case "oidc-core":
      return <OidcBoard />;
    case "token-exchange":
      return <TokenHopBoard initial="oauth" />;
    case "dpop":
      return <DpopBoard />;
    case "wimse-arch":
      return <TokenHopBoard initial="wimse" />;
    case "mcp-auth":
      return <McpBoard />;
    case "a2a":
      return <A2aBoard />;
    default:
      return null;
  }
}
