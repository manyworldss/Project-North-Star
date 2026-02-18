import os
import sqlmodel
from sqlmodel import create_engine, Session
from models import Model, EvaluationSession

# Use PostgreSQL when DATABASE_URL is set (e.g. from .env); otherwise SQLite for local dev.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    sqlmodel.SQLModel.metadata.create_all(engine)

def add_model(model: Model):