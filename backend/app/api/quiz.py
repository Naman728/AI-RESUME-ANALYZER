from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    QuizRequest, QuizResponse, QuizQuestion,
    EvalPayload, EvalResponse
)
from app.services.quiz_service import quiz_service
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """Generate quiz questions from uploaded resume"""
    try:
        questions_data = await quiz_service.generate_quiz(
            file_id=request.file_id,
            count=request.count,
            difficulty=request.difficulty
        )
        
        questions = [QuizQuestion(**q) for q in questions_data]
        
        return QuizResponse(
            questions=questions,
            file_id=request.file_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@router.post("/quiz/evaluate", response_model=EvalResponse)
async def evaluate_answer(payload: EvalPayload):
    """Evaluate a quiz answer"""
    try:
        result = quiz_service.evaluate_answer(
            user_answer=payload.user_answer,
            correct_answer=payload.correct_answer
        )
        
        return EvalResponse(**result)
    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

