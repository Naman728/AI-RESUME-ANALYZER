from typing import List
from app.models.llm_client import llm_client
from app.core.logger import get_logger

logger = get_logger(__name__)

class EmbeddingService:
    """Service for generating embeddings"""
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        try:
            if not texts:
                return []
            
            embeddings = await llm_client.generate_embeddings(texts)
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise

# Global instance
embedding_service = EmbeddingService()

