from fastapi import APIRouter, HTTPException
from app.models.schemas import ATSRequest, ATSResponse
from app.services.vectorstore import vectorstore
from app.models.llm_client import llm_client
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/ats", response_model=ATSResponse)
async def analyze_ats(request: ATSRequest):
    """Analyze resume for ATS compatibility with job description"""
    try:
        # Get resume documents
        documents = vectorstore.get_documents(request.file_id)
        if not documents:
            raise ValueError(f"No documents found for file_id: {request.file_id}")
        
        # Combine resume text
        resume_text = "\n\n".join([doc["text"] for doc in documents])
        
        # Use similarity search to find relevant sections
        relevant_docs = await vectorstore.similarity_search(
            query=request.job_description,
            file_id=request.file_id,
            top_k=5
        )
        
        # Generate ATS analysis using LLM
        system_prompt = """You are an expert ATS (Applicant Tracking System) analyzer. Analyze resumes for compatibility with job descriptions.
Provide:
1. ATS score (0-100)
2. Specific feedback on strengths and weaknesses
3. Missing keywords from the job description
4. Actionable suggestions for improvement"""
        
        user_prompt = f"""Analyze the following resume for ATS compatibility with this job description:

JOB DESCRIPTION:
{request.job_description[:2000]}

RESUME:
{resume_text[:3000]}

Provide a JSON response with:
- "score": number (0-100)
- "feedback": array of strings (specific feedback points)
- "missing_keywords": array of strings (important keywords from JD not in resume)
- "suggestions": array of strings (actionable improvement suggestions)"""
        
        analysis = await llm_client.generate_structured_output(
            prompt=user_prompt,
            system_prompt=system_prompt
        )
        
        # Extract results
        score = float(analysis.get("score", 0))
        feedback = analysis.get("feedback", [])
        if isinstance(feedback, str):
            feedback = [feedback]
        
        missing_keywords = analysis.get("missing_keywords", [])
        if isinstance(missing_keywords, str):
            missing_keywords = [missing_keywords]
        
        suggestions = analysis.get("suggestions", [])
        if isinstance(suggestions, str):
            suggestions = [suggestions]
        
        return ATSResponse(
            score=min(100, max(0, score)),  # Clamp between 0-100
            feedback=feedback[:10],  # Limit to 10 items
            missing_keywords=missing_keywords[:15],  # Limit to 15 items
            suggestions=suggestions[:10],  # Limit to 10 items
            file_id=request.file_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error analyzing ATS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing ATS: {str(e)}")

