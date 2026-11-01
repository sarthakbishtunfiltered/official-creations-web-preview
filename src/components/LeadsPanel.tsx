import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { getNiche } from "../data/niches";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  deleteLead,
  leadGeneratorUrl,
  updateLead,
  whatsappChatUrl,
  whatsappDigits,
} from "../lib/leads";
import type { Lead, LeadChanges, LeadStatus } from "../lib/leads";
import { localPreviewUrl, previewUrl } from "../lib/previewStore";

const primaryButton =
  "inline-block cursor-pointer rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50";
const quietButton =
  "inline-block cursor-pointer rounded-lg border border-[#D5CFD0] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-[#F4EFEF] disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton =
  "cursor-pointer rounded-lg border border-red-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-amber-100 text-amber-900",
  contacted: "bg-sky-100 text-sky-900",
  sample_sent: "bg-violet-100 text-violet-900",
  won: "bg-emerald-100 text-emerald-900",
  lost: "bg-red-100 text-red-900",
};

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

interface PanelProps {
  leads: Lead[];
  // Set when the leads functions are missing from the database.
  note: string;
  isOwner: boolean;
  onChanged: (lead: Lead) => void;
  onRemoved: (id: string) => void;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}

type Filter = "all" | LeadStatus;

export function LeadsPanel({ leads, note, isOwner, onChanged, onRemoved, onError, onNotice }: PanelProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { all: leads.length, new: 0, contacted: 0, sample_sent: 0, won: 0, lost: 0 };
    for (const lead of leads) result[lead.status] += 1;
    return result;
  }, [leads]);

  const query = search.trim().toLowerCase();
  const visible = leads.filter((lead) => {
    if (filter !== "all" && lead.status !== filter) return false;
    if (!query) return true;
    return [lead.name, lead.business_name, lead.phone, lead.city].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
          Website <span className="font-serif font-normal italic">leads</span>
        </h2>
        <p className="mt-2 text-[14px] font-medium text-[#6B6566]">
          Businesses that filled in the form on the homepage. Contact them, make their sample, and track the deal.
        </p>
      </div>

      {note && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <p className="text-[14px] font-bold">Leads aren&rsquo;t set up in the database yet</p>
          <p className="mt-1 text-[13px] font-medium [overflow-wrap:anywhere]">{note}</p>
        </section>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter leads" className="flex flex-wrap gap-2">
          {(["all", ...LEAD_STATUSES] as Filter[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                filter === id
                  ? "bg-[#111111] text-white"
                  : "border border-[#D5CFD0] bg-white/70 text-[#111111] hover:bg-white"
              }`}
            >
              {id === "all" ? "All" : LEAD_STATUS_LABELS[id]} <span className="opacity-60">{counts[id]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search name, business, phone or city"
          aria-label="Search leads"
          className="w-full rounded-lg border border-[#D5CFD0] bg-white px-4 py-2 text-[13px] font-medium placeholder:text-[#A09A9B] focus:border-[#111111]/40 focus:outline-none lg:w-72"
        />
      </div>

      {visible.length === 0 ? (
        <section className="rounded-2xl border border-[#D5CFD0] bg-white/70 p-8 text-center">
          <p className="text-[15px] font-semibold">
            {leads.length === 0 ? "No leads yet." : "No leads match this filter."}
          </p>
          {leads.length === 0 && (
            <p className="mx-auto mt-1 max-w-md text-[13px] font-medium text-[#6B6566]">
              When a visitor sends the form on the homepage, it shows up here. Open the homepage in a private window to
              try it yourself.
            </p>
          )}
        </section>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              isOwner={isOwner}
              onChanged={onChanged}
              onRemoved={onRemoved}
              onError={onError}
              onNotice={onNotice}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface CardProps {
  lead: Lead;
  isOwner: boolean;
  onChanged: (lead: Lead) => void;
  onRemoved: (id: string) => void;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}

function LeadCard({ lead, isOwner, onChanged, onRemoved, onError, onNotice }: CardProps) {
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? "");

  const niche = getNiche(lead.niche);
  const notesChanged = notes.trim() !== (lead.notes ?? "").trim();
  const token = lead.preview_token;

  async function save(changes: LeadChanges, done: string) {
    setBusy(true);
    try {
      const updated = await updateLead(lead.id, changes);
      onChanged(updated);
      onNotice(done);
    } catch (error) {
      onError(error instanceof Error ? error.message : "The lead could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete the lead from ${lead.name} (${lead.business_name})? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteLead(lead.id);
      onRemoved(lead.id);
      onNotice("Lead deleted.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "The lead could not be deleted.");
      setBusy(false);
    }
  }

  async function copyPreviewLink() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(previewUrl(token));
      onNotice("Preview link copied.");
    } catch {
      onError("Your browser blocked copying. Use Open preview, then copy the address from the tab.");
    }
  }

  const message = token
    ? `Hi ${lead.name}, here is the sample website we made for ${lead.business_name}: ${previewUrl(token)}`
    : `Hi ${lead.name}, thank you for your interest in a website for ${lead.business_name}. This is Official Creations. When is a good time to talk?`;

  const facts = [
    lead.budget && `Budget: ${lead.budget}`,
    lead.timeline && `Timeline: ${lead.timeline}`,
    lead.design && `Design: ${lead.design === "premium" ? "Premium" : "Simple"}`,
  ].filter(Boolean);

  return (
    <li className="rounded-2xl border border-[#D5CFD0] bg-white/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[18px] font-bold [overflow-wrap:anywhere]">{lead.business_name}</h3>
            <span className="rounded-full bg-[#111111] px-2.5 py-0.5 text-[11px] font-bold text-white">
              {lead.kind === "sample" ? "Sample request" : "Order request"}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_TONE[lead.status]}`}>
              {LEAD_STATUS_LABELS[lead.status]}
            </span>
          </div>
          <p className="mt-1 text-[13px] font-medium text-[#6B6566]">
            {niche?.label ?? lead.niche} · {lead.city} · received {timeAgo(lead.created_at)}
          </p>
        </div>

        <label className="flex items-center gap-2 text-[12px] font-bold text-[#6B6566]">
          Status
          <select
            value={lead.status}
            disabled={busy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              void save({ status: e.target.value as LeadStatus }, "Status updated.")
            }
            className="rounded-lg border border-[#D5CFD0] bg-white px-3 py-2 text-[13px] font-semibold text-[#111111] focus:border-[#111111]/40 focus:outline-none disabled:opacity-50"
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-[14px] font-medium sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-[#6B6566]">Contact</dt>
          <dd className="[overflow-wrap:anywhere]">
            {lead.name} · {lead.phone}
          </dd>
        </div>
        {lead.email && (
          <div className="flex gap-2">
            <dt className="text-[#6B6566]">Email</dt>
            <dd className="[overflow-wrap:anywhere]">
              <a href={`mailto:${lead.email}`} className="underline underline-offset-4">
                {lead.email}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {facts.length > 0 && <p className="mt-2 text-[13px] font-medium text-[#6B6566]">{facts.join(" · ")}</p>}

      {lead.details && (
        <p className="mt-3 whitespace-pre-line rounded-xl bg-[#F4EFEF]/70 px-4 py-3 text-[14px] font-medium leading-[1.6] [overflow-wrap:anywhere]">
          {lead.details}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor={`notes-${lead.id}`} className="text-[12px] font-bold text-[#6B6566]">
          Team notes
        </label>
        <textarea
          id={`notes-${lead.id}`}
          rows={2}
          value={notes}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
          placeholder="What was said, what to do next"
          className="mt-1 w-full rounded-xl border border-[#D5CFD0] bg-white px-4 py-2.5 text-[14px] font-medium placeholder:text-[#A09A9B] focus:border-[#111111]/40 focus:outline-none"
        />
        {notesChanged && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void save({ notes: notes.trim() }, "Notes saved.")}
            className={`${quietButton} mt-2`}
          >
            Save notes
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {whatsappDigits(lead.phone) && (
          <a href={whatsappChatUrl(lead.phone, message)} target="_blank" rel="noopener noreferrer" className={primaryButton}>
            {token ? "Send preview on WhatsApp" : "WhatsApp"}
          </a>
        )}
        <a href={`tel:+${whatsappDigits(lead.phone)}`} className={quietButton}>
          Call
        </a>

        {token ? (
          <>
            <button type="button" onClick={() => void copyPreviewLink()} className={quietButton}>
              Copy preview link
            </button>
            <a href={localPreviewUrl(token)} target="_blank" rel="noopener noreferrer" className={quietButton}>
              Open preview
            </a>
            <a href={leadGeneratorUrl(lead.id)} className={quietButton}>
              Edit preview
            </a>
          </>
        ) : (
          <a href={leadGeneratorUrl(lead.id)} className={quietButton}>
            Create preview
          </a>
        )}

        {isOwner && (
          <button type="button" disabled={busy} onClick={() => void remove()} className={`${dangerButton} ml-auto`}>
            Delete
          </button>
        )}
      </div>

      {lead.handled_by_email && (
        <p className="mt-3 text-[12px] font-medium text-[#A09A9B]">Last updated by {lead.handled_by_email}</p>
      )}
    </li>
  );
}
