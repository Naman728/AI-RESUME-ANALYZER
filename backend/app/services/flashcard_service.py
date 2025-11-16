from typing import List
from app.models.llm_client import llm_client
from app.services.vectorstore import vectorstore
from app.core.logger import get_logger

logger = get_logger(__name__)

class FlashcardService:
    """Service for generating flashcards from resume"""
    
    async def generate_flashcards(self, file_id: str, count: int = 10) -> List[dict]:
        """Generate flashcards from resume content"""
        try:
            # Get documents from vector store
            documents = vectorstore.get_documents(file_id)
            if not documents:
                raise ValueError(f"No documents found for file_id: {file_id}")
            
            # Combine all text
            full_text = "\n\n".join([doc["text"] for doc in documents])
            
            # Generate flashcards using LLM
            system_prompt = """You are an expert at creating educational flashcards. Generate flashcards that help someone learn and remember key information from a resume.
Each flashcard should have:
- Front: A question or term
- Back: A clear, concise answer or definition

Focus on important skills, technologies, achievements, and concepts mentioned in the resume."""
            
            user_prompt = f"""Generate exactly {count} flashcards from the following resume content. Return a JSON array with objects containing "front" and "back" fields.

Resume content:
{full_text[:4000]}

Return format:
[
  {{"front": "Question or term", "back": "Answer or definition"}},
  ...
]"""
            
            try:
                response = await llm_client.generate_structured_output(
                    prompt=user_prompt,
                    system_prompt=system_prompt
                )
            except ValueError as e:
                # If OpenAI API key is not configured, provide helpful error
                if "API key" in str(e):
                    raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file to generate flashcards.")
                raise
            
            # Extract flashcards from response
            flashcards = []
            if isinstance(response, dict):
                # Try different possible keys
                if "flashcards" in response:
                    flashcards = response["flashcards"]
                elif "cards" in response:
                    flashcards = response["cards"]
                elif "data" in response:
                    flashcards = response["data"]
                elif isinstance(response, list):
                    flashcards = response
                else:
                    # If response is a single dict with front/back, wrap it
                    if "front" in response and "back" in response:
                        flashcards = [response]
            elif isinstance(response, list):
                flashcards = response
            else:
                # Try to parse if it's a string
                import json
                if isinstance(response, str):
                    try:
                        flashcards = json.loads(response)
                    except:
                        logger.warning(f"Could not parse response as JSON: {response[:100]}")
            
            # Ensure we have the right format
            formatted_flashcards = []
            for card in flashcards[:count]:
                if isinstance(card, dict) and "front" in card and "back" in card:
                    formatted_flashcards.append({
                        "front": str(card["front"]).strip(),
                        "back": str(card["back"]).strip()
                    })
            
            if not formatted_flashcards:
                raise ValueError("No valid flashcards were generated. Please try again or check your OpenAI API configuration.")
            
            logger.info(f"Generated {len(formatted_flashcards)} flashcards for file_id: {file_id}")
            return formatted_flashcards
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            raise

# Global instance
flashcard_service = FlashcardService()

