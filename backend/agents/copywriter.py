import json
import os
import time
from dotenv import load_dotenv
from google import genai
from models import FactSheet, GeneratedContent

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"


def build_prompt(fact_sheet: FactSheet) -> str:
    features_text = "\n".join(
        f"{i+1}. {feature}"
        for i, feature in enumerate(fact_sheet.core_features)
    )
    specs_text = "\n".join(
        f"{i+1}. {spec}"
        for i, spec in enumerate(fact_sheet.technical_specs)
    ) if fact_sheet.technical_specs else "No specific technical specs mentioned."

    flags_text = "\n".join(
        f"- {flag}"
        for flag in fact_sheet.ambiguous_flags
    ) if fact_sheet.ambiguous_flags else "None - all claims are clear."

    return f"""
You are an expert Creative Copywriter Agent for a marketing team.

You have been given a verified Fact Sheet. Generate platform-specific marketing
content based ONLY on the facts provided. Never invent anything.

VERIFIED FACT SHEET
Product / Title   : {fact_sheet.product_name}
Target Audience   : {fact_sheet.target_audience}
Value Proposition : {fact_sheet.value_proposition}

Core Features:
{features_text}

Technical Specs:
{specs_text}

Ambiguous Claims to AVOID:
{flags_text}

Generate ALL THREE and return this EXACT JSON — no markdown, no extra text:
{{
    "blog_post": "A 500-word blog post. Professional tone. Start with a headline. Use paragraphs.",
    "social_media_thread": [
        "Post 1: Hook. Max 280 chars.",
        "Post 2: The problem this solves. Max 280 chars.",
        "Post 3: Top features. Max 280 chars.",
        "Post 4: Who is this for. Max 280 chars.",
        "Post 5: Call to action. Max 280 chars."
    ],
    "email_teaser": "One paragraph. Warm and exciting tone. Max 100 words."
}}

Return ONLY the JSON object. No intro. No explanation. No markdown.
"""


def run_copywriter(fact_sheet: FactSheet) -> GeneratedContent:
    prompt = build_prompt(fact_sheet)
    print("✍️  Agent 2: Generating platform-specific content...")

    max_retries = 3
    response = None

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                wait_time = 30 * (attempt + 1)
                print(f"⏳ Rate limited. Waiting {wait_time}s before retry {attempt + 2}/{max_retries}...")
                time.sleep(wait_time)
            else:
                raise e

    raw_response = response.text
    print(f"✍️  Agent 2: Response received:\n{raw_response[:200]}...")

    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        content_data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Agent 2 failed to return valid JSON.\nError: {e}\nRaw: {raw_response}")

    social_thread = content_data.get("social_media_thread", [])
    while len(social_thread) < 5:
        social_thread.append("(Post not generated)")
    social_thread = social_thread[:5]
    content_data["social_media_thread"] = social_thread

    generated_content = GeneratedContent(**content_data)
    print("✅ Agent 2: Content generated successfully!")
    return generated_content