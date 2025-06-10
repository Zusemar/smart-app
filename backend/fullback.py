from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, JSON, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "postgresql://postgres:131325@localhost:5433/smartapp_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models ---
class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    exercises = Column(JSON, nullable=False)

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, nullable=True)

class JournalEntry(Base):
    __tablename__ = "journal"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    workout = Column(String, nullable=False)
    exercises = Column(JSON, nullable=False)

Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas ---
class ExerciseSchema(BaseModel):
    id: Optional[int]
    name: str
    type: str
    description: Optional[str] = ""

class WorkoutExerciseSchema(ExerciseSchema):
    sets: Optional[str] = ""
    target: Optional[str] = ""

class WorkoutSchema(BaseModel):
    id: Optional[int]
    name: str
    exercises: List[WorkoutExerciseSchema]

class JournalExerciseResult(BaseModel):
    name: str
    type: str
    result: str

class JournalEntrySchema(BaseModel):
    id: Optional[int]
    date: str
    workout: str
    exercises: List[JournalExerciseResult]

# --- FastAPI App ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Для разработки, ограничьте на проде
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Workouts ---
@app.get("/api/workouts", response_model=List[WorkoutSchema])
def get_workouts():
    db = SessionLocal()
    workouts = db.query(Workout).all()
    db.close()
    return [WorkoutSchema(id=w.id, name=w.name, exercises=w.exercises) for w in workouts]

@app.get("/api/workouts/{workout_id}", response_model=WorkoutSchema)
def get_workout(workout_id: int):
    db = SessionLocal()
    w = db.query(Workout).filter(Workout.id == workout_id).first()
    db.close()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
    return WorkoutSchema(id=w.id, name=w.name, exercises=w.exercises)

@app.post("/api/workouts", response_model=WorkoutSchema)
def create_workout(workout: WorkoutSchema):
    db = SessionLocal()
    w = Workout(name=workout.name, exercises=[ex.dict() for ex in workout.exercises])
    db.add(w)
    db.commit()
    db.refresh(w)
    db.close()
    return WorkoutSchema(id=w.id, name=w.name, exercises=w.exercises)

@app.put("/api/workouts/{workout_id}", response_model=WorkoutSchema)
def update_workout(workout_id: int, workout: WorkoutSchema):
    db = SessionLocal()
    w = db.query(Workout).filter(Workout.id == workout_id).first()
    if not w:
        db.close()
        raise HTTPException(status_code=404, detail="Workout not found")
    w.name = workout.name
    w.exercises = [ex.dict() for ex in workout.exercises]
    db.commit()
    db.refresh(w)
    db.close()
    return WorkoutSchema(id=w.id, name=w.name, exercises=w.exercises)

@app.delete("/api/workouts/{workout_id}")
def delete_workout(workout_id: int):
    db = SessionLocal()
    w = db.query(Workout).filter(Workout.id == workout_id).first()
    if not w:
        db.close()
        raise HTTPException(status_code=404, detail="Workout not found")
    db.delete(w)
    db.commit()
    db.close()
    return {"ok": True}

# --- Exercises ---
@app.get("/api/exercises", response_model=List[ExerciseSchema])
def get_exercises():
    db = SessionLocal()
    exercises = db.query(Exercise).all()
    db.close()
    return [ExerciseSchema(id=e.id, name=e.name, type=e.type, description=e.description) for e in exercises]

@app.post("/api/exercises", response_model=ExerciseSchema)
def create_exercise(exercise: ExerciseSchema):
    db = SessionLocal()
    e = Exercise(name=exercise.name, type=exercise.type, description=exercise.description)
    db.add(e)
    db.commit()
    db.refresh(e)
    db.close()
    return ExerciseSchema(id=e.id, name=e.name, type=e.type, description=e.description)

# --- Journal ---
@app.get("/api/journal", response_model=List[JournalEntrySchema])
def get_journal():
    db = SessionLocal()
    entries = db.query(JournalEntry).all()
    db.close()
    return [JournalEntrySchema(id=e.id, date=e.date, workout=e.workout, exercises=e.exercises) for e in entries]

@app.post("/api/journal", response_model=JournalEntrySchema)
def add_journal_entry(entry: JournalEntrySchema):
    db = SessionLocal()
    e = JournalEntry(date=entry.date, workout=entry.workout, exercises=[ex.dict() for ex in entry.exercises])
    db.add(e)
    db.commit()
    db.refresh(e)
    db.close()
    return JournalEntrySchema(id=e.id, date=e.date, workout=e.workout, exercises=e.exercises)