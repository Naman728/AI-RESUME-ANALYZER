from typing import List, Dict
from app.models.llm_client import llm_client
from app.services.vectorstore import vectorstore
from app.core.logger import get_logger

logger = get_logger(__name__)

class QuizService:
    """Service for generating quizzes from resume"""
    
    async def generate_quiz(self, file_id: str, count: int = 5, difficulty: str = "medium") -> List[dict]:
        """Generate quiz questions from resume content"""
        try:
            # Get documents from vector store
            documents = vectorstore.get_documents(file_id)
            if not documents:
                raise ValueError(f"No documents found for file_id: {file_id}")
            
            # Combine all text
            full_text = "\n\n".join([doc["text"] for doc in documents])
            
            # Generate quiz using LLM
            system_prompt = """You are an expert at creating educational quiz questions. Generate multiple-choice questions (MCQs) based on resume content.
Each question should have:
- A clear question
- 4 options (A, B, C, D)
- One correct answer (0-indexed: 0=A, 1=B, 2=C, 3=D)
- A brief explanation

Make questions that test understanding of skills, technologies, and experiences mentioned in the resume."""
            
            user_prompt = f"""Generate exactly {count} multiple-choice questions from the following resume content with {difficulty} difficulty level.

Resume content:
{full_text[:4000]}

Return a JSON array with objects containing:
- "question": string
- "options": array of 4 strings
- "correct_answer": integer (0-3, where 0=A, 1=B, 2=C, 3=D)
- "explanation": string

Return format:
[
  {{
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Explanation here"
  }},
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
                    raise ValueError("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file to generate quiz questions.")
                raise
            
            # Extract questions from response
            questions = []
            if isinstance(response, dict):
                # Try different possible keys
                if "questions" in response:
                    questions = response["questions"]
                elif "quiz" in response:
                    questions = response["quiz"]
                elif "data" in response:
                    questions = response["data"]
                elif isinstance(response, list):
                    questions = response
            elif isinstance(response, list):
                questions = response
            else:
                import json
                if isinstance(response, str):
                    try:
                        questions = json.loads(response)
                    except:
                        logger.warning(f"Could not parse response as JSON: {response[:100]}")
            
            # Validate and format questions
            formatted_questions = []
            for q in questions[:count]:
                if isinstance(q, dict) and "question" in q and "options" in q and "correct_answer" in q:
                    # Ensure options is a list
                    if not isinstance(q["options"], list):
                        continue
                    
                    # Ensure correct_answer is within bounds
                    correct_answer = q["correct_answer"]
                    if isinstance(correct_answer, str):
                        # Try to convert string to int
                        try:
                            correct_answer = int(correct_answer)
                        except:
                            continue
                    
                    if 0 <= correct_answer < len(q["options"]):
                        formatted_questions.append({
                            "question": str(q["question"]).strip(),
                            "options": [str(opt).strip() for opt in q["options"][:4]],  # Ensure exactly 4 options
                            "correct_answer": correct_answer,
                            "explanation": str(q.get("explanation", "")).strip()
                        })
            
            if not formatted_questions:
                raise ValueError("No valid quiz questions were generated. Please try again or check your OpenAI API configuration.")
            
            logger.info(f"Generated {len(formatted_questions)} quiz questions for file_id: {file_id}")
            return formatted_questions
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            raise
    
    def evaluate_answer(self, user_answer: str, correct_answer: str) -> Dict:
        """Evaluate a user's answer"""
        # Simple string comparison (case-insensitive, trimmed)
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
        
        return {
            "is_correct": is_correct,
            "score": 1.0 if is_correct else 0.0,
            "feedback": "Correct!" if is_correct else f"Incorrect. The correct answer is: {correct_answer}"
        }

# Global instance
quiz_service = QuizService()

