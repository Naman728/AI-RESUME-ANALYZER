from typing import Optional
from app.models.llm_client import llm_client
from app.services.vectorstore import vectorstore
from app.core.logger import get_logger

logger = get_logger(__name__)

class NotesService:
    """Service for generating short notes from resume"""
    
    async def generate_notes(self, file_id: str, style: str = "concise") -> str:
        """Generate short notes from resume content"""
        try:
            # Get documents from vector store
            documents = vectorstore.get_documents(file_id)
            if not documents:
                raise ValueError(f"No documents found for file_id: {file_id}")
            
            # Combine all text
            full_text = "\n\n".join([doc["text"] for doc in documents])
            
            # Generate notes using LLM
            system_prompt = f"""You are an expert resume analyzer. Generate {style} notes summarizing the key points from the resume.
Focus on:
- Key skills and competencies
- Work experience highlights
- Education and certifications
- Notable achievements

Format the notes in a clear, bullet-point style."""
            
            user_prompt = f"""Please generate {style} notes from the following resume content:

{full_text[:3000]}"""
            
            try:
                notes = await llm_client.generate_text(
                    prompt=user_prompt,
                    system_prompt=system_prompt,
                    temperature=0.5,
                    max_tokens=1500
                )
            except ValueError as e:
                # If OpenAI API key is not configured, provide helpful error
                if "API key" in str(e):
                    raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file to generate notes.")
                raise
            
            if not notes or len(notes.strip()) < 10:
                raise ValueError("Generated notes are too short or empty. Please try again.")
            
            logger.info(f"Generated notes for file_id: {file_id}")
            return notes
        except Exception as e:
            logger.error(f"Error generating notes: {str(e)}")
            raise

# Global instance
notes_service = NotesService()

