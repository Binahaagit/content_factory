# main.py
# Updated with:
# 1. Two-step generation (Agent 1 → user edits → Agent 2)
# 2. Regenerate single output endpoint
# 3. Download endpoint
# 4. URL and doc input endpoints

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import (
    ContentInput, ContentFactoryResponse,
    Step1Response, Step2Request,
    RegenerateRequest, RegenerateResponse,
    DownloadRequest
)
from agents.fact_checker import run_fact_checker
from agents.copywriter import run_copywriter, run_single_regenerate
from utils.scraper import scrape_url
from utils.doc_parser import parse_document
import io

app = FastAPI(
    title="WordLoom API",
    description="Autonomous Content Factory — Two AI agents, three output formats",
    version="3.0.0"
)


# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "status": "running",
        "name": "WordLoom API",
        "version": "3.0.0",
        "endpoints": [
            "POST /generate-step1  → Run Agent 1 only",
            "POST /generate-step2  → Run Agent 2 with edited fact sheet",
            "POST /generate        → Run both agents (original flow)",
            "POST /generate-url    → Scrape URL then run both agents",
            "POST /generate-doc    → Upload doc then run both agents",
            "POST /regenerate      → Regenerate single output",
            "POST /download        → Download output as file",
        ]
    }


# ─────────────────────────────────────────
# STEP 1: RUN AGENT 1 ONLY
# ─────────────────────────────────────────

@app.post("/generate-step1", response_model=Step1Response)
async def generate_step1(content_input: ContentInput):
    """
    Runs ONLY Agent 1 (Fact Checker).
    Returns the Fact Sheet for user to review and edit.
    User then confirms and triggers Step 2.

    This enables the "Editable Fact Sheet" feature.
    """
    print("\n" + "="*50)
    print("📨 Step 1: Running Agent 1 only")
    print(f"🎨 Tone: {content_input.tone}")
    print(f"📄 Preview: {content_input.raw_content[:80]}...")
    print("="*50)

    if not content_input.raw_content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")

    if len(content_input.raw_content.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Content too short. Minimum 50 characters."
        )

    try:
        # Pass tone to fact checker so it gets stored in FactSheet
        fact_sheet = run_fact_checker(
            content_input.raw_content,
            tone=content_input.tone
        )
        print(f"✅ Step 1 complete: {fact_sheet.product_name}")
        return Step1Response(success=True, fact_sheet=fact_sheet)

    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Agent 1 failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# ─────────────────────────────────────────
# STEP 2: RUN AGENT 2 WITH EDITED FACT SHEET
# ─────────────────────────────────────────

@app.post("/generate-step2", response_model=ContentFactoryResponse)
async def generate_step2(request: Step2Request):
    """
    Runs ONLY Agent 2 (Copywriter).
    Receives the (possibly edited) Fact Sheet from frontend.
    Generates all three content pieces.

    This is the second half of the two-step flow.
    """
    print("\n" + "="*50)
    print("📨 Step 2: Running Agent 2 with fact sheet")
    print(f"📋 Product: {request.fact_sheet.product_name}")
    print(f"🎨 Tone: {request.fact_sheet.tone}")
    print("="*50)

    try:
        generated_content = run_copywriter(request.fact_sheet)
        print("✅ Step 2 complete!")
        return ContentFactoryResponse(
            success=True,
            fact_sheet=request.fact_sheet,
            generated_content=generated_content
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Agent 2 failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# ─────────────────────────────────────────
# ORIGINAL: BOTH AGENTS AT ONCE
# ─────────────────────────────────────────

@app.post("/generate", response_model=ContentFactoryResponse)
async def generate_both(content_input: ContentInput):
    """
    Original endpoint — runs both agents sequentially.
    Kept for backward compatibility.
    """
    print("\n" + "="*50)
    print("📨 Full pipeline: Both agents")
    print(f"🎨 Tone: {content_input.tone}")
    print("="*50)

    if not content_input.raw_content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")

    try:
        fact_sheet = run_fact_checker(content_input.raw_content, tone=content_input.tone)
        generated_content = run_copywriter(fact_sheet)
        return ContentFactoryResponse(
            success=True,
            fact_sheet=fact_sheet,
            generated_content=generated_content
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# URL INPUT
# ─────────────────────────────────────────

@app.post("/generate-url", response_model=ContentFactoryResponse)
async def generate_from_url(payload: dict):
    """
    Scrapes a URL, runs both agents.
    payload: { "url": "...", "tone": "casual" }
    """
    print("\n" + "="*50)
    print("📨 URL Input")

    url = payload.get("url", "").strip()
    tone = payload.get("tone", "professional")

    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    print(f"🔗 URL: {url} | Tone: {tone}")
    print("="*50)

    try:
        raw_content = scrape_url(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        fact_sheet = run_fact_checker(raw_content, tone=tone)
        generated_content = run_copywriter(fact_sheet)
        return ContentFactoryResponse(
            success=True,
            fact_sheet=fact_sheet,
            generated_content=generated_content
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# DOCUMENT UPLOAD
# ─────────────────────────────────────────

@app.post("/generate-doc", response_model=ContentFactoryResponse)
async def generate_from_document(
    file: UploadFile = File(...),
    tone: str = "professional"
):
    """
    Accepts PDF or TXT file upload.
    tone is passed as a query parameter:
    POST /generate-doc?tone=casual
    """
    print("\n" + "="*50)
    print(f"📨 Document Upload: {file.filename} | Tone: {tone}")
    print("="*50)

    try:
        file_content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    try:
        raw_content = parse_document(file_content, file.filename or "", file.content_type or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        fact_sheet = run_fact_checker(raw_content, tone=tone)
        generated_content = run_copywriter(fact_sheet)
        return ContentFactoryResponse(
            success=True,
            fact_sheet=fact_sheet,
            generated_content=generated_content
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# REGENERATE SINGLE OUTPUT
# ─────────────────────────────────────────

@app.post("/regenerate", response_model=RegenerateResponse)
async def regenerate_output(request: RegenerateRequest):
    """
    Regenerates ONE specific output piece.
    Much faster than re-running everything.

    Request body:
    {
        "fact_sheet": { ...current fact sheet... },
        "output_type": "blog"  ← or "social" or "email"
    }
    """
    print("\n" + "="*50)
    print(f"🔄 Regenerating: {request.output_type}")
    print(f"🎨 Tone: {request.fact_sheet.tone}")
    print("="*50)

    valid_types = ["blog", "social", "email"]
    if request.output_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid output_type. Must be one of: {valid_types}"
        )

    try:
        content = run_single_regenerate(request.fact_sheet, request.output_type)
        return RegenerateResponse(
            success=True,
            output_type=request.output_type,
            content=content
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")


# ─────────────────────────────────────────
# DOWNLOAD OUTPUT AS FILE
# ─────────────────────────────────────────

@app.post("/download")
async def download_content(request: DownloadRequest):
    """
    Returns content as a downloadable file.

    format options:
    - "blog_docx"  → .txt file (simple, no extra libraries)
    - "social_txt" → .txt file
    - "email_txt"  → .txt file
    - "all_txt"    → .txt file with all content

    StreamingResponse sends the file directly to the browser
    as a download, not as JSON.
    """
    print(f"⬇️  Download requested: {request.format}")

    # Prepare content and filename based on format
    if request.format == "blog_docx":
        content = request.content
        filename = f"{request.filename}-blog.txt"
        media_type = "text/plain"

    elif request.format == "social_txt":
        content = request.content
        filename = f"{request.filename}-social.txt"
        media_type = "text/plain"

    elif request.format == "email_txt":
        content = request.content
        filename = f"{request.filename}-email.txt"
        media_type = "text/plain"

    elif request.format == "all_txt":
        content = request.content
        filename = f"{request.filename}-all.txt"
        media_type = "text/plain"

    else:
        raise HTTPException(status_code=400, detail="Invalid format")

    # Convert string to bytes
    # io.BytesIO wraps bytes in a file-like object
    # StreamingResponse needs a file-like object
    file_bytes = io.BytesIO(content.encode("utf-8"))

    # StreamingResponse sends the file as a download
    # Content-Disposition: attachment tells browser to download, not display
    return StreamingResponse(
        file_bytes,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )