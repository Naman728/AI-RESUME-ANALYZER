import os
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import UploadResponse
from app.services.parser import parser
from app.services.chunker import chunker
from app.services.vectorstore import vectorstore
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

# Ensure upload directory exists (use absolute path)
UPLOAD_DIR = Path(settings.UPLOAD_DIR).resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
logger.info(f"Upload directory: {UPLOAD_DIR}")

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a resume file (PDF or image)"""
    file_path = None
    try:
        # Validate file type
        if not file.content_type:
            # Try to infer from filename
            if file.filename:
                ext = os.path.splitext(file.filename)[1].lower()
                if ext == '.pdf':
                    file.content_type = 'application/pdf'
                elif ext in ['.png', '.jpg', '.jpeg']:
                    file.content_type = f'image/{ext[1:]}'
            
            if not file.content_type:
                raise HTTPException(status_code=400, detail="File type not specified. Please upload a PDF or image (PNG/JPEG)")
        
        # Normalize content type
        content_type = file.content_type.lower()
        if content_type not in ["application/pdf", "image/png", "image/jpeg", "image/jpg"]:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}. Please upload a PDF or image (PNG/JPEG)"
            )
        
        # Check file size
        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)
        logger.info(f"File size: {file_size_mb:.2f} MB, Type: {file.content_type}")
        
        if file_size_mb > settings.MAX_UPLOAD_MB:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({file_size_mb:.2f}MB) exceeds maximum allowed size of {settings.MAX_UPLOAD_MB}MB"
            )
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        if not file_extension:
            # Default extension based on content type
            if 'pdf' in content_type:
                file_extension = '.pdf'
            elif 'png' in content_type:
                file_extension = '.png'
            elif 'jpeg' in content_type or 'jpg' in content_type:
                file_extension = '.jpg'
            else:
                file_extension = '.pdf'
        
        file_path = UPLOAD_DIR / f"{file_id}{file_extension}"
        
        # Save file
        try:
            with open(file_path, "wb") as f:
                f.write(file_content)
            logger.info(f"Saved uploaded file: {file_path}")
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
        
        # Parse file to extract text
        extracted_text = None
        try:
            extracted_text = parser.parse_file(str(file_path), file.content_type)
            logger.info(f"Extracted {len(extracted_text)} characters from file")
        except Exception as e:
            logger.error(f"Error parsing file: {str(e)}", exc_info=True)
            # Try to clean up file
            try:
                if file_path and file_path.exists():
                    os.remove(file_path)
            except:
                pass
            raise HTTPException(
                status_code=500, 
                detail=f"Error extracting text from file: {str(e)}. Please ensure the file is not corrupted and contains readable text."
            )
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            # Clean up file
            try:
                if file_path and file_path.exists():
                    os.remove(file_path)
            except:
                pass
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the file. Please ensure the file contains readable text."
            )
        
        # Chunk the text
        try:
            chunks = chunker.chunk_by_sections(extracted_text)
            logger.info(f"Created {len(chunks)} chunks from text")
        except Exception as e:
            logger.error(f"Error chunking text: {str(e)}")
            chunks = [extracted_text]  # Fallback to single chunk
        
        # Store in vector database
        try:
            await vectorstore.add_documents(
                file_id=file_id,
                texts=chunks,
                metadata=[{"chunk_index": i, "filename": file.filename or "uploaded_file"} for i in range(len(chunks))]
            )
            logger.info(f"Stored {len(chunks)} documents in vector store")
        except Exception as e:
            logger.error(f"Error storing in vector database: {str(e)}")
            # Don't fail the upload if vector store fails, but log it
            # The file is still uploaded and can be used
        
        return UploadResponse(
            file_id=file_id,
            filename=file.filename or "uploaded_file",
            text_extracted=extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
            message="File uploaded and processed successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload: {str(e)}", exc_info=True)
        # Clean up file if it was created
        try:
            if file_path and file_path.exists():
                os.remove(file_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

