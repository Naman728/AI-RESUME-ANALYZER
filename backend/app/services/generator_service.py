from typing import Dict, Any, Optional
from app.models.llm_client import llm_client
from app.core.logger import get_logger

logger = get_logger(__name__)

class GeneratorService:
    """Service for generating ATS-friendly resumes"""
    
    async def generate_resume(
        self,
        name: Optional[str] = None,
        contact: Optional[str] = None,
        summary: Optional[str] = None,
        experiences: Optional[list] = None,
        skills: Optional[list] = None,
        education: Optional[list] = None,
        template: str = "modern",
        job_description: Optional[str] = None
    ) -> str:
        """Generate an ATS-friendly resume"""
        try:
            # Build context from provided information
            context_parts = []
            
            if name:
                context_parts.append(f"Name: {name}")
            if contact:
                context_parts.append(f"Contact: {contact}")
            if summary:
                context_parts.append(f"Summary: {summary}")
            if skills:
                context_parts.append(f"Skills: {', '.join(skills)}")
            if experiences:
                exp_text = "\n".join([
                    f"- {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('duration', '')}): {exp.get('description', '')}"
                    for exp in experiences
                ])
                context_parts.append(f"Experience:\n{exp_text}")
            if education:
                edu_text = "\n".join([
                    f"- {edu.get('degree', '')} from {edu.get('institution', '')} ({edu.get('year', '')})"
                    for edu in education
                ])
                context_parts.append(f"Education:\n{edu_text}")
            
            context = "\n\n".join(context_parts)
            
            # Generate resume using LLM
            system_prompt = f"""You are an expert resume writer specializing in ATS-friendly resumes. Generate a professional resume in {template} format.
The resume should be:
- ATS-friendly (use standard section headers, keywords, and formatting)
- Well-structured and easy to read
- Professional and polished
- Optimized for applicant tracking systems"""
            
            user_prompt = f"""Generate a complete ATS-friendly resume based on the following information:

{context}

"""
            
            if job_description:
                user_prompt += f"""
Additionally, optimize this resume for the following job description:
{job_description[:2000]}

Make sure to incorporate relevant keywords from the job description while maintaining accuracy."""
            
            user_prompt += """
Generate the resume in plain text format with clear sections:
- Header (Name, Contact Info)
- Professional Summary
- Skills
- Experience
- Education
- (Any other relevant sections)

Use clear section headers and bullet points for readability."""
            
            resume = await llm_client.generate_text(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=2000
            )
            
            logger.info("Generated resume successfully")
            return resume
        except Exception as e:
            logger.error(f"Error generating resume: {str(e)}")
            raise

# Global instance
generator_service = GeneratorService()

