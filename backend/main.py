# main.py
# This is the main server file - the entry point of our backend
# It creates a FastAPI web server with API endpoints
# The frontend will send requests here, and we return AI-generated content

from fastapi import FastAPI, HTTPException    # FastAPI framework
from fastapi.middleware.cors import CORSMiddleware  # Allows frontend to talk to backend
from models import ContentInput, ContentFactoryResponse  # Our data shapes
from agents.fact_checker import run_fact_checker   # Agent 1
from agents.copywriter import run_copywriter       # Agent 2

# ─────────────────────────────────────────
# CREATE THE FASTAPI APP
# ─────────────────────────────────────────

# FastAPI() creates our web application instance
# title and description appear in auto-generated API docs
app = FastAPI(
    title="Autonomous Content Factory",
    description="A two-agent AI system that transforms raw content into platform-specific marketing material",
    version="1.0.0"
)


# ─────────────────────────────────────────
# CORS SETUP
# ─────────────────────────────────────────

# CORS = Cross-Origin Resource Sharing
# 
# Problem: By default, browsers BLOCK requests between different ports.
# Our frontend runs on port 5173 (Vite/React default)
# Our backend runs on port 8000 (FastAPI default)
# Without CORS setup, the browser would block frontend → backend requests!
#
# Solution: We tell the backend "it's okay to accept requests from these origins"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # React dev server (Vite)
        "http://localhost:3000",    # React dev server (Create React App)
        "http://127.0.0.1:5173",   # Same as localhost but different format
    ],
    allow_credentials=True,         # Allow cookies if needed
    allow_methods=["*"],            # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],            # Allow all headers
)


# ─────────────────────────────────────────
# ENDPOINT 1: HEALTH CHECK
# ─────────────────────────────────────────

@app.get("/")
def health_check():
    """
    A simple endpoint to check if the server is running.
    
    When you visit http://localhost:8000/ in your browser,
    you should see this JSON response.
    
    The @app.get("/") decorator means:
    "When someone makes a GET request to '/', run this function"
    """
    return {
        "status": "running",
        "message": "Autonomous Content Factory API is live!",
        "version": "1.0.0"
    }


# ─────────────────────────────────────────
# ENDPOINT 2: MAIN GENERATE ENDPOINT
# ─────────────────────────────────────────

@app.post("/generate", response_model=ContentFactoryResponse)
async def generate_content(content_input: ContentInput):
    """
    This is the main endpoint that runs both AI agents.
    
    How it works:
    1. Frontend sends POST request with raw_content
    2. We run Agent 1 (fact_checker) → get FactSheet
    3. We run Agent 2 (copywriter) → get GeneratedContent
    4. We return both to the frontend
    
    The @app.post("/generate") decorator means:
    "When someone makes a POST request to '/generate', run this function"
    
    async def means this function can handle multiple requests
    without blocking — important for performance
    
    Parameters:
        content_input (ContentInput): Automatically parsed from request body
        
    Returns:
        ContentFactoryResponse: Complete response with fact sheet + content
    """
    
    # Print to terminal so we can see what's happening (for debugging)
    print("\n" + "="*50)
    print("📨 New request received!")
    print(f"📄 Content preview: {content_input.raw_content[:100]}...")
    print("="*50 + "\n")
    
    # ── Step 1: Validate input ──
    # Check if the user actually sent some content
    if not content_input.raw_content.strip():
        # HTTPException sends an error response back to frontend
        # 400 = "Bad Request" — the user sent something wrong
        raise HTTPException(
            status_code=400,
            detail="raw_content cannot be empty. Please provide some content to process."
        )
    
    # Check minimum content length
    # Very short content won't give Agent 1 enough to work with
    if len(content_input.raw_content.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Content is too short. Please provide at least 50 characters."
        )
    
    # ── Step 2: Run Agent 1 (Fact Checker) ──
    try:
        print("🚀 Starting Agent 1: Fact Checker...")
        fact_sheet = run_fact_checker(content_input.raw_content)
        print(f"✅ Fact Sheet created for: {fact_sheet.product_name}")
        
    except ValueError as e:
        # ValueError means Agent 1 had trouble parsing Gemini's response
        raise HTTPException(
            status_code=500,
            detail=f"Agent 1 (Fact Checker) failed: {str(e)}"
        )
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error in Agent 1: {str(e)}"
        )
    
    # ── Step 3: Run Agent 2 (Copywriter) ──
    try:
        print("🚀 Starting Agent 2: Copywriter...")
        generated_content = run_copywriter(fact_sheet)
        print("✅ All content generated successfully!")
        
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent 2 (Copywriter) failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error in Agent 2: {str(e)}"
        )
    
    # ── Step 4: Return the complete response ──
    print("\n🎉 Request completed successfully!\n")
    
    return ContentFactoryResponse(
        success=True,
        fact_sheet=fact_sheet,
        generated_content=generated_content,
        error_message=None    # No error — everything worked
    )


# ─────────────────────────────────────────
# BONUS ENDPOINT: GET FACT SHEET ONLY
# ─────────────────────────────────────────

@app.post("/fact-check-only")
async def fact_check_only(content_input: ContentInput):
    """
    A bonus endpoint that ONLY runs Agent 1.
    Useful for testing Agent 1 in isolation
    without waiting for Agent 2 to finish.
    """
    
    if not content_input.raw_content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    
    try:
        fact_sheet = run_fact_checker(content_input.raw_content)
        return {
            "success": True,
            "fact_sheet": fact_sheet.model_dump()  
            # .model_dump() converts Pydantic model → plain dictionary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))