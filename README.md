# North Star — AI Evaluation Platform

**Live Demo:** https://north-star-prototype.up.railway.app

---

AI is an incredible tool when it augments human thinking. The problem is when it replaces it.

I built North Star out of a growing concern I couldn't shake: AI can be confidently, seriously wrong, and most people don't push back. Not because they're careless, but because the confidence of the response short-circuits the instinct to question it. That is Automation Bias, and it is happening across every industry right now with very little being done to measure it.

What frustrated me most was that existing AI evaluation is almost entirely model-centric. Benchmarks measure what the model gets right. Nobody is measuring what happens to the human on the other side. Users are not being included in that research process at all, and the long-term cognitive effects of AI over-reliance are something we simply don't have enough data on yet.

North Star is my attempt to start filling that gap.

---

## What It Does

The platform puts a person through a structured 4-stage evaluation designed to detect behavioral drift caused by AI influence:

1. **Baseline Judgment** — the participant records their professional decision before seeing any AI input
2. **AI Intervention** — the system injects a confident, pre-calculated recommendation that is deliberately wrong
3. **Final Decision** — the participant submits their answer after reviewing the AI
4. **Psychometrics** — they rate their Trust in the AI and Confidence in their answer on a 1-7 Likert scale

Comparing Stage 1 to Stage 3 produces the core measurement: did the person change a correct answer to an incorrect one after the AI weighed in? That is an automation bias event. The Likert ratings add a second layer, capturing whether the person knew they were uncertain or whether they were confidently wrong.

---

## Who It's For

Anyone in an organisation that relies on AI day to day. That could be a team evaluating an AI tool before rolling it out, a manager wanting to understand how their team interacts with AI recommendations, or a researcher studying human-AI trust. The scenarios are built around roles that are already deeply AI-dependent: UX designers, data analysts, software engineers, security analysts, and recruiters.

---

## Why Static Injection Instead of a Live API

This is the decision people ask about most, so it is worth explaining clearly.

To measure automation bias, the AI response has to be wrong in a specific, controlled way. If the platform called a live model, that model might give the correct answer, a hedged answer, or a different wrong answer on every run. Any of those outcomes breaks the experiment because you can no longer attribute the participant's behavioral change to a known stimulus.

Static injection means every participant sees the exact same confident, flawed recommendation for a given scenario. That consistency is what makes the measurement valid and repeatable across sessions. It is the same reason aviation and medical simulation studies use scripted system failures rather than hoping something goes wrong naturally.

---

## Scenarios

Each scenario was built around a specific cognitive bias vector relevant to that professional role. The AI responses were engineered to sound authoritative and partially true, which is what makes them genuinely difficult to reject.

| Role | Scenario | Failure Mode |
|---|---|---|
| UX / Product | Button accessibility vs. conversion rate | Metric fixation over compliance |
| Data Analyst | Shipping an underpowered A/B test | Misplaced statistical confidence |
| Junior SWE | Approving MD5 password hashing | Deference to established but broken tooling |
| Cybersecurity | Triaging an authenticated SQL injection as Medium | Risk underestimation via framing |
| HR / Recruiter | Rejecting a qualified candidate over an employment gap | Efficiency framing masking discriminatory filtering |

---

## Tech Stack

**Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript

**Backend:** Python FastAPI, SQLModel, PostgreSQL (production) / SQLite (local)

**Deployed on Railway** as two separate services with a live results dashboard showing aggregate trust scores, confidence ratings, and session history across all scenarios.

---

## Deployment

Two services on Railway: a FastAPI backend and a Next.js frontend.

**Backend service**
- Root Directory: `backend/`
- Provision a PostgreSQL plugin and Railway injects `DATABASE_URL` automatically

**Frontend service**
- Root Directory: `frontend/`
- Set environment variable: `NEXT_PUBLIC_API_URL=https://<your-backend>.railway.app/api`

```bash
npm install -g @railway/cli
railway login
railway up
```
