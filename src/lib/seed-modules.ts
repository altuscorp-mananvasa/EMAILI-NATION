export type SeedModule = {
  category: "subject" | "hook" | "story" | "cta" | "proof" | "signoff";
  variant_key: string;
  weight: number;
  body: string;
};

import { SUBJECTS } from "./seed/subjects";
import { HOOKS } from "./seed/hooks";
import { HOOKS_PART2 } from "./seed/hooks2";
import { STORIES } from "./seed/stories";
import { PROOFS, CTAS, SIGNOFFS } from "./seed/proofs";

export { SUBJECTS, HOOKS, HOOKS_PART2, STORIES, PROOFS, CTAS, SIGNOFFS };

export const ALL_SEED_MODULES: SeedModule[] = [
  ...SUBJECTS,
  ...HOOKS,
  ...HOOKS_PART2,
  ...STORIES,
  ...PROOFS,
  ...CTAS,
  ...SIGNOFFS,
];
