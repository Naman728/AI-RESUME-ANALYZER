import os
import json
from typing import List, Dict, Optional
from app.core.config import settings
from app.core.logger import get_logger
from app.services.embeddings import embedding_service

logger = get_logger(__name__)

class VectorStore:
    """In-memory vector store with simple similarity search"""
    
    def __init__(self):
        self.store_path = settings.VECTOR_STORE_PATH
        self.documents: Dict[str, List[Dict]] = {}  # file_id -> [{"text": str, "embedding": List[float], "metadata": dict}]
        self._ensure_store_dir()
    
    def _ensure_store_dir(self):
        """Ensure vector store directory exists"""
        os.makedirs(self.store_path, exist_ok=True)
    
    async def add_documents(
        self,
        file_id: str,
        texts: List[str],
        metadata: Optional[List[Dict]] = None
    ):
        """Add documents to vector store"""
        try:
            if not texts:
                logger.warning(f"No texts provided for file_id: {file_id}")
                return
            
            # Try to generate embeddings, but don't fail if it doesn't work
            embeddings = []
            try:
                embeddings = await embedding_service.generate_embeddings(texts)
                logger.info(f"Generated {len(embeddings)} embeddings")
            except Exception as e:
                logger.warning(f"Failed to generate embeddings: {str(e)}. Storing documents without embeddings.")
                # Create empty embeddings as fallback
                embeddings = [[] for _ in texts]
            
            # Store documents
            documents = []
            for i, text in enumerate(texts):
                embedding = embeddings[i] if i < len(embeddings) else []
                doc = {
                    "text": text,
                    "embedding": embedding,
                    "metadata": metadata[i] if metadata and i < len(metadata) else {}
                }
                documents.append(doc)
            
            self.documents[file_id] = documents
            logger.info(f"Added {len(documents)} documents to vector store for file_id: {file_id}")
        except Exception as e:
            logger.error(f"Error adding documents: {str(e)}")
            # Even if embeddings fail, store the text so services can still work
            try:
                documents = []
                for i, text in enumerate(texts):
                    doc = {
                        "text": text,
                        "embedding": [],
                        "metadata": metadata[i] if metadata and i < len(metadata) else {}
                    }
                    documents.append(doc)
                self.documents[file_id] = documents
                logger.info(f"Stored {len(documents)} documents without embeddings for file_id: {file_id}")
            except Exception as e2:
                logger.error(f"Failed to store documents even without embeddings: {str(e2)}")
                raise
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        import math
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(a * a for a in vec2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    async def similarity_search(
        self,
        query: str,
        file_id: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict]:
        """Search for similar documents"""
        try:
            # Generate query embedding
            query_embedding = (await embedding_service.generate_embeddings([query]))[0]
            
            # Search in specific file or all files
            search_space = []
            if file_id and file_id in self.documents:
                search_space = [(file_id, doc) for doc in self.documents[file_id]]
            else:
                for fid, docs in self.documents.items():
                    search_space.extend([(fid, doc) for doc in docs])
            
            # Calculate similarities
            results = []
            for fid, doc in search_space:
                similarity = self._cosine_similarity(query_embedding, doc["embedding"])
                results.append({
                    "file_id": fid,
                    "text": doc["text"],
                    "similarity": similarity,
                    "metadata": doc.get("metadata", {})
                })
            
            # Sort by similarity and return top_k
            results.sort(key=lambda x: x["similarity"], reverse=True)
            return results[:top_k]
        except Exception as e:
            logger.error(f"Error in similarity search: {str(e)}")
            raise
    
    def get_documents(self, file_id: str) -> List[Dict]:
        """Get all documents for a file_id"""
        return self.documents.get(file_id, [])
    
    def delete_documents(self, file_id: str):
        """Delete documents for a file_id"""
        if file_id in self.documents:
            del self.documents[file_id]
            logger.info(f"Deleted documents for file_id: {file_id}")

# Global instance
vectorstore = VectorStore()

