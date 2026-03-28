from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Relationship

class Model(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # e.g., "GPT-4o"
    version: str                   # e.g., "2024-05-13"
    provider: str                  # e.g., "OpenAI" or "Anthropic"
    
    # Relationship back to sessions for easy querying
    sessions: List["EvaluationSession"] = Relationship(back_populates="model")


class EvaluationSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Foreign Key to the Model table
    model_id: int = Field(foreign_key="model.id")
    # Evaluation Config
    scenario_id: str = Field(index=True, description="The specific test scenario ID")
    is_ai_correct_ground_truth: bool = Field(description="Was the injected AI advice functionally correct?")

    # Research Data: Start None, populate as stages progress (handles Ghost Sessions)
    user_judgment_pre: Optional[str] = Field(default=None)
    user_judgment_post: Optional[str] = Field(default=None)

    # Psychometrics: 1-7 Likert scale. Optional because Stage 1 hasn't occurred yet.
    trust_rating: Optional[int] = Field(default=None, ge=1, le=7, description="Trust in AI (1-7)")
    confidence_rating: Optional[int] = Field(default=None, ge=1, le=7, description="Confidence in user's final answer (1-7)")
    # Temporal Data: Standardized to UTC
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)) # UTC timezone
    completed_at: Optional[datetime] = Field(default=None)
    
    # Link back to the Model table
    model: Optional["Model"] = Relationship(back_populates="sessions")
