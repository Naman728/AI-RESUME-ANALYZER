from fastapi import APIRouter, HTTPException
from app.models.schemas import NotesRequest, NotesResponse
from app.services.notes_service import notes_service
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/notes", response_model=NotesResponse)
async def generate_notes(request: NotesRequest):
    """Generate short notes from uploaded resume"""
    try:
        notes = await notes_service.generate_notes(
            file_id=request.file_id,
            style=request.style
        )
        
        return NotesResponse(
            notes=notes,
            file_id=request.file_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating notes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating notes: {str(e)}")

