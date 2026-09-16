import type { SpecDeepDive } from "@/lib/types";
import { agentAdjacentNotes } from "@/lib/deep-dives/adjacent";
import {
  aauthDeepDive,
  aauthR3DeepDive,
  httpSignatureKeysDeepDive,
} from "@/lib/deep-dives/aauth";
import { foundationDeepDives } from "@/lib/deep-dives/foundation";
import { oauthExtensionDeepDives } from "@/lib/deep-dives/oauth-extensions";
import { openidDeepDives } from "@/lib/deep-dives/openid";
import { protocolDeepDives } from "@/lib/deep-dives/protocols";
import { workloadDeepDives } from "@/lib/deep-dives/workload";

export { agentAdjacentNotes };

export const deepDives: Record<string, SpecDeepDive> = {
  ...foundationDeepDives,
  ...oauthExtensionDeepDives,
  aauth: aauthDeepDive,
  "http-signature-keys": httpSignatureKeysDeepDive,
  "aauth-r3": aauthR3DeepDive,
  ...openidDeepDives,
  ...workloadDeepDives,
  ...protocolDeepDives,
};
