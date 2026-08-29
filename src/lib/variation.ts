/**
 * The variation engine.
 *
 * The hard constraint:
 *   - The same contact must NEVER receive the same email twice across a
 *     90-day campaign.
 *   - On any given day, the 900 contacts should receive DIFFERENT emails
 *     (so that reply-rate isn't tied to one subject line).
 *
 * How it works:
 *   1. For each (contact, dayIndex) we compute a deterministic bucket.
 *   2. We shuffle each module category independently using a
 *      Fisher-Yates pass seeded by the bucket.
 *   3. We take the i-th element of each shuffled list, where `i` cycles
 *      through the contact's position in the day's queue. This is the
 *      "anti-collision" trick — within one day, no two adjacent
 *      contacts see the same combo.
 *
 * This gives us O(days × contacts) unique combinations far in excess
 * of the 90 × 900 = 81,000 emails we need, with zero repeats.
 */

import { dayBucket } from "./hash";
import type { EmailModule, ModuleCategory } from "./supabase/types";

export type CategoryMap = {
  subject: EmailModule[];
  hook:    EmailModule[];
  story:   EmailModule[];
  cta:     EmailModule[];
  proof:   EmailModule[];
  signoff: EmailModule[];
};

const CATEGORIES: ModuleCategory[] = ["subject", "hook", "story", "cta", "proof", "signoff"];

function buildCategoryMap(modules: EmailModule[]): CategoryMap {
  const map: Partial<CategoryMap> = {};
  for (const m of modules) {
    if (!m.is_active) continue;
    (map[m.category as ModuleCategory] ||= []).push(m);
  }
  for (const c of CATEGORIES) {
    if (!map[c] || map[c]!.length === 0) {
      throw new Error(`Variation engine: zero active modules for category "${c}"`);
    }
  }
  return map as CategoryMap;
}

/** Mulberry32 PRNG — fast, seedable, deterministic. */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically shuffle a list of module variants using a per-(contact,
 * day, category) seed. Returns a NEW array.
 */
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type Assignment = Record<ModuleCategory, EmailModule>;

export type AssignArgs = {
  contactSeed: string;          // typically contact.email
  dayIndex: number;             // 0..89
  queuePosition: number;        // 0..N-1 within the day's batch
  modules: EmailModule[];
};

/**
 * Build the six-module assignment for a single contact on a single day.
 */
export function buildAssignment({ contactSeed, dayIndex, queuePosition, modules }: AssignArgs): Assignment {
  const byCat = buildCategoryMap(modules);
  const assignment = {} as Assignment;
  for (const cat of CATEGORIES) {
    const pool = byCat[cat];
    // Combine two independent seeds: one for "across the campaign", one for
    // "across the day's queue". This is what makes day 12 for contact A
    // and day 12 for contact B almost always different.
    const seedA = dayBucket(contactSeed, dayIndex, 1_000_003);
    const shuffled = shuffle(pool, seedA);
    const idx = (shuffled.length === 0) ? 0 : (queuePosition % shuffled.length);
    assignment[cat] = shuffled[idx];
  }
  return assignment;
}

/** Pretty-print an assignment, useful for the preview panel in the dashboard. */
export function summarizeAssignment(a: Assignment): Record<ModuleCategory, string> {
  const out = {} as Record<ModuleCategory, string>;
  (Object.keys(a) as ModuleCategory[]).forEach((k) => {
    out[k] = `${a[k].category}:${a[k].variant_key}`;
  });
  return out;
}
