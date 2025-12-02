"""
OCR Processing Module - Phase 3
Handles real OCR processing using pytesseract
Optimized with lazy imports for faster Django startup
"""

import os
import re
import logging
import mimetypes
from typing import Dict, Optional, List, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class OCRProcessor:
    """
    Real OCR processing using pytesseract
    Supports PDF and image documents
    Imports are lazy-loaded on first use to optimize Django startup
    """

    # RUT pattern: XX.XXX.XXX-X or XXXXXXXX-X
    RUT_PATTERN = r'(\d{1,3}\.\d{3}\.\d{3}[-]\d{1}|\d{7,8}[-]\d{1})'
    
    # Confidence threshold for OCR results (0.0 - 1.0)
    MIN_CONFIDENCE = 0.70
    
    # Supported file types
    SUPPORTED_IMAGES = {'jpeg', 'jpg', 'png', 'bmp', 'gif', 'tiff'}
    SUPPORTED_PDFS = {'pdf', 'application/pdf'}

    def __init__(self, tesseract_path: Optional[str] = None, temp_dir: str = 'temp_ocr'):
        """
        Initialize OCR Processor
        
        Args:
            tesseract_path: Path to tesseract executable (if not in system PATH)
            temp_dir: Directory for temporary files
        """
        # Lazy import heavy dependencies on first instantiation
        import pytesseract
        
        if tesseract_path:
            pytesseract.pytesseract.pytesseract_cmd = tesseract_path
        
        self.temp_dir = temp_dir
        Path(self.temp_dir).mkdir(exist_ok=True)
        logger.info(f"OCRProcessor initialized. Temp dir: {self.temp_dir}")

    @staticmethod
    def get_file_type(file_path: str) -> str:
        """
        Detect file type using native Python mimetypes
        Replaced python-magic to avoid Windows MSYS2 conflicts
        
        Args:
            file_path: Path to file
            
        Returns:
            MIME type string
        """
        try:
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type:
                return mime_type.lower()
            
            # Fallback: check by extension
            ext = Path(file_path).suffix.lower().lstrip('.')
            if ext in {'jpg', 'jpeg'}:
                return 'image/jpeg'
            elif ext == 'png':
                return 'image/png'
            elif ext == 'pdf':
                return 'application/pdf'
            elif ext in {'bmp', 'gif', 'tiff'}:
                return f'image/{ext}'
            
            return "unknown"
        except Exception as e:
            logger.error(f"Error detecting file type: {e}")
            return "unknown"

    @staticmethod
    def validate_file_format(file_path: str) -> Tuple[bool, str]:
        """
        Validate if file is supported format
        
        Args:
            file_path: Path to file
            
        Returns:
            Tuple (is_valid, error_message)
        """
        try:
            # Get file extension
            ext = Path(file_path).suffix.lower().lstrip('.')
            
            # Get MIME type
            mime_type = OCRProcessor.get_file_type(file_path)
            
            # Check image format
            if ext in OCRProcessor.SUPPORTED_IMAGES:
                try:
                    # Lazy import PIL on first use
                    from PIL import Image
                    Image.open(file_path)
                    return True, ""
                except Exception as e:
                    return False, f"Invalid image file: {str(e)}"
            
            # Check PDF format
            if ext == 'pdf' or 'pdf' in mime_type:
                return True, ""
            
            return False, f"Unsupported file type: {ext}"
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            return False, f"File validation failed: {str(e)}"

    def convert_pdf_to_images(self, pdf_path: str):
        """
        Convert PDF to list of PIL Images
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            List of PIL Image objects
            
        Raises:
            OCRProcessingError: If conversion fails
        """
        try:
            # Lazy import pdf2image on first use
            from pdf2image import convert_from_path
            
            logger.info(f"Converting PDF to images: {pdf_path}")
            
            # Convert PDF to images
            images = convert_from_path(
                pdf_path,
                dpi=300,  # High DPI for better OCR
                fmt='png'
            )
            
            logger.info(f"Successfully converted PDF to {len(images)} images")
            return images
            
        except Exception as e:
            logger.error(f"PDF conversion error: {e}")
            raise OCRProcessingError(f"PDF conversion failed: {str(e)}")

    def extract_text_from_image(self, image) -> Dict:
        """
        Extract text from PIL Image using pytesseract
        
        Args:
            image: PIL Image object
            
        Returns:
            Dict with extracted text and metadata
            {
                'text': str,
                'confidence': float,
                'language': str
            }
        """
        try:
            # Lazy import pytesseract on first use
            import pytesseract
            
            logger.info("Extracting text from image using pytesseract")
            
            # Extract text
            text = pytesseract.image_to_string(image, lang='spa+eng')
            
            # Get detailed data
            data = pytesseract.image_to_data(image, lang='spa+eng', output_type='dict')
            
            # Calculate confidence (average of all detected characters)
            confidences = [conf for conf in data['confidence'] if conf > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            avg_confidence = avg_confidence / 100.0  # Normalize to 0-1
            
            result = {
                'text': text.strip(),
                'confidence': round(avg_confidence, 2),
                'language': 'spa+eng'
            }
            
            logger.info(f"Text extraction complete. Confidence: {result['confidence']}")
            return result
            
        except Exception as e:
            logger.error(f"Text extraction error: {e}")
            raise OCRProcessingError(f"Text extraction failed: {str(e)}")

    def extract_text_from_file(self, file_path: str) -> Dict:
        """
        Extract text from file (image or PDF)
        
        Args:
            file_path: Path to image or PDF file
            
        Returns:
            Dict with extracted text and metadata
        """
        try:
            # Lazy import PIL on first use
            from PIL import Image
            
            # Validate file
            is_valid, error_msg = self.validate_file_format(file_path)
            if not is_valid:
                raise OCRValidationError(error_msg)
            
            ext = Path(file_path).suffix.lower().lstrip('.')
            
            # Handle PDF
            if ext == 'pdf':
                logger.info(f"Processing PDF: {file_path}")
                images = self.convert_pdf_to_images(file_path)
                
                # Extract text from all pages
                all_text = []
                confidences = []
                
                for idx, image in enumerate(images):
                    result = self.extract_text_from_image(image)
                    all_text.append(result['text'])
                    confidences.append(result['confidence'])
                
                # Combine results
                combined_text = '\n---PAGE BREAK---\n'.join(all_text)
                avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
                
                return {
                    'text': combined_text,
                    'confidence': round(avg_confidence, 2),
                    'pages': len(images),
                    'language': 'spa+eng'
                }
            
            # Handle image
            else:
                logger.info(f"Processing image: {file_path}")
                image = Image.open(file_path)
                result = self.extract_text_from_image(image)
                result['pages'] = 1
                return result
                
        except (OCRValidationError, OCRProcessingError):
            raise
        except Exception as e:
            logger.error(f"File processing error: {e}")
            raise OCRProcessingError(f"File processing failed: {str(e)}")

    def clean_ocr_text(self, text: str) -> str:
        """
        Clean and normalize OCR extracted text
        
        Args:
            text: Raw OCR text
            
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove special OCR artifacts
        text = re.sub(r'\|', 'l', text)  # Replace pipe with 'l'
        text = re.sub(r'O(?=\d)', '0', text)  # Replace O with 0 before digits
        
        return text

    def extract_rut_from_text(self, text: str) -> Optional[str]:
        """
        Extract Chilean RUT from OCR text
        
        Args:
            text: OCR extracted text
            
        Returns:
            RUT string (formatted) or None if not found
        """
        try:
            # Clean text first
            text = self.clean_ocr_text(text)
            
            # Search for RUT pattern
            match = re.search(self.RUT_PATTERN, text)
            
            if match:
                rut = match.group(1)
                logger.info(f"RUT found: {rut}")
                return rut
            
            logger.warning("RUT not found in OCR text")
            return None
            
        except Exception as e:
            logger.error(f"RUT extraction error: {e}")
            return None

    def validate_ocr_confidence(
        self, 
        confidence: float, 
        threshold: Optional[float] = None
    ) -> Tuple[bool, str]:
        """
        Validate OCR confidence score
        
        Args:
            confidence: Confidence score (0.0-1.0)
            threshold: Custom threshold (defaults to MIN_CONFIDENCE)
            
        Returns:
            Tuple (is_valid, message)
        """
        threshold = threshold or self.MIN_CONFIDENCE
        
        if confidence >= threshold:
            return True, f"Confidence {confidence:.0%} is acceptable"
        else:
            return False, f"Confidence {confidence:.0%} is below threshold {threshold:.0%}"

    def validate_rut_format(self, rut: str) -> Tuple[bool, str]:
        """
        Validate Chilean RUT format
        
        Args:
            rut: RUT string
            
        Returns:
            Tuple (is_valid, message)
        """
        try:
            # Check format
            if not re.match(self.RUT_PATTERN, rut):
                return False, f"Invalid RUT format: {rut}"
            
            # Parse RUT
            parts = rut.split('-')
            if len(parts) != 2:
                return False, f"Invalid RUT format: {rut}"
            
            number_part = parts[0].replace('.', '')
            dv = parts[1]
            
            # Validate DV (verification digit)
            if not self.validate_rut_dv(number_part, dv):
                return False, f"Invalid RUT verification digit: {rut}"
            
            return True, f"Valid RUT: {rut}"
            
        except Exception as e:
            logger.error(f"RUT validation error: {e}")
            return False, f"RUT validation failed: {str(e)}"

    @staticmethod
    def validate_rut_dv(rut_number: str, dv: str) -> bool:
        """
        Validate Chilean RUT verification digit
        
        Args:
            rut_number: RUT number part (without format)
            dv: Verification digit
            
        Returns:
            True if valid
        """
        try:
            # Calculate verification digit
            multiplier = 2
            sum_value = 0
            
            for digit in reversed(rut_number):
                sum_value += int(digit) * multiplier
                multiplier += 1
                if multiplier > 7:
                    multiplier = 2
            
            remainder = sum_value % 11
            expected_dv = 11 - remainder
            
            if expected_dv == 10:
                expected_dv_str = 'K'
            elif expected_dv == 11:
                expected_dv_str = '0'
            else:
                expected_dv_str = str(expected_dv)
            
            return dv.upper() == expected_dv_str
            
        except Exception as e:
            logger.error(f"DV validation error: {e}")
            return False

    def process_document(self, file_path: str) -> Dict:
        """
        Complete document processing pipeline
        
        Args:
            file_path: Path to document file
            
        Returns:
            Dict with complete processing results
            {
                'status': 'success' or 'error',
                'rut': extracted RUT or None,
                'text': extracted text,
                'confidence': confidence score,
                'pages': number of pages,
                'rut_valid': RUT format validation,
                'error': error message if any
            }
        """
        try:
            logger.info(f"Starting document processing: {file_path}")
            
            # Extract text
            extraction_result = self.extract_text_from_file(file_path)
            
            # Extract RUT
            rut = self.extract_rut_from_text(extraction_result['text'])
            
            # Validate confidence
            conf_valid, conf_msg = self.validate_ocr_confidence(extraction_result['confidence'])
            
            # Validate RUT if found
            rut_valid = False
            rut_msg = "RUT not found"
            if rut:
                rut_valid, rut_msg = self.validate_rut_format(rut)
            
            result = {
                'status': 'success',
                'rut': rut,
                'text': extraction_result['text'],
                'confidence': extraction_result['confidence'],
                'pages': extraction_result.get('pages', 1),
                'rut_valid': rut_valid,
                'rut_message': rut_msg,
                'confidence_valid': conf_valid,
                'confidence_message': conf_msg,
                'error': None
            }
            
            logger.info(f"Document processing complete: {result}")
            return result
            
        except (OCRValidationError, OCRProcessingError) as e:
            logger.error(f"Document processing error: {e}")
            return {
                'status': 'error',
                'rut': None,
                'text': None,
                'confidence': 0.0,
                'pages': 0,
                'rut_valid': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during document processing: {e}")
            return {
                'status': 'error',
                'rut': None,
                'text': None,
                'confidence': 0.0,
                'pages': 0,
                'rut_valid': False,
                'error': f"Unexpected error: {str(e)}"
            }


# Custom Exceptions

class OCRProcessingException(Exception):
    """Base exception for OCR processing errors"""
    pass


class OCRValidationError(OCRProcessingException):
    """Raised when file validation fails"""
    pass


class OCRProcessingError(OCRProcessingException):
    """Raised when OCR processing fails"""
    pass


class OCRConfidenceError(OCRProcessingException):
    """Raised when confidence is too low"""
    pass


class OCRRUTExtractionError(OCRProcessingException):
    """Raised when RUT extraction fails"""
    pass
