from fastapi import APIRouter, HTTPException
from app.models.schemas import FlashcardRequest, FlashcardsResponse, Flashcard
from app.services.flashcard_service import flashcard_service
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/flashcards", response_model=FlashcardsResponse)
async def generate_flashcards(request: FlashcardRequest):
    """Generate flashcards from uploaded resume"""
    try:
        flashcards_data = await flashcard_service.generate_flashcards(
            file_id=request.file_id,
            count=request.count
        )
        
        flashcards = [Flashcard(**card) for card in flashcards_data]
        
        return FlashcardsResponse(
            flashcards=flashcards,
            file_id=request.file_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating flashcards: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")

