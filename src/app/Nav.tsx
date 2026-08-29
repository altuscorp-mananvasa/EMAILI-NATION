"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",          label: "Home" },
  { href: "/contacts",  label: "Contacts" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/templates", label: "Templates" },
  { href: "/preview",   label: "Preview" },
  { href: "/logs",      label: "Logs" },
  { href: "/settings",  label: "Settings" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-6 py-3">
        <Link href="/" className="font-serif text-lg font-bold text-saffron-600">Productivity Shastra · Outreach</Link>
        <div className="flex gap-1 text-sm">
          {LINKS.slice(1).map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 ${active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
