# models.py
# Updated with:
# - Tone field for tone selector feature
# - Step2Request for editable fact sheet feature
# - RegenerateRequest for regenerate single output feature
# - DownloadRequest for download feature

from pydantic import BaseModel
from typing import List, Optional


# ─────────────────────────────────────────
# TONE OPTIONS
# ─────────────────────────────────────────

# These are the exact tone values the frontend will send
# Literal means only these exact strings are accepted
# Anything else → Pydantic throws a validation error automatically
from typing import Literal

TONE_OPTIONS = Literal["professional", "casual", "witty"]

# What each tone means — passed to Agent 2 in the prompt
TONE_DESCRIPTIONS = {
    "professional": (
        "formal, authoritative, and data-driven. "
        "Use industry terminology. No slang. "
        "Suitable for B2B audiences and LinkedIn."
    ),
    "casual": (
        "friendly, conversational, and approachable. "
        "Write like you're talking to a friend. "
        "Short sentences. Relatable language."
    ),
    "witty": (
        "clever, playful, and entertaining. "
        "Use wordplay, light humour, and unexpected angles. "
        "Keep it smart — not silly."
    )
}


# ─────────────────────────────────────────
# INPUT MODEL (Step 1 — text input)
# ─────────────────────────────────────────

class ContentInput(BaseModel):
    """
    What the user sends for the FIRST step.
    Now includes tone choice.

    Example:
    {
        "raw_content": "We launched ProductX...",
        "tone": "casual",
        "source_url": null
    }
    """
    raw_content: str
    tone: TONE_OPTIONS = "professional"
    # Default is professional if user doesn't pick anything
    source_url: Optional[str] = None


# ─────────────────────────────────────────
# FACT SHEET MODEL (Agent 1 output)
# ─────────────────────────────────────────

class FactSheet(BaseModel):
    """
    Agent 1 produces this.
    Now also carries tone so Agent 2 knows what tone to use.

    Example:
    {
        "product_name": "ProductX",
        "core_features": ["Fast", "Free"],
        "target_audience": "Small teams",
        "value_proposition": "Save 10 hours/week",
        "technical_specs": ["REST API"],
        "ambiguous_flags": [],
        "tone": "casual"
    }
    """
    product_name: str
    core_features: List[str]
    target_audience: str
    value_proposition: str
    technical_specs: List[str]
    ambiguous_flags: List[str]
    tone: TONE_OPTIONS = "professional"
    # tone is carried through from input → fact sheet → copywriter


# ─────────────────────────────────────────
# STEP 2 REQUEST MODEL (Editable Fact Sheet)
# ─────────────────────────────────────────

class Step2Request(BaseModel):
    """
    This is what the frontend sends for the SECOND step.

    The user may have edited the fact sheet fields.
    We send the (possibly edited) fact sheet to Agent 2.

    This is the KEY model for the "Editable Fact Sheet" feature.
    Instead of running both agents automatically,
    we pause after Agent 1 and let the user review/edit,
    then they click "Generate Content" to trigger Agent 2.

    Example:
    {
        "fact_sheet": {
            "product_name": "ProductX (edited by user)",
            "core_features": ["Fast", "Free", "New feature user added"],
            ...
            "tone": "witty"
        }
    }
    """
    fact_sheet: FactSheet
    # The entire fact sheet (edited or original) is sent back to us
    # Agent 2 will use whatever is in here


# ─────────────────────────────────────────
# REGENERATE REQUEST MODEL
# ─────────────────────────────────────────

class RegenerateRequest(BaseModel):
    """
    When user clicks "Regenerate" on a specific output,
    frontend sends this model.

    output_type tells us WHICH output to regenerate:
    - "blog"   → regenerate only the blog post
    - "social" → regenerate only the social thread
    - "email"  → regenerate only the email teaser

    Example:
    {
        "fact_sheet": { ...same fact sheet... },
        "output_type": "blog"
    }
    """
    fact_sheet: FactSheet
    output_type: Literal["blog", "social", "email"]


# ─────────────────────────────────────────
# GENERATED CONTENT MODEL (Agent 2 output)
# ─────────────────────────────────────────

class GeneratedContent(BaseModel):
    """
    Agent 2 produces this.
    Unchanged from before.
    """
    blog_post: str
    social_media_thread: List[str]
    email_teaser: str


# ─────────────────────────────────────────
# STEP 1 RESPONSE (after Agent 1)
# ─────────────────────────────────────────

class Step1Response(BaseModel):
    """
    What we send back after Agent 1 completes.
    Frontend shows the fact sheet and lets user edit it.

    Example:
    {
        "success": true,
        "fact_sheet": { ...Agent 1 output... },
        "error_message": null
    }
    """
    success: bool
    fact_sheet: Optional[FactSheet] = None
    error_message: Optional[str] = None


# ─────────────────────────────────────────
# FULL RESPONSE (after Agent 2)
# ─────────────────────────────────────────

class ContentFactoryResponse(BaseModel):
    """
    Final complete response after both agents.

    Example:
    {
        "success": true,
        "fact_sheet": { ... },
        "generated_content": { ... },
        "error_message": null
    }
    """
    success: bool
    fact_sheet: Optional[FactSheet] = None
    generated_content: Optional[GeneratedContent] = None
    error_message: Optional[str] = None


# ─────────────────────────────────────────
# REGENERATE RESPONSE
# ─────────────────────────────────────────

class RegenerateResponse(BaseModel):
    """
    Response after regenerating a single output.
    Only contains the one piece that was regenerated.

    Example (blog regenerated):
    {
        "success": true,
        "output_type": "blog",
        "content": "New blog post text...",
        "error_message": null
    }
    """
    success: bool
    output_type: str
    content: str  # The regenerated piece (string for blog/email, JSON for social)
    error_message: Optional[str] = None


# ─────────────────────────────────────────
# DOWNLOAD REQUEST
# ─────────────────────────────────────────

class DownloadRequest(BaseModel):
    """
    When user clicks download, frontend sends this.

    format tells us what to download:
    - "blog_docx"  → blog post as Word document
    - "social_txt" → social thread as text file
    - "email_txt"  → email teaser as text file
    - "all_txt"    → all three as one text file

    Example:
    {
        "content": "Blog post text here...",
        "filename": "wordloom-blog",
        "format": "blog_docx"
    }
    """
    content: str
    filename: str = "wordloom-content"
    format: Literal["blog_docx", "social_txt", "email_txt", "all_txt"]