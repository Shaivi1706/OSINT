
# OSINT Investigator

A Python-powered OSINT (Open Source Intelligence) tool to search for people or entities on the web, aggregate results, extract named entities using NLP, and generate AI-powered summaries using Google Gemini.

---

## 🚀 Features

- 🌐 Searches web sources via Google Custom Search API  
- 📝 Extracts entities (person, org, location) using SpaCy  
- 🤖 Generates investigation summaries using Gemini (Generative AI)  
- 📦 Saves filtered, enriched results as JSON  
- 🔍 Supports multiple search types (LinkedIn, news/case, general web)

---

## ⚙️ Tech Stack

- **Python 3.10+**
- `requests`
- `spacy` with `en_core_web_sm`
- `google-api-python-client`
- `google-generativeai`
- `python-dotenv`

---

## 💻 How it Works!

1️⃣ You enter: `Name`, `City`, and optional `Extra terms`  
2️⃣ The tool runs:
- `site:linkedin.com/in` search  
- `news/case` search (e.g., NDTV, The Hindu, Bar & Bench)  
- general web search  

3️⃣ It enriches results with:
- NLP entity recognition (person/org names, places)  
- Gemini-generated summary per result  

4️⃣ Results are saved as a JSON file with all findings.

---

## 📂 Installation

```bash
# Clone repo
git clone https://github.com/yourusername/osint-investigator.git
cd osint-investigator

# (Optional) Create virtual environment
python -m venv osint_env
osint_env\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

---

## 🔑 Setup

1️⃣ Get your **Google API key** + **CSE ID** → [Google Custom Search](https://programmablesearchengine.google.com/)  
2️⃣ Get your **Gemini API key** → [Google AI Studio](https://makersuite.google.com/app/apikey)

Create a `.env` file:
```env
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CSE_ID=your-cse-id
GEMINI_API_KEY=your-gemini-api-key
```

---

## ▶️ Run

```bash
python osint_investigator.py
```

---

## 📝 Example Command

```
Search about Yash Bahuguna, Delhi, MAIT on the web and generate a summary using the snippet and detected entities.
```

---

## 📌 Notes

- Use responsibly — ensure ethical and legal compliance while performing OSINT.  
- Be mindful of API quotas (Google CSE + Gemini).
# cyber-osint
