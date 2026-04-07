# scraper.py
# This file handles extracting clean text from a URL
# When user pastes a URL, we fetch the page and extract readable content

import requests
from bs4 import BeautifulSoup
import re

# ─────────────────────────────────────────
# HEADERS
# ─────────────────────────────────────────

# Some websites block requests from bots
# We fake a browser User-Agent so websites think we're a real browser
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


# ─────────────────────────────────────────
# MAIN SCRAPER FUNCTION
# ─────────────────────────────────────────

def scrape_url(url: str) -> str:
    """
    Fetches a webpage and extracts clean, readable text from it.

    Steps:
    1. Validate the URL format
    2. Fetch the webpage HTML
    3. Parse HTML and remove junk (scripts, ads, nav, footer)
    4. Extract clean readable text
    5. Return cleaned text

    Parameters:
        url (str): The URL to scrape

    Returns:
        str: Clean extracted text from the page

    Raises:
        ValueError: If URL is invalid or page can't be fetched
    """

    # ── Step 1: Validate URL ──
    if not url.startswith(("http://", "https://")):
        raise ValueError(
            "Invalid URL. Must start with http:// or https://"
        )

    print(f"🌐 Scraper: Fetching URL: {url}")

    # ── Step 2: Fetch the page ──
    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=15,        # Wait max 15 seconds
            allow_redirects=True  # Follow redirects (e.g. http → https)
        )

        # raise_for_status() throws an error if status is 4xx or 5xx
        # 404 = page not found, 403 = forbidden, 500 = server error
        response.raise_for_status()

    except requests.exceptions.Timeout:
        raise ValueError("Request timed out. The website took too long to respond.")
    except requests.exceptions.ConnectionError:
        raise ValueError("Could not connect to the URL. Check if the website is accessible.")
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"Website returned an error: {e}")
    except Exception as e:
        raise ValueError(f"Failed to fetch URL: {str(e)}")

    print(f"🌐 Scraper: Page fetched successfully ({len(response.content)} bytes)")

    # ── Step 3: Parse HTML ──
    # BeautifulSoup parses raw HTML into a navigable tree structure
    # "html.parser" is Python's built-in HTML parser — no extra install needed
    soup = BeautifulSoup(response.content, "html.parser")

    # Remove elements we don't want
    # These contain noise: menus, ads, cookie banners, JavaScript code
    UNWANTED_TAGS = [
        "script",    # JavaScript code
        "style",     # CSS styles
        "nav",       # Navigation menus
        "header",    # Site headers
        "footer",    # Site footers
        "aside",     # Sidebars
        "iframe",    # Embedded frames
        "noscript",  # No-script fallbacks
        "svg",       # SVG graphics
        "img",       # Images (no text)
        "button",    # Buttons
        "form",      # Forms
        "[document]" # Document metadata
    ]

    # .decompose() completely removes the tag and its contents from the tree
    for tag in soup(UNWANTED_TAGS):
        tag.decompose()

    # Also remove elements with classes/ids that suggest ads or navigation
    # Common class names for non-content areas
    JUNK_CLASSES = [
        "nav", "navbar", "menu", "sidebar", "footer",
        "header", "advertisement", "ad", "cookie",
        "popup", "modal", "banner", "social", "share"
    ]

    for junk_class in JUNK_CLASSES:
        # Find elements where class name CONTAINS the junk word
        for element in soup.find_all(class_=re.compile(junk_class, re.I)):
            element.decompose()

    # ── Step 4: Extract text ──
    # Try to find the main content area first
    # Websites often mark their main content with these tags/attributes
    main_content = (
        soup.find("article") or      # Blog posts, news articles
        soup.find("main") or         # Main content area
        soup.find(id="content") or   # Content by ID
        soup.find(id="main") or      # Main by ID
        soup.find(class_="content") or
        soup.find(class_="post") or
        soup.find(class_="article") or
        soup.body                    # Fallback: entire body
    )

    if not main_content:
        raise ValueError("Could not find readable content on this page.")

    # .get_text() extracts all text, separator="\n" adds newlines between elements
    raw_text = main_content.get_text(separator="\n", strip=True)

    # ── Step 5: Clean the text ──
    cleaned_text = clean_text(raw_text)

    # Check if we got enough content
    if len(cleaned_text) < 100:
        raise ValueError(
            "Could not extract enough text from this page. "
            "The page may be JavaScript-rendered or require login."
        )

    print(f"🌐 Scraper: Extracted {len(cleaned_text)} characters of clean text")
    return cleaned_text


def clean_text(text: str) -> str:
    """
    Cleans raw extracted text by removing noise.

    Parameters:
        text (str): Raw text extracted from HTML

    Returns:
        str: Cleaned text
    """

    # Split into lines for processing
    lines = text.split("\n")

    cleaned_lines = []
    for line in lines:
        line = line.strip()  # Remove leading/trailing whitespace

        # Skip very short lines (usually navigation items, labels)
        if len(line) < 3:
            continue

        # Skip lines that are just numbers (page numbers, counters)
        if line.isdigit():
            continue

        # Skip lines with too many special characters (usually code or junk)
        special_char_ratio = sum(1 for c in line if not c.isalnum() and c != " ") / max(len(line), 1)
        if special_char_ratio > 0.5:
            continue

        cleaned_lines.append(line)

    # Join lines back together
    cleaned = "\n".join(cleaned_lines)

    # Remove multiple consecutive blank lines (replace 3+ newlines with 2)
    # re.sub(pattern, replacement, string)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    # Remove multiple spaces
    cleaned = re.sub(r" {2,}", " ", cleaned)

    return cleaned.strip()