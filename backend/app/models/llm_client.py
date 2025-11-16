from openai import AsyncOpenAI
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

class LLMClient:
    """Abstraction layer for LLM API calls"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.model = settings.OPENAI_MODEL
        self.embedding_model = settings.EMBEDDING_MODEL
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """Generate text using LLM"""
        try:
            if not self.client:
                raise ValueError("OpenAI API key not configured")
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating text: {str(e)}")
            raise
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        try:
            if not self.client:
                raise ValueError("OpenAI API key not configured")
            
            response = await self.client.embeddings.create(
                model=self.embedding_model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise
    
    async def generate_structured_output(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_mode: bool = True
    ) -> Dict[str, Any]:
        """Generate structured JSON output"""
        try:
            if not self.client:
                raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.")
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            # Enhance prompt to ensure JSON output
            enhanced_prompt = prompt
            if json_mode:
                enhanced_prompt += "\n\nIMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or additional text."
            
            messages.append({"role": "user", "content": enhanced_prompt})
            
            response_format = {"type": "json_object"} if json_mode else None
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,
                response_format=response_format
            )
            
            content = response.choices[0].message.content.strip()
            
            # Clean up content if it has markdown code blocks
            if content.startswith("```json"):
                content = content[7:]  # Remove ```json
            if content.startswith("```"):
                content = content[3:]  # Remove ```
            if content.endswith("```"):
                content = content[:-3]  # Remove closing ```
            content = content.strip()
            
            import json
            try:
                return json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {content[:200]}")
                # Try to extract JSON from the response
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    try:
                        return json.loads(json_match.group())
                    except:
                        pass
                raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error generating structured output: {str(e)}")
            if "API key" in str(e) or "authentication" in str(e).lower():
                raise ValueError("OpenAI API key is invalid or not configured. Please check your OPENAI_API_KEY in .env file.")
            raise

# Global instance
llm_client = LLMClient()

