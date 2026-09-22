import { SequencePlayer } from "@/components/animations/sequence-player";
import { AauthModesBoard } from "@/components/explainers/aauth-modes-board";
import { Oauth21Board } from "@/components/explainers/oauth-21-board";
import { TokenHopBoard } from "@/components/explainers/token-hop-board";
import {
  A2aBoard,
  DpopBoard,
  McpBoard,
  OidcBoard,
} from "@/components/explainers/spec-boards";
import { ShareBar } from "@/components/share-bar";
import { getSpecAnimation, specHasAnimation } from "@/lib/animations";
import type { ShareTarget } from "@/lib/share";

const MAIN_BOARDS = new Set([
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
  return MAIN_BOARDS.has(slug) || specHasAnimation(slug);
}

function SpecBoard({ slug }: { slug: string }) {
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

export function SpecExplainer({
  slug,
  share,
}: {
  slug: string;
  share?: ShareTarget;
}) {
  const animation = getSpecAnimation(slug);
  const board = <SpecBoard slug={slug} />;

  return (
    <div className="space-y-6">
      {animation ? (
        <SequencePlayer
          key={animation.id}
          sequence={animation}
          share={share}
        />
      ) : share ? (
        <ShareBar path={share.path} title={share.title} />
      ) : null}
      {board}
    </div>
  );
}
