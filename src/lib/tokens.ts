/**
 * Personalization tokens. We support a small, explicit set — never eval
 * arbitrary user input inside template bodies. Each token maps to a
 * function that receives the contact + (optionally) campaign context.
 *
 * Syntax inside templates:   {{firstName}}   {{company}}   {{city}}
 */

import type { Contact, Campaign } from "@/lib/supabase/types";

export type TokenContext = {
  contact: Contact;
  campaign?: Pick<Campaign, "name" | "end_date">;
  /** When set, used to produce a friendly day-of-campaign reference. */
  dayIndex?: number;
};

const safe = (s: string | null | undefined, fallback = ""): string =>
  (s ?? "").toString().trim() || fallback;

const titleCase = (s: string): string =>
  s
    .toLowerCase()
    .split(/\s+/)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");

const HANDLERS: Record<string, (c: TokenContext) => string> = {
  firstName: ({ contact }) => titleCase(safe(contact.first_name, "there")),
  lastName:  ({ contact }) => titleCase(safe(contact.last_name)),
  fullName:  ({ contact }) =>
    titleCase([safe(contact.first_name), safe(contact.last_name)].filter(Boolean).join(" ")) || "there",
  company:   ({ contact }) => safe(contact.company),
  role:      ({ contact }) => safe(contact.role, "Founder"),
  industry:  ({ contact }) => safe(contact.industry, "your industry"),
  city:      ({ contact }) => safe(contact.city, "India"),
  referrer:  ({ contact }) => titleCase(safe(contact.referrer_name, "a founder")),
  source:    ({ contact }) => safe(contact.source, "our network"),
  email:     ({ contact }) => contact.email,
  dayN:      ({ dayIndex }) => (typeof dayIndex === "number" ? `Day ${dayIndex + 1}` : "today"),
  campaignEnd: ({ campaign }) =>
    campaign?.end_date ? new Date(campaign.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "soon",
};

/** Replace every {{token}} in `input` using the provided context. */
export function renderTokens(input: string, ctx: TokenContext): string {
  return input.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g, (_m, name: string) => {
    const handler = HANDLERS[name];
    if (!handler) return `{{${name}}}`; // unknown tokens are left visible so authors can spot them
    return handler(ctx);
  });
}

/** List of supported token names — useful for the template-editor UI. */
export const SUPPORTED_TOKENS = Object.keys(HANDLERS);
