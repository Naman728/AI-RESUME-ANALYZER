from fastapi import APIRouter, HTTPException
from app.models.schemas import GeneratePayload, GenerateResponse
from app.services.generator_service import generator_service
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_resume(payload: GeneratePayload):
    """Generate an ATS-friendly resume"""
    try:
        resume = await generator_service.generate_resume(
            name=payload.name,
            contact=payload.contact,
            summary=payload.summary,
            experiences=payload.experiences,
            skills=payload.skills,
            education=payload.education,
            template=payload.template,
            job_description=payload.job_description
        )
        
        return GenerateResponse(
            resume=resume,
            format=payload.template
        )
    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating resume: {str(e)}")

