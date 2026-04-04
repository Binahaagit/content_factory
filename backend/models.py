# models.py
# This file defines the "shape" of all data used in our project.
# We use Pydantic - a library that validates data automatically.
# If data doesn't match the shape, it throws a clear error immediately.

from pydantic import BaseModel
from typing import List, Optional

# ─────────────────────────────────────────
# INPUT MODEL
# This defines what the USER sends to us
# ─────────────────────────────────────────

class ContentInput(BaseModel):
    """
    This is what the user submits from the frontend.
    
    Example:
    {
        "raw_content": "We just launched ProductX, a new AI tool that...",
        "source_url": "https://example.com/product"   ← optional
    }
    """
    raw_content: str                    # The raw article/product info the user pastes
    source_url: Optional[str] = None   # Optional URL source (user may or may not provide)


# ─────────────────────────────────────────
# FACT SHEET MODEL
# This is what Agent 1 produces
# ─────────────────────────────────────────

class FactSheet(BaseModel):
    """
    Agent 1 reads raw content and fills this structure.
    This becomes the single source of truth for Agent 2.
    
    Example:
    {
        "product_name": "ProductX",
        "core_features": ["AI-powered", "Real-time sync", "Free tier"],
        "target_audience": "Small business owners",
        "value_proposition": "Save 10 hours a week on manual work",
        "technical_specs": ["Python 3.10", "REST API", "99.9% uptime"],
        "ambiguous_flags": ["Claim '10x faster' has no source cited"]
    }
    """
    product_name: str                        # Name of the product or article title
    core_features: List[str]                 # List of main features
    target_audience: str                     # Who is this for?
    value_proposition: str                   # The main benefit/selling point
    technical_specs: List[str]               # Technical details mentioned
    ambiguous_flags: List[str]               # Unclear/unverified claims Agent 1 found


# ─────────────────────────────────────────
# GENERATED CONTENT MODEL
# This is what Agent 2 produces
# ─────────────────────────────────────────

class GeneratedContent(BaseModel):
    """
    Agent 2 takes the FactSheet and fills this structure.
    Three platform-specific content pieces.
    
    Example:
    {
        "blog_post": "# ProductX: The Future of Work\n\n...(500 words)",
        "social_media_thread": ["Post 1: ...", "Post 2: ...", ...],
        "email_teaser": "Introducing ProductX — the tool that saves you 10hrs/week..."
    }
    """
    blog_post: str                      # 500-word professional blog post
    social_media_thread: List[str]      # List of 5 social media posts
    email_teaser: str                   # 1 paragraph email teaser


# ─────────────────────────────────────────
# FINAL RESPONSE MODEL
# This is the complete response sent back to the frontend
# ─────────────────────────────────────────

class ContentFactoryResponse(BaseModel):
    """
    The complete response our API sends back to the user.
    Contains everything - fact sheet + all generated content.
    
    Example:
    {
        "success": true,
        "fact_sheet": { ...FactSheet data... },
        "generated_content": { ...GeneratedContent data... },
        "error_message": null
    }
    """
    success: bool                                       # Did everything work? True/False
    fact_sheet: Optional[FactSheet] = None             # Agent 1's output
    generated_content: Optional[GeneratedContent] = None  # Agent 2's output
    error_message: Optional[str] = None                # If something failed, explain why