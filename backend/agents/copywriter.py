import json
import os
import time
import re
from dotenv import load_dotenv
from google import genai
from models import FactSheet, GeneratedContent, TONE_DESCRIPTIONS

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"


def build_full_prompt(fact_sheet: FactSheet) -> str:
    tone_description = TONE_DESCRIPTIONS.get(
        fact_sheet.tone, TONE_DESCRIPTIONS["professional"]
    )
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
    ) if fact_sheet.ambiguous_flags else "None"

    return f"""
You are an expert Creative Copywriter Agent for a marketing team.

You have been given a verified Fact Sheet. Generate platform-specific
marketing content based ONLY on the facts provided.

TONE: Write everything in "{fact_sheet.tone}" style — {tone_description}

CRITICAL JSON RULES:
1. Return ONLY a valid JSON object — no text before or after
2. Never use unescaped double quotes inside string values
3. Use \\n for line breaks inside strings, never raw newlines
4. No trailing commas anywhere

VERIFIED FACT SHEET:
Product           : {fact_sheet.product_name}
Target Audience   : {fact_sheet.target_audience}
Value Proposition : {fact_sheet.value_proposition}

Core Features:
{features_text}

Technical Specs:
{specs_text}

Claims to AVOID:
{flags_text}

Return EXACTLY this JSON and nothing else:
{{
    "blog_post": "500-word blog post as one string. Start with a headline. Use \\n\\n between paragraphs. No raw line breaks.",
    "social_media_thread": [
        "Post 1: Hook. Max 280 chars.",
        "Post 2: Problem this solves. Max 280 chars.",
        "Post 3: Top features. Max 280 chars.",
        "Post 4: Who this is for. Max 280 chars.",
        "Post 5: Call to action. Max 280 chars."
    ],
    "email_teaser": "One paragraph email teaser. Max 100 words."
}}
"""


def build_single_prompt(fact_sheet: FactSheet, output_type: str) -> str:
    tone_description = TONE_DESCRIPTIONS.get(
        fact_sheet.tone, TONE_DESCRIPTIONS["professional"]
    )
    features_text = "\n".join(
        f"{i+1}. {feature}"
        for i, feature in enumerate(fact_sheet.core_features)
    )

    if output_type == "blog":
        instruction = f"""
Return ONLY this JSON:
{{
    "blog_post": "500-word blog post in {fact_sheet.tone} tone. Start with headline. Use \\n\\n between paragraphs."
}}
"""
    elif output_type == "social":
        instruction = f"""
Return ONLY this JSON:
{{
    "social_media_thread": [
        "Post 1. Max 280 chars.",
        "Post 2. Max 280 chars.",
        "Post 3. Max 280 chars.",
        "Post 4. Max 280 chars.",
        "Post 5. Max 280 chars."
    ]
}}
"""
    else:
        instruction = f"""
Return ONLY this JSON:
{{
    "email_teaser": "One paragraph. Max 100 words. {fact_sheet.tone} tone."
}}
"""

    return f"""
You are an expert Creative Copywriter Agent.

TONE: "{fact_sheet.tone}" — {tone_description}

FACT SHEET:
Product          : {fact_sheet.product_name}
Target Audience  : {fact_sheet.target_audience}
Value Proposition: {fact_sheet.value_proposition}

Core Features:
{features_text}

RULES:
1. Only use facts from the Fact Sheet
2. Return ONLY valid JSON — no markdown, no explanation
3. No unescaped double quotes inside strings

{instruction}
"""


def call_gemini(prompt: str) -> str:
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
                print(f"⏳ Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e
    return response.text


def clean_json_response(raw: str) -> dict:
    cleaned = raw.strip()

    # Remove markdown code blocks
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    # Attempt 1: direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 2: find JSON boundaries
    try:
        start = cleaned.index("{")
        end = cleaned.rindex("}") + 1
        return json.loads(cleaned[start:end])
    except (ValueError, json.JSONDecodeError):
        pass

    # Attempt 3: regex extract
    try:
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
    except json.JSONDecodeError:
        pass

    # Attempt 4: fix smart quotes and control chars
    try:
        fixed = cleaned
        fixed = fixed.replace('\u201c', '"').replace('\u201d', '"')
        fixed = fixed.replace('\u2018', "'").replace('\u2019', "'")
        fixed = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', fixed)
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    raise ValueError(
        f"Failed to parse JSON after 4 attempts.\n"
        f"Raw response preview: {raw[:300]}"
    )


def run_copywriter(fact_sheet: FactSheet) -> GeneratedContent:
    print(f"✍️  Agent 2: Generating content in '{fact_sheet.tone}' tone...")
    prompt = build_full_prompt(fact_sheet)
    raw_response = call_gemini(prompt)
    print(f"✍️  Agent 2: Response received ({len(raw_response)} chars)")

    content_data = clean_json_response(raw_response)

    social_thread = content_data.get("social_media_thread", [])
    while len(social_thread) < 5:
        social_thread.append("(Post not generated)")
    social_thread = social_thread[:5]
    content_data["social_media_thread"] = social_thread

    generated_content = GeneratedContent(**content_data)
    print(f"✅ Agent 2 complete!")
    return generated_content


def run_single_regenerate(fact_sheet: FactSheet, output_type: str) -> str:
    print(f"🔄 Regenerating: {output_type} in '{fact_sheet.tone}' tone...")
    prompt = build_single_prompt(fact_sheet, output_type)
    raw_response = call_gemini(prompt)
    content_data = clean_json_response(raw_response)

    if output_type == "blog":
        result = content_data.get("blog_post", "")
    elif output_type == "social":
        social = content_data.get("social_media_thread", [])
        while len(social) < 5:
            social.append("(Post not generated)")
        result = json.dumps(social[:5])
    else:
        result = content_data.get("email_teaser", "")

    print(f"✅ Regenerated {output_type}!")
    return result