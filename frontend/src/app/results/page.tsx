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

interface RecentSession {
  id: number;
  scenario_id: string;
  trust_rating: number;
  confidence_rating: number;
  completed_at: string;
}

interface Results {
  total_completions: number;
  by_scenario: ScenarioStat[];
  recent_sessions: RecentSession[];
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
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
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 4h4l-3.2 2.4 1.2 4L7 9 3.5 11.4l1.2-4L1.5 5h4L7 1z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">North Star</span>
          <span className="text-zinc-700 text-xs hidden sm:block">/ Results</span>
        </div>
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-md transition-colors"
        >
          Run Evaluation
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Aggregate Results</h1>
          <p className="text-sm text-zinc-400">
            Live data from all completed evaluation sessions. All AI injections were deliberately incorrect — high trust scores indicate measurable automation bias.
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
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total Completions" value={data.total_completions} sub="all scenarios" />
              <StatCard label="Avg AI Trust" value={avgTrustAll} sub="out of 7 (lower is better)" />
              <StatCard label="Avg Confidence" value={avgConfAll} sub="out of 7" />
            </div>

            {/* Per-scenario breakdown */}
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">By Scenario</h2>
              {data.by_scenario.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center text-zinc-500 text-sm">
                  No completed sessions yet. Run an evaluation to see data here.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.by_scenario.map((s) => {
                    const meta = SCENARIO_META[s.scenario_id];
                    return (
                      <div key={s.scenario_id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            {meta && (
                              <span className={`text-xs font-medium border px-1.5 py-0.5 rounded ${meta.roleColor} mb-1.5 inline-block`}>
                                {meta.role}
                              </span>
                            )}
                            <h3 className="text-sm font-semibold text-white">
                              {meta?.title ?? s.scenario_id}
                            </h3>
                          </div>
                          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded font-mono">
                            {s.completions} {s.completions === 1 ? "session" : "sessions"}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs text-zinc-500">Avg Trust in AI</span>
                              <span className="text-xs text-zinc-500">1 — 7</span>
                            </div>
                            <LikertBar value={s.avg_trust} />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs text-zinc-500">Avg Answer Confidence</span>
                              <span className="text-xs text-zinc-500">1 — 7</span>
                            </div>
                            <LikertBar value={s.avg_confidence} />
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                          <p className="text-xs text-zinc-600">
                            Trust bar color: <span className="text-emerald-400">green</span> = low bias risk,{" "}
                            <span className="text-amber-400">amber</span> = moderate,{" "}
                            <span className="text-red-400">red</span> = high automation bias detected.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent sessions table */}
            {data.recent_sessions.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Sessions</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Session</th>
                        <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Scenario</th>
                        <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Trust</th>
                        <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Confidence</th>
                        <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden sm:table-cell">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_sessions.map((s, i) => {
                        const meta = SCENARIO_META[s.scenario_id];
                        return (
                          <tr key={s.id} className={i < data.recent_sessions.length - 1 ? "border-b border-zinc-800/60" : ""}>
                            <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{s.id}</td>
                            <td className="px-4 py-3">
                              {meta ? (
                                <span className={`text-xs font-medium border px-1.5 py-0.5 rounded ${meta.roleColor}`}>
                                  {meta.role}
                                </span>
                              ) : (
                                <span className="text-xs text-zinc-500">{s.scenario_id}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-zinc-300">{s.trust_rating}/7</td>
                            <td className="px-4 py-3 text-zinc-300">{s.confidence_rating}/7</td>
                            <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                              {s.completed_at ? formatDate(s.completed_at) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
