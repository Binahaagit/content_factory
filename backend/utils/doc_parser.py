# doc_parser.py
# This file handles extracting text from uploaded files
# Supports: PDF, TXT, and basic DOCX files

import PyPDF2
import io
import re

# ─────────────────────────────────────────
# SUPPORTED FILE TYPES
# ─────────────────────────────────────────

SUPPORTED_TYPES = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
}

# Max file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes


# ─────────────────────────────────────────
# MAIN PARSER FUNCTION
# ─────────────────────────────────────────

def parse_document(file_content: bytes, filename: str, content_type: str) -> str:
    """
    Extracts text from an uploaded document.

    Supports PDF and TXT files.

    Parameters:
        file_content (bytes): The raw file bytes
        filename (str): Original filename (e.g. "report.pdf")
        content_type (str): MIME type (e.g. "application/pdf")

    Returns:
        str: Extracted text from the document

    Raises:
        ValueError: If file type is unsupported or extraction fails
    """

    print(f"📄 DocParser: Processing file: {filename} ({content_type})")

    # ── Check file size ──
    if len(file_content) > MAX_FILE_SIZE:
        raise ValueError(
            f"File too large. Maximum size is 10MB. "
            f"Your file is {len(file_content) / 1024 / 1024:.1f}MB"
        )

    # ── Check file type ──
    # Get extension from filename as backup check
    file_ext = filename.lower().split(".")[-1] if "." in filename else ""

    # Route to the correct parser based on content type or extension
    if content_type == "application/pdf" or file_ext == "pdf":
        extracted_text = parse_pdf(file_content)

    elif content_type == "text/plain" or file_ext == "txt":
        extracted_text = parse_txt(file_content)

    else:
        raise ValueError(
            f"Unsupported file type: {content_type or file_ext}. "
            f"Please upload a PDF or TXT file."
        )

    # ── Validate extracted text ──
    if not extracted_text or len(extracted_text.strip()) < 50:
        raise ValueError(
            "Could not extract enough text from this document. "
            "The file may be scanned/image-based or empty."
        )

    print(f"📄 DocParser: Extracted {len(extracted_text)} characters")
    return extracted_text


# ─────────────────────────────────────────
# PDF PARSER
# ─────────────────────────────────────────

def parse_pdf(file_content: bytes) -> str:
    """
    Extracts text from a PDF file.

    How PDF parsing works:
    - PDFs store text in 'pages'
    - PyPDF2 reads each page and extracts the text layer
    - Note: Scanned PDFs (images) have no text layer → returns empty

    Parameters:
        file_content (bytes): Raw PDF file bytes

    Returns:
        str: Extracted text from all pages
    """

    try:
        # io.BytesIO wraps bytes in a file-like object
        # PyPDF2 needs a file-like object, not raw bytes
        pdf_file = io.BytesIO(file_content)

        # Create PDF reader
        reader = PyPDF2.PdfReader(pdf_file)

        print(f"📄 DocParser: PDF has {len(reader.pages)} pages")

        # Extract text from each page
        all_text = []
        for page_num, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    all_text.append(f"--- Page {page_num + 1} ---\n{page_text}")
            except Exception as e:
                print(f"⚠️  Could not extract page {page_num + 1}: {e}")
                continue

        if not all_text:
            raise ValueError(
                "No text found in PDF. "
                "This might be a scanned document (image-based PDF). "
                "Please copy and paste the text manually instead."
            )

        # Join all pages with double newline
        combined_text = "\n\n".join(all_text)

        # Clean up the text
        return clean_extracted_text(combined_text)

    except PyPDF2.errors.PdfReadError as e:
        raise ValueError(f"Could not read PDF file. It may be corrupted or password-protected: {e}")
    except Exception as e:
        raise ValueError(f"PDF parsing failed: {str(e)}")


# ─────────────────────────────────────────
# TXT PARSER
# ─────────────────────────────────────────

def parse_txt(file_content: bytes) -> str:
    """
    Extracts text from a plain text file.

    Parameters:
        file_content (bytes): Raw TXT file bytes

    Returns:
        str: Decoded text content
    """

    # Try different encodings
    # Most files are UTF-8, but some older files use latin-1
    encodings = ["utf-8", "latin-1", "cp1252", "ascii"]

    for encoding in encodings:
        try:
            text = file_content.decode(encoding)
            print(f"📄 DocParser: TXT decoded with {encoding}")
            return clean_extracted_text(text)
        except UnicodeDecodeError:
            continue

    raise ValueError(
        "Could not decode text file. "
        "Please ensure the file is a standard text file."
    )


# ─────────────────────────────────────────
# TEXT CLEANER
# ─────────────────────────────────────────

def clean_extracted_text(text: str) -> str:
    """
    Cleans text extracted from documents.
    Removes excessive whitespace and formatting artifacts.

    Parameters:
        text (str): Raw extracted text

    Returns:
        str: Cleaned text
    """

    # Remove null bytes (sometimes appear in PDFs)
    text = text.replace("\x00", "")

    # Remove excessive whitespace
    # Replace 3+ newlines with 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Replace multiple spaces with single space
    text = re.sub(r" {2,}", " ", text)

    # Remove lines that are just whitespace
    lines = [line for line in text.split("\n") if line.strip()]
    text = "\n".join(lines)

    return text.strip()