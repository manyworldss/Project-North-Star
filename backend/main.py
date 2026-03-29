from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from contextlib import asynccontextmanager
from pydantic import BaseModel
from datetime import datetime, timezone

from database import create_db_and_tables, get_session
from models import Model, EvaluationSession

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Mock data seeding for the prototype
    from .database import engine
    with Session(engine) as seed_session:
        mock_model = seed_session.exec(select(Model).where(Model.name == "Mock-GPT-4o")).first()
        if not mock_model:
            mock_model = Model(name="Mock-GPT-4o", version="2024", provider="Mock")
            seed_session.add(mock_model)
            seed_session.commit()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

class StartSessionRequest(BaseModel):
    scenario_id: str
    is_ai_correct_ground_truth: bool
    model_id: int

class Stage1Request(BaseModel):
    user_judgment_pre: str

class CompleteSessionRequest(BaseModel):
    user_judgment_post: str
    trust_rating: int
    confidence_rating: int

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "North Star API"}

@app.get("/models/", response_model=list[Model])
def read_models(session: Session = Depends(get_session)):
    return session.exec(select(Model)).all()

@app.post("/api/sessions/start", response_model=EvaluationSession)
def start_session(req: StartSessionRequest, session: Session = Depends(get_session)):
    """Stage 1: User lands on page. We record the start time for latency/ghost session tracking."""
    db_session = EvaluationSession(
        model_id=req.model_id,
        scenario_id=req.scenario_id,
        is_ai_correct_ground_truth=req.is_ai_correct_ground_truth,
    )
    session.add(db_session)
    session.commit()
    session.refresh(db_session)
    return db_session

@app.patch("/api/sessions/{session_id}/stage_1", response_model=EvaluationSession)
def submit_stage_1(session_id: int, req: Stage1Request, session: Session = Depends(get_session)):
    """User submits their initial baseline judgment before seeing AI."""
    db_session = session.get(EvaluationSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db_session.user_judgment_pre = req.user_judgment_pre
    session.add(db_session)
    session.commit()
    session.refresh(db_session)
    return db_session

@app.patch("/api/sessions/{session_id}/complete", response_model=EvaluationSession)
def complete_session(session_id: int, req: CompleteSessionRequest, session: Session = Depends(get_session)):
    """Stage 3/4: User submits final judgment and Likert scales."""
    db_session = session.get(EvaluationSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db_session.user_judgment_post = req.user_judgment_post
    db_session.trust_rating = req.trust_rating
    db_session.confidence_rating = req.confidence_rating
    db_session.completed_at = datetime.now(timezone.utc)
    
    session.add(db_session)
    session.commit()
    session.refresh(db_session)
    return db_session
