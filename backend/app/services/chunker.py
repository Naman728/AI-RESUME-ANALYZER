from typing import List
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

class TextChunker:
    """Intelligently chunk text for embeddings"""
    
    def __init__(self):
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + self.chunk_size
            
            # If not the last chunk, try to break at sentence boundary
            if end < text_length:
                # Look for sentence endings near the chunk boundary
                for delimiter in ['. ', '.\n', '! ', '!\n', '? ', '?\n', '\n\n']:
                    last_occurrence = text.rfind(delimiter, start, end)
                    if last_occurrence != -1:
                        end = last_occurrence + len(delimiter)
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - self.chunk_overlap
            if start >= text_length:
                break
        
        logger.info(f"Chunked text into {len(chunks)} chunks")
        return chunks
    
    def chunk_by_sections(self, text: str) -> List[str]:
        """Chunk text by sections (for resumes)"""
        sections = []
        current_section = ""
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers (all caps, short lines, or common resume sections)
            is_header = (
                line.isupper() and len(line) < 50
                or line.lower() in ['experience', 'education', 'skills', 'summary', 
                                   'objective', 'projects', 'certifications', 'awards']
            )
            
            if is_header and current_section:
                sections.append(current_section.strip())
                current_section = line + "\n"
            else:
                current_section += line + "\n"
        
        if current_section:
            sections.append(current_section.strip())
        
        # If no sections found, use regular chunking
        if len(sections) <= 1:
            return self.chunk_text(text)
        
        logger.info(f"Chunked text into {len(sections)} sections")
        return sections

# Global instance
chunker = TextChunker()

