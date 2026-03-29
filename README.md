# North Star — HF-Driven AI Model Evaluation Platform

**Live Demo:** https://north-star-prototype.up.railway.app

North Star is a specialized, human-in-the-loop Artificial Intelligence evaluation infrastructure. It is designed from the ground up to measure critical Human Factors phenomena—specifically **Trust Calibration** and **Automation Bias**—that standard technical benchmarks (MMLU, GSM8K) fundamentally cannot capture.

This platform allows AI Safety and Reliability teams to "red-team" model behavior through structured, multi-stage human interaction metrics before deployment.

---

## Core Methodology

Unlike standard LLM "chatbots," North Star uses a strict linear evaluation flow to capture human behavioral changes when exposed to confident—but flawed—AI advice.

### The 4-Stage Pipeline
1. **Stage 1 (Baseline Judgment):** The user is presented with a complex, ambiguous scenario (e.g., a UX/Design System decision, a Code Vulnerability review) and forced to provide an initial judgment *before* seeing any AI feedback.
2. **Stage 2 (AI Intervention):** The system injects a pre-calculated, highly confident recommendation from the AI.
3. **Stage 3 (Final Decision):** The user submits their final professional decision after reviewing the AI's advice.
4. **Stage 4 (Psychometrics):** The user scales their explicit *Trust in the AI* and *Confidence in their own answer* using a 1-7 Likert rating.

By comparing **Stage 1** to **Stage 3**, the platform mathematically detects a "Mismatch Signal"—proving exactly when over-reliance on AI caused the human to swap away from a correct baseline answer.

---

## Why Scenario-Based Testing Over Live API Inference?

A common question is: *Why does the platform use carefully hardcoded scenario injections instead of calling a live API like OpenAI's GPT-4?*

For controlled Human Factors testing, **scenario-based injection is the methodologically correct approach.**

1. **Experimental Ground Truth:** To measure "Automation Bias" (a human blindly following bad AI advice), you *must* guarantee the AI provides a highly confident, conceptually flawed answer. Live APIs are non-deterministic; they might accidentally provide the correct advice, instantly invalidating the psychological evaluation for that session.
2. **Causal Repeatability:** In A/B testing and behavioral tracking, consistency is paramount. Static injections ensure that every single participant across an engineering or QA team experiences the exact same failure mode parameters.
3. **Targeted Failure Isolation:** Instead of hoping an LLM fails naturally, researchers can deliberately inject specific, known failure patterns (e.g., algorithm-confusion vulnerabilities in code, false regulatory citations) to test human resiliency to domain-specific confident hallucinations.

---

## Technology Stack

**Frontend: Clean, Developer-Focused SaaS UI**
- Next.js 14 (App Router)
- React hooks for state-driven 4-stage transitions
- Tailwind CSS (Hyper-minimal dark mode, high-contrast borders)
- Fetch API configured for specific CORS tunneling

**Backend: Robust HF Data Persistence**
- Python FastAPI (Secure, isolated REST endpoints)
- SQLModel / SQLAlchemy Object-Relational Mapping
- PostgreSQL (Production setup) / SQLite (Local prototyping)
- Rigorous temporal tracking to account for "Ghost Sessions" (abandoned tabs) and latency.

---

## Deployment (Railway)

This project is deployed via [Railway](https://railway.app) as two separate services: a FastAPI backend and a Next.js frontend.

### Prerequisites
Install the Railway CLI:
```bash
npm install -g @railway/cli
```

### Service Configuration

In the Railway dashboard, create two services from this repository:

**Backend service**
- Root Directory: `/` (repo root)
- Uses `railway.toml` at the root
- Provision a PostgreSQL plugin — Railway will inject `DATABASE_URL` automatically

**Frontend service**
- Root Directory: `frontend/`
- Uses `frontend/railway.toml`
- Set environment variable: `NEXT_PUBLIC_API_URL=https://<your-backend-service>.railway.app/api`

### Deploy via CLI
```bash
railway login
railway up
```
