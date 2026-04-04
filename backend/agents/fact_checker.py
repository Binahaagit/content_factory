import json
import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
from models import FactSheet

load_dotenv()

# New package uses this style
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"


def build_prompt(raw_content: str) -> str:
    return f"""
You are an expert Fact-Check and Research Agent working for a marketing team.

Your job is to carefully read the raw content below and extract key information.
You must be accurate — do NOT invent or assume any facts not present in the content.

RAW CONTENT:
\"\"\"
{raw_content}
\"\"\"

Extract the following and return ONLY a valid JSON object with EXACTLY these keys.
Do not add any explanation, markdown formatting, or text outside the JSON.

Return this exact JSON structure:
{{
    "product_name": "Name of the product or title of the article",
    "core_features": ["feature 1", "feature 2", "feature 3"],
    "target_audience": "A single sentence describing who this is for",
    "value_proposition": "The single most important benefit or selling point",
    "technical_specs": ["spec 1", "spec 2"],
    "ambiguous_flags": ["Any claim that is vague or unverified. Empty list if none found."]
}}

Rules:
1. Only use information present in the raw content
2. core_features must have at least 2 items
3. technical_specs can be empty list [] if no technical details mentioned
4. Return ONLY the JSON — no intro text, no explanation, no markdown code blocks
"""


def run_fact_checker(raw_content: str) -> FactSheet:
    prompt = build_prompt(raw_content)
    print("🔍 Agent 1: Sending content to Gemini for fact-checking...")

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
    print(f"🔍 Agent 1: Response received:\n{raw_response[:200]}...")

    # Clean markdown formatting if present
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        fact_sheet_data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Agent 1 failed to return valid JSON.\nError: {e}\nRaw: {raw_response}")

    fact_sheet = FactSheet(**fact_sheet_data)
    print("✅ Agent 1: Fact Sheet created successfully!")
    return fact_sheet