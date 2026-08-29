"use client";

import { useState, useTransition } from "react";
import type { Contact } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";

export function ContactsTable({ rows }: { rows: Contact[] }) {
  const [filter, setFilter] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const filtered = rows.filter((c) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.first_name ?? "").toLowerCase().includes(q) ||
      (c.last_name ?? "").toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.city ?? "").toLowerCase().includes(q)
    );
  });

  const onDelete = (id: string) => {
    if (!confirm("Delete this contact?")) return;
    start(() => {
      void (async () => {
        await fetch(`/api/contacts/${id}`, { method: "DELETE" });
        router.refresh();
      })();
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
      <div className="border-b border-ink-100 p-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by email, name, company, city…"
          className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-saffron-500 focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-ink-400">No contacts match your filter.</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-t border-ink-100">
                  <td className="px-4 py-2 font-mono text-xs">{c.email}</td>
                  <td className="px-4 py-2">{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-2">{c.company ?? "—"}</td>
                  <td className="px-4 py-2">{c.role ?? "—"}</td>
                  <td className="px-4 py-2">{c.industry ?? "—"}</td>
                  <td className="px-4 py-2">{c.city ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDelete(c.id)}
                      disabled={pending}
                      className="text-xs text-ink-500 hover:text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusClass(s: string) {
  switch (s) {
    case "active":       return "bg-green-100 text-green-700";
    case "unsubscribed": return "bg-ink-100 text-ink-600";
    case "bounced":      return "bg-red-100 text-red-700";
    case "replied":      return "bg-saffron-100 text-saffron-700";
    default:             return "bg-ink-100 text-ink-600";
  }
}
