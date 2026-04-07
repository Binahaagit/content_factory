# 🧵 WordLoom — Autonomous Content Factory

> **Weaving Words into Wonder** — A two-agent AI system that transforms raw content into publish-ready blog posts, social media threads, and email teasers instantly.

---

## 🧩 The Problem

Every time a product is launched or an article is written, marketing teams must manually rewrite the same content multiple times — once for a blog, once for LinkedIn, once for a newsletter. This repetitive process causes creative burnout, introduces inconsistencies in tone and facts, and creates a bottleneck that slows down every product launch.

**Pain Points:**
- Manually repurposing content for each platform is repetitive and time-consuming
- Human rewrites introduce factual errors and tone inconsistencies across channels
- Every product launch is delayed waiting for platform-specific content

---

## ✅ The Solution

WordLoom is a **two-agent AI system** where a single source document is first verified for facts and then transformed into platform-specific content — automatically and consistently.

**Agent 1 — Fact Checker (The Analytical Brain):**
Reads raw source material and produces a verified Fact Sheet that the content agent must strictly follow.

**Agent 2 — Copywriter (The Creative Voice):**
Takes the Fact Sheet and generates accurate, platform-appropriate content across three channels simultaneously.

**Key Features:**
- Three input methods: paste text, scrape a URL, or upload a PDF/TXT document
- Tone selector: Professional, Casual, or Witty
- Editable Fact Sheet: review and correct Agent 1's findings before Agent 2 writes
- Regenerate single outputs without re-running both agents
- Download outputs as files
- Beautiful dark purple UI with premium aesthetics

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM |
| **Styling** | Inline CSS with custom design system, Cormorant Garamond + DM Sans fonts |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **AI Engine** | Google Gemini API (`gemini-2.5-flash`) via `google-genai` |
| **Web Scraping** | BeautifulSoup4, Requests |
| **Document Parsing** | PyPDF2 |
| **Data Validation** | Pydantic v2 |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
wordloom/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── fact_checker.py      # Agent 1 — extracts and verifies facts
│   │   └── copywriter.py        # Agent 2 — generates platform content
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── scraper.py           # URL scraping utility
│   │   └── doc_parser.py        # PDF/TXT parsing utility
│   ├── main.py                  # FastAPI server and all endpoints
│   ├── models.py                # Pydantic data models
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Landing page
│   │   │   └── AppPage.jsx      # Main app page
│   │   ├── components/
│   │   │   ├── InputPanel.jsx   # Input panel (text/URL/doc)
│   │   │   ├── FactSheetPanel.jsx # Editable fact sheet
│   │   │   └── OutputPanel.jsx  # Generated content with tabs
│   │   ├── main.jsx             # React entry point with routing
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── .env                         # API keys (not committed)
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your free API key at [aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)

### 3. Set Up the Backend

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

### 4. Set Up the Frontend

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5. Open the App

Visit `http://localhost:5173` in your browser. You should see the WordLoom landing page.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/generate-step1` | Run Agent 1 only (fact checking) |
| POST | `/generate-step2` | Run Agent 2 with edited fact sheet |
| POST | `/generate` | Run both agents sequentially |
| POST | `/generate-url` | Scrape URL and run both agents |
| POST | `/generate-doc` | Upload document and run both agents |
| POST | `/regenerate` | Regenerate a single output piece |
| POST | `/download` | Download output as a file |

---

## 🎯 How to Use

1. **Visit** `http://localhost:5173`
2. **Click** "Start Creating" on the landing page
3. **Choose** your input method: Text, URL, or Document
4. **Select** your tone: Professional, Casual, or Witty
5. **Click** "Analyse Content" — Agent 1 runs and produces a Fact Sheet
6. **Review and edit** the Fact Sheet if needed
7. **Click** "Generate Content" — Agent 2 runs and produces all three outputs
8. **Switch** between Blog Post, Social Media, and Email tabs
9. **Copy** or **Download** your content

---

## 🌐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

---

## 📝 Notes

- The free tier of Gemini API allows 15 requests per minute and 1500 requests per day
- If you hit rate limits, the app will automatically retry up to 3 times with a 30-second wait
- Scanned/image-based PDFs are not supported — only text-layer PDFs work
- The URL scraper works best with article and product pages; login-protected or JavaScript-rendered pages may not work

---

## 👤 Author

Built for the Cymonic.ai Hackathon 2026.
