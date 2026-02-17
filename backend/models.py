from typing import Optional, List
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
    
    # Research Data: No defaults here, these MUST be provided
    user_judgment_pre: str
    user_judgment_post: str
    is_ai_correct: bool 

    # Psychometrics: 1-7 Likert scale. 1 = Strongly disagree, 7 = Strongly agree.
    trust_rating: int = Field(ge=1, le=7, description="Likert scale 1-7")

    # Temporal Data: Standardized to UTC
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)) # UTC timezone
    completed_at: Optional[datetime] = Field(default=None)
    
    # Link back to the Model table
    model: Optional["Model"] = Relationship(back_populates="sessions")
