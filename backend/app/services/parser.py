import os
from typing import Optional
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# Try to import OCR dependencies (optional)
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract not available. OCR features will be limited.")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("PIL/Pillow not available. Image processing will be limited.")

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    logger.warning("PyPDF2 not available. PDF text extraction will be limited.")

try:
    import pdf2image
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    logger.warning("pdf2image not available. PDF OCR will be limited.")

class DocumentParser:
    """Parse PDFs and images to extract text"""
    
    def __init__(self):
        if TESSERACT_AVAILABLE and settings.TESSERACT_CMD:
            try:
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            except Exception as e:
                logger.warning(f"Could not set Tesseract command: {str(e)}")
    
    def parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        
        # Try PyPDF2 first (faster for text-based PDFs)
        if PYPDF2_AVAILABLE:
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                
                if text.strip():
                    logger.info(f"Extracted text from PDF using PyPDF2: {len(text)} characters")
                    return text.strip()
            except Exception as e:
                logger.warning(f"PyPDF2 extraction failed: {str(e)}")
        
        # Fallback to OCR for scanned PDFs
        if PDF2IMAGE_AVAILABLE and TESSERACT_AVAILABLE:
            try:
                images = pdf2image.convert_from_path(file_path)
                ocr_text = ""
                for image in images:
                    ocr_text += pytesseract.image_to_string(image) + "\n"
                
                if ocr_text.strip():
                    logger.info(f"Extracted text from PDF using OCR: {len(ocr_text)} characters")
                    return ocr_text.strip()
            except Exception as e:
                logger.warning(f"OCR extraction failed: {str(e)}")
        
        # If both methods failed
        if not text.strip():
            error_msg = "Could not extract text from PDF. "
            if not PYPDF2_AVAILABLE and not TESSERACT_AVAILABLE:
                error_msg += "PDF parsing dependencies are not installed."
            else:
                error_msg += "The PDF might be corrupted or image-based. Please ensure Tesseract OCR is installed for scanned PDFs."
            raise ValueError(error_msg)
        
        return text.strip()
    
    def parse_image(self, file_path: str) -> str:
        """Extract text from image using OCR"""
        if not PIL_AVAILABLE:
            raise ValueError("PIL/Pillow is not installed. Cannot process images.")
        
        if not TESSERACT_AVAILABLE:
            raise ValueError("Tesseract OCR is not installed. Cannot extract text from images. Please install Tesseract OCR.")
        
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            logger.info(f"Extracted text from image: {len(text)} characters")
            
            if not text.strip():
                raise ValueError("No text could be extracted from the image. The image might not contain readable text.")
            
            return text.strip()
        except Exception as e:
            logger.error(f"Error parsing image: {str(e)}")
            if "TesseractNotFoundError" in str(type(e).__name__):
                raise ValueError("Tesseract OCR is not installed or not found. Please install Tesseract OCR to process images.")
            raise
    
    def parse_file(self, file_path: str, file_type: str) -> str:
        """Parse file based on type"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_type_lower = file_type.lower()
        
        if file_type_lower == "application/pdf":
            return self.parse_pdf(file_path)
        elif file_type_lower.startswith("image/"):
            return self.parse_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

# Global instance
parser = DocumentParser()

