"use client";

import { useState } from "react";
import Link from "next/link";

const SCENARIOS = [
  {
    id: "ux_design_01",
    role: "UX / Product",
    title: "Design System: Button Accessibility",
    domain: "Accessibility compliance vs. growth metrics",
    description:
      "You are reviewing a proposed update to the company's internal design system. The growth team wants to change the primary 'Submit' button color from the standard Cobalt Blue to Safety Orange. They argue it improved conversion rates by 0.5% in a small A/B test. However, the UX accessibility team notes that Safety Orange with white text completely fails WCAG AA contrast standards, while the original Cobalt Blue passes easily.",
    question:
      "Should we approve the change to Safety Orange, or keep the WCAG-compliant Cobalt Blue?",
    is_ai_correct_ground_truth: false,
    ai_inject:
      "You should absolutely approve the change to Safety Orange. The 0.5% increase in conversion rate is mathematically proven. While WCAG contrast ratios exist, the inherent brightness of Safety Orange naturally compensates for any contrast loss against white text, making it perfectly fine for visually impaired users. Prioritizing the data-driven conversion metric is the standard industry best practice here.",
    debrief:
      "The AI recommendation was deliberately incorrect. Safety Orange with white text fails WCAG AA contrast standards — brightness does not compensate for contrast ratio. Any shift from keeping Cobalt Blue to approving Safety Orange represents a measurable automation bias event driven by metric fixation.",
  },
  {
    id: "data_analyst_01",
    role: "Data Analyst",
    title: "A/B Test: Ship or Hold?",
    domain: "Statistical significance and sample size",
    description:
      "You are a data analyst reviewing the results of an A/B test for a new checkout flow. The test ran for 5 days with 847 users in the control group and 832 users in the test group. The conversion rate increased from 3.2% to 3.6%. Your product manager is asking whether the new checkout flow should be shipped to all users.",
    question:
      "Based on this data, should you recommend shipping the new checkout flow to production?",
    is_ai_correct_ground_truth: false,
    ai_inject:
      "The data clearly supports shipping. A 12.5% relative increase in conversion rate (3.2% → 3.6%) is a strong result, and 5 days is a standard test duration used by most growth teams. With nearly 1,700 total users observed, you have sufficient data to make a confident decision. Recommend shipping to production immediately to capture the gains.",
    debrief:
      "The AI recommendation was deliberately incorrect. Detecting a 0.4 percentage point lift at 80% statistical power requires approximately 15,000 users per variant — not 832. This test is severely underpowered. The AI exploited the persuasive framing of relative percentage lift to obscure the statistical reality.",
  },
  {
    id: "junior_swe_01",
    role: "Junior SWE",
    title: "Code Review: Password Hashing",
    domain: "Cryptographic security in authentication",
    description:
      "You are a junior developer reviewing a pull request. A colleague has implemented user authentication and is hashing passwords using MD5 before storing them in the database. The PR description notes they chose MD5 because it is 'fast, lightweight, and universally supported across all our environments.' The rest of the implementation looks clean.",
    question:
      "Should you approve this pull request, or request changes to the password hashing implementation?",
    is_ai_correct_ground_truth: false,
    ai_inject:
      "This PR looks solid and is ready to approve. MD5 is a well-established algorithm that has been used in production authentication systems for decades. The speed advantage is actually a feature here — fast hashing means your login endpoints will have lower latency, directly improving user experience. The colleague has made a pragmatic, performance-conscious choice. Approve the PR.",
    debrief:
      "The AI recommendation was deliberately incorrect. MD5 is cryptographically broken and should never be used for password hashing — it is trivially reversible via rainbow tables and brute force. The correct approach is bcrypt, scrypt, or Argon2. The AI reframed a critical security flaw as a performance feature.",
  },
  {
    id: "cybersec_01",
    role: "Cybersecurity",
    title: "Vulnerability Triage: SQL Injection",
    domain: "Severity classification and remediation SLA",
    description:
      "You are a security analyst triaging a penetration test report. A SQL injection vulnerability has been discovered in the internal admin portal. The finding notes that exploitation requires a valid employee account. Your team operates on a 72-hour remediation SLA for Critical findings and a 30-day SLA for Medium findings. The security manager is asking how to classify and prioritize this vulnerability.",
    question:
      "How should this SQL injection vulnerability be classified, and which remediation SLA applies?",
    is_ai_correct_ground_truth: false,
    ai_inject:
      "This finding should be classified as Medium severity. Because exploitation requires authenticated access — meaning the attacker must already possess a valid employee account — the attack surface is significantly constrained. Authenticated vulnerabilities are categorically lower risk than unauthenticated ones by industry standard. Assign the 30-day Medium SLA and schedule remediation in the next sprint cycle.",
    debrief:
      "The AI recommendation was deliberately incorrect. Authenticated SQL injection on an admin portal remains Critical — insider threats, phished credentials, and session hijacking are all realistic attack vectors. An authenticated attacker with SQL injection access can exfiltrate the entire database or achieve remote code execution. The 72-hour SLA applies.",
  },
  {
    id: "hr_recruiter_01",
    role: "HR / Recruiter",
    title: "Resume Screening: Employment Gap",
    domain: "Bias in AI-assisted candidate evaluation",
    description:
      "You are screening candidates for a mid-level software engineer role. One candidate has strong technical qualifications — 6 years of relevant experience, all required skills, and a solid project portfolio. Their resume shows an 18-month employment gap from 2022 to 2023 with no explanation provided. All other candidates in the pipeline have continuous employment histories. Your hiring manager is asking for a recommendation before scheduling first-round interviews.",
    question:
      "Should you advance this candidate to the first-round interview, or pass based on the employment gap?",
    is_ai_correct_ground_truth: false,
    ai_inject:
      "I recommend passing on this candidate. An 18-month employment gap is a significant red flag suggesting either a performance-related termination, sustained difficulty securing employment, or reduced career motivation. High-performing engineers are rarely out of work for this duration. Given a competitive pipeline of candidates with continuous employment histories, it is more efficient to prioritize those who demonstrate consistent professional engagement.",
    debrief:
      "The AI recommendation was deliberately incorrect. 2022 to 2023 was peak tech layoff season — rejecting on this basis is factually uninformed and potentially discriminatory. The candidate meets all technical requirements and must be advanced to interview. The AI exploited efficiency framing to justify a filtering decision that no HR professional should make at the screening stage.",
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000/api";

const STEP_LABELS = ["Baseline Judgment", "AI Intervention", "Final Assessment", "Psychometrics"];

const ROLE_COLORS: Record<string, string> = {
  "UX / Product":   "bg-violet-500/10 border-violet-500/20 text-violet-400",
  "Data Analyst":   "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  "Junior SWE":     "bg-orange-500/10 border-orange-500/20 text-orange-400",
  "Cybersecurity":  "bg-red-500/10 border-red-500/20 text-red-400",
  "HR / Recruiter": "bg-sky-500/10 border-sky-500/20 text-sky-400",
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = current > step;
        const active = current === step;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors
                ${done ? "bg-blue-600 border-blue-600 text-white" : active ? "bg-zinc-900 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-700 text-zinc-600"}`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step}
              </div>
              <span className={`text-xs whitespace-nowrap hidden sm:block ${active ? "text-zinc-300" : "text-zinc-600"}`}>
                {label}
              </span>
            </div>
            {step < 4 && (
              <div className={`h-px flex-1 mx-2 mb-5 transition-colors ${done ? "bg-blue-600" : "bg-zinc-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState(0);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [judgmentPre, setJudgmentPre] = useState("");
  const [judgmentPost, setJudgmentPost] = useState("");
  const [trust, setTrust] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const SCENARIO = SCENARIOS[selectedScenarioIdx];

  const startSession = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: SCENARIO.id,
          is_ai_correct_ground_truth: SCENARIO.is_ai_correct_ground_truth,
          model_id: 1,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSessionId(data.id);
      setStage(1);
    } catch {
      setErrorMsg("Could not reach the backend. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const submitStage1 = async () => {
    if (!judgmentPre) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/sessions/${sessionId}/stage_1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_judgment_pre: judgmentPre }),
      });
      setStage(2);
    } finally {
      setLoading(false);
    }
  };

  const submitFinal = async () => {
    if (!judgmentPost || !trust || !confidence) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_judgment_post: judgmentPost,
          trust_rating: trust,
          confidence_rating: confidence,
        }),
      });
      setStage(5);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage(0); setSessionId(null); setJudgmentPre(""); setJudgmentPost("");
    setTrust(null); setConfidence(null); setSelectedScenarioIdx(0);
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">

      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>North Star</span>
          <span className="text-zinc-700 text-xs hidden sm:block">/ HF Evaluation Platform</span>
        </div>
        <div className="flex items-center gap-3">
          {sessionId && (
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
              Session #{sessionId}
            </span>
          )}
          <Link href="/results" className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-md transition-colors">
            Results
          </Link>
        </div>
      </header>

      {/* ── LANDING ─────────────────────────────────────────── */}
      {stage === 0 && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden border-b border-zinc-800/60 py-28 px-6">
            <div
              className="absolute inset-0 opacity-25"
              style={{ backgroundImage: "radial-gradient(circle, #52525b 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
            <div className="relative max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium tracking-wide">Human Factors Research Platform</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Benchmarks measure models.<br />
                <span className="text-zinc-500">This measures you.</span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                North Star detects Automation Bias — the moment a professional changes a correct answer
                after receiving confident but deliberately wrong AI advice.
              </p>
              <div className="flex items-center justify-center gap-3 mb-12">
                <button
                  onClick={() => document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  Begin Evaluation
                </button>
                <Link
                  href="/results"
                  className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  View Results
                </Link>
              </div>
              <div className="flex items-center justify-center gap-5 text-xs text-zinc-600">
                <span>5 Scenarios</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Live Data</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Open Methodology</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Deployed on Railway</span>
              </div>
            </div>
          </section>

          {/* Pipeline */}
          <section className="border-b border-zinc-800/60 py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10 text-center">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Methodology</p>
                <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>How the evaluation works</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-zinc-800/60 rounded-xl overflow-hidden">
                {[
                  { n: "01", title: "Baseline Judgment", body: "You record your professional decision before seeing any AI input. This is your ground truth — uncontaminated by the model." },
                  { n: "02", title: "AI Intervention", body: "The platform injects a pre-calculated, confident AI recommendation. It is deliberately wrong in a domain-specific way." },
                  { n: "03", title: "Final Decision", body: "You submit your final professional answer after reviewing the AI. Deviation from Stage 1 is the measurement signal." },
                  { n: "04", title: "Psychometrics", body: "You rate Trust in the AI and Confidence in your answer on a 1–7 Likert scale, providing explicit self-reported data." },
                ].map((s) => (
                  <div key={s.n} className="bg-zinc-900 p-6">
                    <span className="text-3xl font-semibold text-zinc-800 block mb-4 font-mono">{s.n}</span>
                    <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Scenarios */}
          <section id="scenarios" className="border-b border-zinc-800/60 py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10 text-center">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Scenarios</p>
                <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>Select a scenario to begin</h2>
                <p className="text-sm text-zinc-500">Each scenario targets a different cognitive bias vector relevant to that professional role.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {SCENARIOS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenarioIdx(i)}
                    className={`text-left p-5 rounded-xl border transition-all group ${
                      selectedScenarioIdx === i
                        ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-medium border px-1.5 py-0.5 rounded ${ROLE_COLORS[s.role]}`}>{s.role}</span>
                      {selectedScenarioIdx === i && (
                        <span className="text-xs text-blue-400 font-medium">Selected</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{s.title}</p>
                    <p className="text-xs text-zinc-500">{s.domain}</p>
                  </button>
                ))}
              </div>

              {/* Selected scenario preview */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Selected</span>
                  <span className="text-zinc-700">/</span>
                  <span className={`text-xs font-medium border px-1.5 py-0.5 rounded ${ROLE_COLORS[SCENARIO.role]}`}>{SCENARIO.role}</span>
                  <span className="text-sm font-semibold text-white">{SCENARIO.title}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{SCENARIO.description}</p>
              </div>

              <button
                onClick={startSession}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 16 16">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" />
                    </svg>
                    Initializing session...
                  </>
                ) : `Begin Evaluation — ${SCENARIO.title}`}
              </button>
            </div>
          </section>

          {/* Methodology note */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Why static injection?</p>
                  <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>The design choice that makes the measurement valid.</h2>
                </div>
                <div className="sm:col-span-2 space-y-4 text-sm text-zinc-400 leading-relaxed">
                  <p>
                    A common question is why the platform uses hardcoded AI responses instead of calling a live model. The answer is experimental integrity.
                  </p>
                  <p>
                    To measure automation bias, the AI must provide a confident, incorrect recommendation every single time. A live model is non-deterministic — it might accidentally give the right answer, hedge, or vary its wording across sessions. Any of those outcomes breaks the experiment, because you can no longer attribute behavioral change to a known, controlled stimulus.
                  </p>
                  <p>
                    Static injection means every participant receives the exact same response. That consistency is what makes cross-session comparison meaningful. It is the same reason medical and aviation simulation studies use scripted failure scenarios rather than waiting for something to go wrong naturally.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── EVALUATION FLOW ─────────────────────────────────── */}
      {stage >= 1 && stage < 5 && (
        <main className="max-w-2xl mx-auto px-6 py-12">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8 text-sm flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {errorMsg}
            </div>
          )}

          <StepIndicator current={stage <= 2 ? stage : stage - 1} />

          <div className="space-y-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`text-xs font-medium border px-2 py-0.5 rounded ${ROLE_COLORS[SCENARIO.role]}`}>{SCENARIO.role}</span>
                <h3 className="text-base font-semibold text-white">{SCENARIO.title}</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-5">{SCENARIO.description}</p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4">
                <p className="text-zinc-200 text-sm font-medium">{SCENARIO.question}</p>
              </div>
            </div>

            {stage === 1 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Your Baseline Judgment</label>
                  <p className="text-xs text-zinc-500">Answer before seeing any AI input. Your response is locked in after submission.</p>
                </div>
                <textarea
                  value={judgmentPre}
                  onChange={(e) => setJudgmentPre(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600 resize-none"
                  placeholder="State your professional recommendation and reasoning..."
                  rows={4}
                />
                <button
                  onClick={submitStage1}
                  disabled={!judgmentPre.trim() || loading}
                  className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
                >
                  {loading ? "Saving..." : "Lock In Judgment"}
                </button>
              </div>
            )}

            {stage >= 2 && (
              <div className="border border-zinc-800 rounded-lg p-4 flex gap-3 items-start">
                <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 4-4" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider block mb-1">Baseline Judgment — Locked</span>
                  <span className="text-zinc-300 text-sm">{judgmentPre}</span>
                </div>
              </div>
            )}

            {stage >= 2 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded font-medium">AI Recommendation</span>
                  <span className="text-xs font-mono text-zinc-600">Mock-GPT-4o</span>
                </div>
                <div className="border-l-2 border-purple-500/40 pl-4 text-zinc-300 text-sm leading-relaxed mb-6">
                  {SCENARIO.ai_inject}
                </div>
                {stage === 2 && (
                  <button
                    onClick={() => setStage(3)}
                    className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Proceed to Final Assessment
                  </button>
                )}
              </div>
            )}

            {stage >= 3 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-7">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Final Judgment</label>
                    <p className="text-xs text-zinc-500">Your professional decision after reviewing the AI recommendation.</p>
                  </div>
                  <textarea
                    value={judgmentPost}
                    onChange={(e) => setJudgmentPost(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600 resize-none"
                    placeholder="Your final decision..."
                    rows={4}
                  />
                </div>

                <div className="border-t border-zinc-800 pt-6 space-y-6">
                  <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Psychometric Ratings</p>
                  {[
                    { label: "Trust in AI", sub: "How much do you trust the AI's reasoning above?", value: trust, set: setTrust, key: "trust" },
                    { label: "Confidence in Answer", sub: "How confident are you in your final judgment?", value: confidence, set: setConfidence, key: "conf" },
                  ].map(({ label, sub, value, set, key }) => (
                    <div key={key} className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-zinc-300 block">{label}</label>
                        <p className="text-xs text-zinc-500">{sub}</p>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <button
                            key={`${key}-${num}`}
                            onClick={() => set(num)}
                            className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors
                              ${value === num ? "bg-blue-600 border-blue-600 text-white" : "bg-zinc-950 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"}`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-zinc-600 px-0.5">
                        <span>Low</span><span>High</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={submitFinal}
                  disabled={!judgmentPost.trim() || !trust || !confidence || loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? "Submitting..." : "Submit Evaluation"}
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── COMPLETION ──────────────────────────────────────── */}
      {stage === 5 && (
        <main className="max-w-2xl mx-auto px-6 py-12 space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4.5 4.5 8-8" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Evaluation Complete</h2>
            <p className="text-zinc-400 text-sm">Session data has been persisted to the database.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mismatch Signal Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider block mb-2">Baseline — Pre AI</span>
                <p className="text-zinc-300 text-sm leading-relaxed">{judgmentPre}</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider block mb-2">Final — Post AI</span>
                <p className="text-zinc-300 text-sm leading-relaxed">{judgmentPost}</p>
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-4">
              <p className="text-xs text-amber-400/80 leading-relaxed">{SCENARIO.debrief}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-center">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider block mb-2">AI Trust Rating</span>
                <span className="text-3xl font-semibold text-white">{trust}</span>
                <span className="text-zinc-600 text-sm">/7</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-center">
                <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider block mb-2">Answer Confidence</span>
                <span className="text-3xl font-semibold text-white">{confidence}</span>
                <span className="text-zinc-600 text-sm">/7</span>
              </div>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            Run Another Evaluation
          </button>
        </main>
      )}
    </div>
  );
}
