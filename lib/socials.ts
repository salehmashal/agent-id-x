import { createLucideIcon } from "lucide-react";

/**
 * Lucide v1 dropped trademarked brand marks. These are the last official
 * Github / Linkedin paths, rebuilt with lucide-react's icon factory so they
 * match stroke, size, and currentColor of the rest of the chrome.
 */
export const Github = createLucideIcon("github", [
  [
    "path",
    {
      d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
    },
  ],
  ["path", { d: "M9 18c-4.51 2-5-2-7-2" }],
]);

export const Linkedin = createLucideIcon("linkedin", [
  [
    "path",
    {
      d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z",
    },
  ],
  ["rect", { width: "4", height: "12", x: "2", y: "9" }],
  ["circle", { cx: "4", cy: "4", r: "2" }],
]);

export const SOCIAL_LINKS = [
  {
    href: "https://github.com/salehmashal/agent-id-x",
    label: "GitHub repository for Agent Identity Landscape",
    text: "Source on GitHub",
    icon: Github,
  },
  {
    href: "https://www.linkedin.com/in/saleh-mashal-30305411b/",
    label: "Saleh Mashal on LinkedIn",
    text: "Saleh Mashal on LinkedIn",
    icon: Linkedin,
  },
] as const;
