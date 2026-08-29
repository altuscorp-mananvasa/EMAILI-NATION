import type { SeedModule } from "./types";

export const SUBJECTS: SeedModule[] = [
  { category: "subject", variant_key: "A", weight: 1, body: "{{firstName}}, the 3.5 hours that can change how you run {{company}}" },
  { category: "subject", variant_key: "B", weight: 1, body: "{{firstName}} — a small invite from Manan (Productivity Shastra)" },
  { category: "subject", variant_key: "C", weight: 1, body: "Founders in {{city}} keep asking for this — figured I'd loop you in" },
  { category: "subject", variant_key: "D", weight: 1, body: "Free session, {{firstName}} — the one that fixes the 'always-on' founder problem" },
  { category: "subject", variant_key: "E", weight: 1, body: "{{firstName}}, what if next week had 2 extra hours in it?" },
  { category: "subject", variant_key: "F", weight: 1, body: "Quick note, {{firstName}} — no pitch, just an Orientation invite" },
  { category: "subject", variant_key: "G", weight: 1, body: "For {{role}}s in {{industry}}: an honest 3.5-hr session in {{campaignEnd}}" },
  { category: "subject", variant_key: "H", weight: 1, body: "{{firstName}} — saw your work at {{company}}, wanted to share something" },
  { category: "subject", variant_key: "I", weight: 1, body: "An open invite from CA Manan Vasa — for founders only" },
  { category: "subject", variant_key: "J", weight: 1, body: "{{firstName}}, scale like a system — not like a founder" },
  { category: "subject", variant_key: "K", weight: 1, body: "Saving 2 hours/day for life — that's the actual promise, {{firstName}}" },
  { category: "subject", variant_key: "L", weight: 1, body: "A free Productivity Shastra Orientation is open this {{campaignEnd}}" },
];
