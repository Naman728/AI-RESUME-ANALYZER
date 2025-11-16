from pydantic import BaseModel
from typing import List, Optional, Any, Dict

# Upload Schemas
class UploadResponse(BaseModel):
    file_id: str
    filename: str
    text_extracted: str
    message: str

# Notes Schemas
class NotesRequest(BaseModel):
    file_id: str
    style: Optional[str] = "concise"

class NotesResponse(BaseModel):
    notes: str
    file_id: str

# Flashcard Schemas
class FlashcardRequest(BaseModel):
    file_id: str
    count: Optional[int] = 10

class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardsResponse(BaseModel):
    flashcards: List[Flashcard]
    file_id: str

# Quiz Schemas
class QuizRequest(BaseModel):
    file_id: str
    count: Optional[int] = 5
    difficulty: Optional[str] = "medium"

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: Optional[str] = None

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    file_id: str

class EvalPayload(BaseModel):
    question: str
    user_answer: str
    correct_answer: str

class EvalResponse(BaseModel):
    is_correct: bool
    score: float
    feedback: str

# Generator Schemas
class GeneratePayload(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    summary: Optional[str] = None
    experiences: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    template: Optional[str] = "modern"
    job_description: Optional[str] = None

class GenerateResponse(BaseModel):
    resume: str
    format: str

# ATS Schemas
class ATSRequest(BaseModel):
    file_id: str
    job_description: str

class ATSResponse(BaseModel):
    score: float
    feedback: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    file_id: str
