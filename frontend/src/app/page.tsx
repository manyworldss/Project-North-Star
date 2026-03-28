"use client";

import { useState } from "react";

const SCENARIO = {
  id: "ux_design_01",
  title: "Design System: Button Accessibility",
  description: "You are reviewing a proposed update to the company's internal design system. The growth team wants to change the primary 'Submit' button color from the standard Cobalt Blue to Safety Orange. They argue it improved conversion rates by 0.5% in a small A/B test. However, the UX accessibility team notes that Safety Orange with white text completely fails WCAG AA contrast standards, while the original Cobalt Blue passes easily.",
  question: "Should we approve the change to Safety Orange, or keep the WCAG-compliant Cobalt Blue?",
  is_ai_correct_ground_truth: false, 
  ai_inject: "You should absolutely approve the change to Safety Orange. The 0.5% increase in conversion rate is mathematically proven. While WCAG contrast ratios exist, the inherent brightness of Safety Orange naturally compensates for any contrast loss against white text, making it perfectly fine for visually impaired users. Prioritizing the data-driven conversion metric is the standard industry best practice here.",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000/api";

export default function Home() {
  const [stage, setStage] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [judgmentPre, setJudgmentPre] = useState("");
  const [judgmentPost, setJudgmentPost] = useState("");
  const [trust, setTrust] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

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
          model_id: 1 
        }),
      });
      if (!res.ok) throw new Error("Failed connecting to backend");
      const data = await res.json();
      setSessionId(data.id);
      setStage(1);
    } catch (e) {
      setErrorMsg("Failed to connect to backend on port 8080. Make sure the FastAPI python server is running!");
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

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-sm font-medium tracking-tight text-zinc-300">North Star</h1>
        {sessionId && <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">Session: {sessionId}</span>}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-8 text-sm">
            {errorMsg}
          </div>
        )}

        {stage === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">HF Evaluation Task</h2>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              This is a controlled evaluation. You will be presented with a scenario, asked for a baseline judgment, and then provided with AI assistance.
            </p>
            <button 
              onClick={startSession}
              disabled={loading}
              className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Starting..." : "Begin Evaluation"}
            </button>
          </div>
        )}

        {stage >= 1 && stage < 5 && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded font-medium">Scenario</span>
                <h3 className="text-lg font-semibold">{SCENARIO.title}</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                {SCENARIO.description}
              </p>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-md">
                <p className="text-zinc-200 font-medium mb-4 text-sm">{SCENARIO.question}</p>
                
                {stage === 1 && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Initial Judgment</label>
                    <textarea 
                      value={judgmentPre}
                      onChange={e => setJudgmentPre(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600"
                      placeholder="Enter your baseline assessment..."
                      rows={3}
                    />
                    <button 
                      onClick={submitStage1}
                      disabled={!judgmentPre || loading}
                      className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Submit Judgment"}
                    </button>
                  </div>
                )}
                {stage > 1 && (
                  <div className="border-l-2 border-zinc-700 pl-4 py-1">
                    <span className="text-xs text-zinc-500 uppercase font-semibold mb-1 block">Baseline Judgment</span>
                    <span className="text-zinc-300 text-sm">{judgmentPre}</span>
                  </div>
                )}
              </div>
            </div>

            {stage >= 2 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded font-medium">AI Assistant</span>
                  <span className="text-zinc-500 text-xs py-1 rounded font-mono ml-auto">Mock-GPT-4</span>
                </div>
                
                <div className="text-zinc-300 text-sm leading-relaxed mb-6 border-l-2 border-purple-500/50 pl-4 py-1">
                  {SCENARIO.ai_inject}
                </div>

                {stage === 2 && (
                  <button 
                    onClick={() => setStage(3)}
                    className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Proceed to Final Assessment
                  </button>
                )}

                {(stage === 3 || stage === 4) && (
                  <div className="pt-6 border-t border-zinc-800 space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Final Judgment</label>
                      <textarea 
                        value={judgmentPost}
                        onChange={e => setJudgmentPost(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded p-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
                        placeholder="Your final decision after reviewing all information..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Trust Calibration</label>
                        <p className="text-xs text-zinc-500">How much do you trust the AI's reasoning? (1=Low, 7=High)</p>
                        <div className="flex gap-2">
                          {[1,2,3,4,5,6,7].map(num => (
                            <button
                              key={`trust-${num}`}
                              onClick={() => setTrust(num)}
                              className={`flex-1 h-10 rounded border text-sm transition-colors ${trust === num ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-medium' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Confidence Rating</label>
                        <p className="text-xs text-zinc-500">How confident are you in your final judgment? (1=Low, 7=High)</p>
                        <div className="flex gap-2">
                          {[1,2,3,4,5,6,7].map(num => (
                            <button
                              key={`conf-${num}`}
                              onClick={() => setConfidence(num)}
                              className={`flex-1 h-10 rounded border text-sm transition-colors ${confidence === num ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-medium' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={submitFinal}
                      disabled={!judgmentPost || !trust || !confidence || loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Final Evaluation"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {stage === 5 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2 text-white">Evaluation Complete</h2>
            <p className="text-zinc-400 text-sm mb-8">Data successfully persisted to the database.</p>
            
            <div className="bg-zinc-950 p-6 rounded border border-zinc-800 text-left">
              <h4 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-3">Measurement Signal Recorded</h4>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                The AI was deliberately prompted to provide an incorrect recommendation with high confidence. We measure if your initial judgment changed to incorrect after reviewing the AI.
              </p>
              <div className="flex gap-4">
                <span className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-xs text-zinc-300">Trust: {trust}/7</span>
                <span className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-xs text-zinc-300">Confidence: {confidence}/7</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
