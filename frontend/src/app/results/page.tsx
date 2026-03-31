"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000/api";

const SCENARIO_META: Record<string, { title: string; role: string; roleColor: string }> = {
  ux_design_01: {
    title: "Design System: Button Accessibility",
    role: "UX / Product",
    roleColor: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  },
  data_analyst_01: {
    title: "A/B Test: Ship or Hold?",
    role: "Data Analyst",
    roleColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  junior_swe_01: {
    title: "Code Review: Password Hashing",
    role: "Junior SWE",
    roleColor: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  },
  cybersec_01: {
    title: "Vulnerability Triage: SQL Injection",
    role: "Cybersecurity",
    roleColor: "bg-red-500/10 border-red-500/20 text-red-400",
  },
  hr_recruiter_01: {
    title: "Resume Screening: Employment Gap",
    role: "HR / Recruiter",
    roleColor: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  },
};

interface ScenarioStat {
  scenario_id: string;
  completions: number;
  avg_trust: number;
  avg_confidence: number;
}

interface Results {
  total_completions: number;
  by_scenario: ScenarioStat[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function LikertBar({ value, max = 7 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 5 ? "bg-red-500/70" : value >= 3.5 ? "bg-amber-500/70" : "bg-emerald-500/70";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-zinc-300 w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export default function ResultsPage() {
  const [data, setData] = useState<Results | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/results`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const avgTrustAll =
    data && data.by_scenario.length
      ? (data.by_scenario.reduce((s, r) => s + r.avg_trust * r.completions, 0) / data.total_completions).toFixed(2)
      : "—";

  const avgConfAll =
    data && data.by_scenario.length
      ? (data.by_scenario.reduce((s, r) => s + r.avg_confidence * r.completions, 0) / data.total_completions).toFixed(2)
      : "—";

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20 group-hover:bg-blue-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>North Star</span>
          <span className="text-zinc-700 text-xs hidden sm:block">/ Results</span>
        </Link>
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L3 6l4.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Run Evaluation
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>Aggregate Results</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
            Live data from all completed evaluation sessions. Every AI injection was deliberately incorrect — a high average trust score is evidence of measurable automation bias across participants.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-sm">
            Could not load results. Make sure the backend is reachable.
          </div>
        )}

        {!data && !error && (
          <div className="flex items-center gap-3 text-zinc-500 text-sm py-12 justify-center">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" />
            </svg>
            Loading...
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total Completions" value={data.total_completions} sub="across all scenarios" />
              <StatCard label="Avg AI Trust" value={avgTrustAll} sub="out of 7 — lower is better" />
              <StatCard label="Avg Confidence" value={avgConfAll} sub="out of 7" />
            </div>

            <div>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">By Scenario</h2>
              {data.by_scenario.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
                  <p className="text-zinc-500 text-sm mb-4">No completed sessions yet.</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Run the first evaluation
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.by_scenario.map((s) => {
                    const meta = SCENARIO_META[s.scenario_id];
                    return (
                      <div key={s.scenario_id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            {meta && (
                              <span className={`text-xs font-medium border px-1.5 py-0.5 rounded ${meta.roleColor} mb-2 inline-block`}>
                                {meta.role}
                              </span>
                            )}
                            <h3 className="text-sm font-semibold text-white">
                              {meta?.title ?? s.scenario_id}
                            </h3>
                          </div>
                          <span className="text-xs text-zinc-500 bg-zinc-800/80 px-2.5 py-1 rounded-md font-mono flex-shrink-0 ml-4">
                            {s.completions} {s.completions === 1 ? "session" : "sessions"}
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-zinc-500">Avg Trust in AI</span>
                              <span className="text-xs text-zinc-600">scale 1 — 7</span>
                            </div>
                            <LikertBar value={s.avg_trust} />
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-zinc-500">Avg Answer Confidence</span>
                              <span className="text-xs text-zinc-600">scale 1 — 7</span>
                            </div>
                            <LikertBar value={s.avg_confidence} />
                          </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-4 text-xs text-zinc-600">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500/70 inline-block" />Low bias risk</span>
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500/70 inline-block" />Moderate</span>
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/70 inline-block" />High automation bias</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <p className="text-xs text-zinc-600">All sessions contribute anonymously to aggregate data.</p>
              <Link
                href="/"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
              >
                Run an evaluation
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2.5L9 6 4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
