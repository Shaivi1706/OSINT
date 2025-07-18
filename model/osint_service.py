import os 
import json
from datetime import datetime
import time
import re
import requests
import spacy
from dotenv import load_dotenv
import google.generativeai as genai
from collections import Counter
from rapidfuzz import fuzz
from dateutil.parser import parse as parse_date

# --- Load .env and configure keys ---
load_dotenv()
google_keys_pool = list(zip(
    os.getenv("GOOGLE_API_KEYS", "").split(","),
    os.getenv("GOOGLE_CSE_IDS", "").split(",")
))
gemini_keys = os.getenv("GEMINI_API_KEYS", "").split(",")

progress_store = {}

# --- Initialize NLP only ---
nlp = None
try:
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy NLP model loaded successfully.")
except Exception as e:
    print(f"❌ spaCy failed to load: {e}")

# --- Utility functions ---
def fallback_ai_response():
    return {
        "short_summary": "An error occurred during AI analysis.",
        "detailed_summary": "The detailed analysis could not be generated due to an AI error.",
        "riskAnalysis": {"riskScore": 0, "riskJustification": "Analysis failed.",
                         "sentimentScore": 0, "sentimentJustification": "Analysis failed."}
    }

def parse_ai_response(json_str):
    try:
        analysis = json.loads(json_str)
        return {
            "short_summary": analysis.get("short_summary", ""),
            "detailed_summary": analysis.get("detailed_summary", ""),
            "riskAnalysis": {
                "riskScore": analysis.get("riskScore", 0),
                "riskJustification": analysis.get("riskJustification", ""),
                "sentimentScore": analysis.get("sentimentScore", 0),
                "sentimentJustification": analysis.get("sentimentJustification", "")
            }
        }
    except:
        return fallback_ai_response()

# --- Google API search with fallback ---
def google_api_search(query, _, __, max_results=10, tag=""):
    for api_key, cse_id in google_keys_pool:
        try:
            resp = requests.get(
                "https://www.googleapis.com/customsearch/v1",
                params={"q": query, "key": api_key.strip(), "cx": cse_id.strip(),
                        "num": max_results, "gl": "in", "hl": "en"},
                timeout=5
            )
            resp.raise_for_status()
            items = resp.json().get("items", [])
            results = [{"source": tag,
                        "title": it.get("title"), "link": it.get("link"),
                        "snippet": it.get("snippet", ""), "pagemap": it.get("pagemap", {})}
                       for it in items]
            print(f"✅ {tag} got {len(results)} using key ending …{api_key[-5:]}")
            return results
        except Exception as e:
            print(f"❌ Key …{api_key[-5:]} failed: {e}")
    print(f"❌ All Google keys failed for '{query}'")
    return []

# --- Gemini analysis with dynamic fallback ---
def gemini_summarize_and_analyze(name, city, all_snippets):
    if not gemini_keys or not all_snippets:
        return fallback_ai_response()
    
    joined_snippets = "\n---\n".join(all_snippets)
    prompt = f"""
As an expert OSINT analyst, analyze collected snippets for '{name}' in '{city}'. 

Return a JSON response with the following structure:
{{
    "short_summary": "Brief 1-2 sentence summary of the person",
    "detailed_summary": "Detailed analysis of the person based on available information",
    "riskScore": 1-10 integer risk assessment score,
    "riskJustification": "Explanation of the risk score",
    "sentimentScore": -5 to 5 integer sentiment score,
    "sentimentJustification": "Explanation of the sentiment score"
}}

Collected Information:
---
{joined_snippets}
"""

    for key in gemini_keys:
        try:
            genai.configure(api_key=key.strip())
            model = genai.GenerativeModel("gemini-1.5-flash")
            resp = model.generate_content(prompt, generation_config={"response_mime_type":"application/json"})
            txt = resp.text.strip()
            print(f"✅ Gemini raw response: {txt}")
            
            # Better JSON extraction
            if txt.startswith('```json'):
                txt = txt[7:-3].strip()
            elif txt.startswith('```'):
                txt = txt[3:-3].strip()
            
            # Try to parse the response directly first
            try:
                return parse_ai_response(txt)
            except:
                # Fallback: extract JSON from response
                json_start = txt.find('{')
                json_end = txt.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = txt[json_start:json_end]
                    return parse_ai_response(json_str)
                else:
                    print(f"❌ No valid JSON found in response")
                    continue
                    
        except Exception as e:
            print(f"❌ Gemini key …{key[-5:]} failed: {e}")
    
    print("❌ All Gemini keys failed, returning fallback")
    return fallback_ai_response()

# --- Existing OSINT pipeline (unchanged, aside from the two fns above) ---
def enrich_with_nlp(results):
    if not nlp:
        for r in results: r["entities"] = []
        return results
    for r in results:
        doc = nlp(f"{r.get('title','')}. {r.get('snippet','')}")
        r["entities"] = [{"text":ent.text,"label":ent.label_} for ent in doc.ents]
    return results

def cached_name_match(target_name, entities_tuple):
    entities = [{"text": ent[0], "label": ent[1]} for ent in entities_tuple]
    target_parts = [part.lower() for part in target_name.split() if part.strip()]

    if len(target_parts) < 2:
        target = target_parts[0]
        for ent in entities:
            if ent['label'] == 'PERSON':
                person_name = ent['text'].lower()
                if target in person_name or person_name in target:
                    return True
    else:
        for ent in entities:
            if ent['label'] == 'PERSON':
                person_name = ent['text'].lower()
                if all(part in person_name for part in target_parts):
                    return True
    return False


def is_name_match(target_name, entities):
    entities_tuple = tuple((ent["text"], ent["label"]) for ent in entities)
    return cached_name_match(target_name, entities_tuple)



def merge_and_dedupe(list_of_lists):
    seen, out = set(), []
    for sub in list_of_lists:
        for r in sub:
            l = r.get("link")
            if l and l not in seen:
                seen.add(l); out.append(r)
    return out

def extract_event_from_result(res):
    try:
        tags = res.get("pagemap",{}).get("metatags",[{}])[0]
        dt = tags.get("article:published_time") or \
             (res.get("pagemap",{}).get("newsarticle",[{}])[0].get("datepublished"))
        return parse_date(dt) if dt else None
    except:
        return None

def run_osint_with_progress(name, city, extras, search_id):
    if not nlp:
        raise ConnectionError("NLP failed to initialize.")
    update = lambda p,s: progress_store.get(search_id, progress_store.setdefault(search_id,{}))\
                          .update({"percentage":p,"stage":s}) or time.sleep(0.1)

    update(10, "Searching LinkedIn...")
    linkedin_results = google_api_search(f"site:linkedin.com/in {name} {city} {' '.join(extras)}", None, None,5,"LinkedIn")
    update(20, "Searching News/Legal...")
    case_results = google_api_search(f"{name} {city} crime OR FIR OR arrested OR chargesheet OR court OR case site:ndtv.com OR site:thehindu.com OR site:indiatoday.in OR site:barandbench.com OR site:livelaw.in {' '.join(extras)}",None,None,5,"Case/News")
    update(30, "General Search...")
    general_results = google_api_search(f"{name} {city} {' '.join(extras)}",None,None,5,"General")
    update(40, "Reddit...")
    reddit_results = google_api_search(f'site:reddit.com "{name}" "{city}"',None,None,2,"Reddit")
    update(45, "Wikipedia...")
    wikipedia_results = google_api_search(f"site:en.wikipedia.org {name} {city} {' '.join(extras)}",None,None,1,"Wikipedia")
    update(55, "Business...")
    business_results = google_api_search(f'"{name}" site:crunchbase.com OR site:zaubacorp.com',None,None,1,"Business")
    update(65, "Academic...")
    academic_results = google_api_search(f'"{name}" site:scholar.google.com',None,None,1,"Academic")

    update(70, "Processing...")
    combined = merge_and_dedupe([wikipedia_results,linkedin_results,case_results,general_results,reddit_results,business_results,academic_results])
    if not combined: return [{"error":"No results"}]
    update(75, "NLP...")
    combined = enrich_with_nlp(combined)

       # ---------- Improved Filtering ----------
    filtered_results = []

    name_tokens = [t for t in name.split() if t.strip()]
    name_lower   = " ".join(name_tokens).lower()

    if name_tokens:
        if len(name_tokens) >= 2:
            full_name_regex = re.compile(r'\b' + r'\s+'.join(map(re.escape, name_tokens)) + r'\b', re.I)
        else:
            full_name_regex = re.compile(r'\b' + re.escape(name_tokens[0]) + r'\b', re.I)
    else:
        full_name_regex = None

    for result in combined:
        title   = result.get("title",   "")
        snippet = result.get("snippet", "")
        raw     = f"{title} {snippet}"
        raw_low = raw.lower()

    # 1 spaCy entity
        if is_name_match(name, result["entities"]):
            filtered_results.append(result)
            continue

    # 2 exact phrase
        if full_name_regex and (full_name_regex.search(title) or full_name_regex.search(snippet)):
            filtered_results.append(result)
            print(f"✅ Included via exact phrase: {title}")
            continue

    # 3 fuzzy full‑name match (≥90)
        if fuzz.partial_ratio(name_lower, raw_low) >= 90:
            filtered_results.append(result)
            print(f"✅ Included via fuzzy full‑name: {title}")
            continue

    # 4 fuzzy token‑by‑token (every token ≥85)
        token_hits = [
            fuzz.partial_ratio(tok.lower(), raw_low) >= 85
            for tok in name_tokens
            if tok
        ]
        if token_hits and all(token_hits):
            filtered_results.append(result)
            print(f"✅ Included via fuzzy tokens: {title}")
        else:
            print(f"⚠ Skipped irrelevant result: {title}")

    if not filtered_results:
        print("❌ No person match found in any search results.")
        return [{"error": "No data found matching the person. They may not have a public profile or presence."}]
        



    update(85, "AI summary...")
    top = filtered_results[:1]
    ai = gemini_summarize_and_analyze(name, city, [f"{r['source']}: {r['title']} — {r['snippet']}" for r in top])

    update(95, "Building timeline...")
    evts=[]
    for r in filtered_results:
        d = extract_event_from_result(r)
        if d:
            evts.append({"date":d.strftime("%Y-%m-%d"),"title":r["title"],"source":r["source"]})
    evts.sort(key=lambda x:x["date"], reverse=True)

    return {
        "name": name, "location": city,
        "short_summary": ai["short_summary"],
        "detailed_summary": ai["detailed_summary"],
        "riskAnalysis": ai["riskAnalysis"],
        "sourceAnalysis": [{"name":s,"count":sum(1 for r in filtered_results if r["source"]==s)}
                          for s in ["LinkedIn","Case/News","Reddit","Wikipedia","Business","Academic","General"]],
        "timelineEvents": evts,
        "raw_data": [{"title":r["title"],"snippet":r["snippet"],"link":r["link"],"source":r["source"]} for r in filtered_results]
    }