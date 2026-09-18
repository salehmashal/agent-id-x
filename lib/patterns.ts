import { getFlow } from "@/lib/flows";
import { getSpec } from "@/lib/specs";
import type {
  AgentFlow,
  DeploymentPattern,
  HostVariant,
  PatternProtocol,
  ProtocolFit,
  Spec,
} from "@/lib/types";

export const matrixColumns = [
  {
    key: "userPresent" as const,
    label: "User present?",
    hint: "A human is in the loop for this call — in the same browser, or on another device.",
  },
  {
    key: "asInPath" as const,
    label: "AS in path?",
    hint: "An OAuth/OIDC authorization server issues the credential the resource accepts.",
  },
  {
    key: "workloadIdentity" as const,
    label: "Workload identity?",
    hint: "SPIFFE/WIMSE names the binary. That is not the user, and not a portable AAuth agent token.",
  },
  {
    key: "agentPortableIdentity" as const,
    label: "Agent-portable identity?",
    hint: "The caller has an identifier that travels across authorization servers — an AAuth agent token, not an AS-local client_id.",
  },
];
