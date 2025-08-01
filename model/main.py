# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import json
# from datetime import datetime
# import threading
# import time

# # osint_service.py se zaroori functions import karein
# import osint_service

# app = Flask(__name__)
# CORS(app) 

# # Yeh global dictionary hai jo search progress store karega
# progress_store = {}
# # osint_service ko batayein ki progress store karne ke liye is dictionary ka istemaal karein
# osint_service.progress_store = progress_store

# @app.route('/')
# def home():
#     """Ek simple route jo server ke chalne ki पुष्टि karta hai."""
#     return "Flask server is up and running."

# @app.route("/osint", methods=["POST"])
# def osint():
#     """
#     Yeh endpoint ek background thread mein OSINT search shuru karta hai
#     aur client ko progress track karne ke liye ek search ID deta hai.
#     """
#     data = request.json
#     name = data.get("name")
#     city = data.get("city")
#     extras = data.get("extraTerms", "").split(",")

#     if not name:
#         return jsonify({"error": "Name is a required field."}), 400

#     search_id = f"{name.replace(' ', '_')}_{int(time.time())}"
#     progress_store[search_id] = {"percentage": 0, "stage": "Initializing...", "status": "running"}

#     def run_search_in_background():
#         """
#         Yeh asli search task hai jo ek alag thread mein chalta hai,
#         taaki API responsive rahe.
#         """
#         try:
#             # osint_service se function call karein
#             final_result = osint_service.run_osint_with_progress(name, city, extras, search_id)
#             progress_store[search_id].update({
#                 "percentage": 100, 
#                 "stage": "Complete!", 
#                 "status": "completed", 
#                 "result": final_result
#             })
#         except Exception as e:
#             error_message = str(e)
#             progress_store[search_id].update({
#                 "status": "error", 
#                 "error": error_message, 
#                 "stage": "Failed"
#             })
#             print(f"🔥 Backend Thread Error for '{search_id}': {error_message}")

#     thread = threading.Thread(target=run_search_in_background)
#     thread.start()
#     return jsonify({"searchId": search_id})

# @app.route("/progress/<search_id>", methods=["GET"])
# def get_progress(search_id):
#     """Client is endpoint se search ka status poll karta hai."""
#     progress = progress_store.get(search_id)
#     if not progress:
#         return jsonify({"error": "Search ID not found"}), 404
#     return jsonify(progress)

# @app.route("/generate-report", methods=["POST"])
# def generate_report():
#     """Person data se ek JSON report generate karta hai."""
#     data = request.json.get("personData")
#     if not data:
#         return jsonify({"error": "Missing person data"}), 400
#     try:
#         os.makedirs("reports", exist_ok=True)
#         name = data.get("name", "person").replace(" ", "_")
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         filename = f"{name}_report_{timestamp}.json"
#         path = os.path.join("reports", filename)
#         with open(path, "w") as f:
#             json.dump(data, f, indent=4)
#         print(f"📄 Report generated at: {path}")
#         return jsonify({"reportPath": path})
#     except Exception as e:
#         print(f"🔥 Report Generation Error: {e}")
#         return jsonify({"error": f"Failed to generate report: {e}"}), 500

# if __name__ == "__main__":

    
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port)

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import threading
import time
import google.generativeai as genai
from dotenv import load_dotenv

# osint_service.py se zaroori functions import karein
import osint_service

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
gemini_keys = os.getenv("GEMINI_API_KEYS", "").split(",")

# Yeh global dictionary hai jo search progress store karega
progress_store = {}
# Store person data for chatbot context
person_data_store = {}

# osint_service ko batayein ki progress store karne ke liye is dictionary ka istemaal karein
osint_service.progress_store = progress_store

def get_chatbot_response(person_data, user_question):
    """
    Gemini AI se person ke baare mein specific question ka answer generate karta hai
    """
    if not gemini_keys or not person_data:
        return "Sorry, I couldn't process your question due to technical issues."
    
    # Person data ko context ke liye format karein
    context = f"""
Person Information:
Name: {person_data.get('name', 'Unknown')}
Location: {person_data.get('location', 'Unknown')}
Summary: {person_data.get('short_summary', 'No summary available')}
Detailed Info: {person_data.get('detailed_summary', 'No detailed information available')}

Risk Analysis:
- Risk Score: {person_data.get('riskAnalysis', {}).get('riskScore', 'N/A')}
- Risk Justification: {person_data.get('riskAnalysis', {}).get('riskJustification', 'N/A')}
- Sentiment Score: {person_data.get('riskAnalysis', {}).get('sentimentScore', 'N/A')}

Timeline Events:
"""
    
    # Timeline events add karein
    timeline_events = person_data.get('timelineEvents', [])
    for event in timeline_events[:5]:  # Top 5 events only
        context += f"- {event.get('date', 'Unknown date')}: {event.get('title', 'No title')} (Source: {event.get('source', 'Unknown')})\n"
    
    # Raw data snippets add karein
    context += "\nAdditional Information:\n"
    raw_data = person_data.get('raw_data', [])
    for data in raw_data[:10]:  # Top 10 results only
        context += f"- {data.get('title', 'No title')}: {data.get('snippet', 'No snippet')} (Source: {data.get('source', 'Unknown')})\n"
    
    prompt = f"""
You are an OSINT analysis assistant. Based on the collected information about this person, answer the user's question accurately and professionally.

Context about the person:
{context}

User Question: {user_question}

Instructions:
1. Answer based only on the provided information
2. If information is not available, clearly state that
3. Be professional and factual
4. Cite sources when possible
5. Keep responses concise but informative
6. If asked about sensitive information, be careful and professional

Answer:"""

    for key in gemini_keys:
        try:
            genai.configure(api_key=key.strip())
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"❌ Gemini chatbot key failed: {e}")
            continue
    
    return "Sorry, I couldn't process your question due to technical issues with the AI service."

@app.route('/')
def home():
    """Ek simple route jo server ke chalne ki पुष्टि karta hai."""
    return "Flask server with OSINT Chatbot is up and running."

@app.route("/osint", methods=["POST"])
def osint():
    """
    Yeh endpoint ek background thread mein OSINT search shuru karta hai
    aur client ko progress track karne ke liye ek search ID deta hai.
    """
    data = request.json
    name = data.get("name")
    city = data.get("city")
    extras = data.get("extraTerms", "").split(",")
    
    if not name:
        return jsonify({"error": "Name is a required field."}), 400
    
    search_id = f"{name.replace(' ', '_')}_{int(time.time())}"
    progress_store[search_id] = {"percentage": 0, "stage": "Initializing...", "status": "running"}
    
    def run_search_in_background():
        """
        Yeh asli search task hai jo ek alag thread mein chalta hai,
        taaki API responsive rahe.
        """
        try:
            # osint_service se function call karein
            final_result = osint_service.run_osint_with_progress(name, city, extras, search_id)
            
            # Store person data for chatbot
            person_data_store[search_id] = final_result
            
            progress_store[search_id].update({
                "percentage": 100,
                "stage": "Complete! Chatbot is now available.",
                "status": "completed",
                "result": final_result
            })
        except Exception as e:
            error_message = str(e)
            progress_store[search_id].update({
                "status": "error",
                "error": error_message,
                "stage": "Failed"
            })
            print(f"🔥 Backend Thread Error for '{search_id}': {error_message}")
    
    thread = threading.Thread(target=run_search_in_background)
    thread.start()
    
    return jsonify({"searchId": search_id})

@app.route("/progress/<search_id>", methods=["GET"])
def get_progress(search_id):
    """Client is endpoint se search ka status poll karta hai."""
    progress = progress_store.get(search_id)
    if not progress:
        return jsonify({"error": "Search ID not found"}), 404
    
    return jsonify(progress)

@app.route("/chat/<search_id>", methods=["POST"])
def chat_with_person_data(search_id):
    """
    Person ke research complete hone ke baad chatbot se questions puch sakte hain
    """
    try:
        # Check if search is completed and data exists
        if search_id not in person_data_store:
            progress = progress_store.get(search_id, {})
            if progress.get("status") != "completed":
                return jsonify({"error": "Search not completed yet. Please wait for the research to finish."}), 400
            else:
                return jsonify({"error": "Person data not found for this search ID."}), 404
        
        data = request.json
        user_question = data.get("question", "").strip()
        
        if not user_question:
            return jsonify({"error": "Question is required."}), 400
        
        person_data = person_data_store[search_id]
        
        # Handle error cases in person data
        if isinstance(person_data, list) and len(person_data) > 0 and "error" in person_data[0]:
            return jsonify({
                "answer": f"I don't have enough information to answer questions about this person. {person_data[0]['error']}"
            })
        
        # Generate chatbot response
        chatbot_answer = get_chatbot_response(person_data, user_question)
        
        return jsonify({
            "question": user_question,
            "answer": chatbot_answer,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"🔥 Chatbot Error: {e}")
        return jsonify({"error": f"Failed to process question: {str(e)}"}), 500

@app.route("/chat-history/<search_id>", methods=["GET"])
def get_chat_context(search_id):
    """
    Person ke basic information provide karta hai chatbot interface ke liye
    """
    try:
        if search_id not in person_data_store:
            return jsonify({"error": "Person data not found."}), 404
        
        person_data = person_data_store[search_id]
        
        # Handle error cases
        if isinstance(person_data, list) and len(person_data) > 0 and "error" in person_data[0]:
            return jsonify({
                "name": "Unknown",
                "summary": person_data[0]["error"],
                "available": False
            })
        
        return jsonify({
            "name": person_data.get("name", "Unknown"),
            "location": person_data.get("location", "Unknown"),
            "summary": person_data.get("short_summary", "No summary available"),
            "available": True,
            "sources_count": len(person_data.get("raw_data", [])),
            "timeline_events_count": len(person_data.get("timelineEvents", []))
        })
        
    except Exception as e:
        print(f"🔥 Chat Context Error: {e}")
        return jsonify({"error": f"Failed to get context: {str(e)}"}), 500

@app.route("/generate-report", methods=["POST"])
def generate_report():
    """Person data se ek JSON report generate karta hai."""
    data = request.json.get("personData")
    if not data:
        return jsonify({"error": "Missing person data"}), 400
    
    try:
        os.makedirs("reports", exist_ok=True)
        name = data.get("name", "person").replace(" ", "_")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_report_{timestamp}.json"
        path = os.path.join("reports", filename)
        
        with open(path, "w") as f:
            json.dump(data, f, indent=4)
        
        print(f"📄 Report generated at: {path}")
        return jsonify({"reportPath": path})
        
    except Exception as e:
        print(f"🔥 Report Generation Error: {e}")
        return jsonify({"error": f"Failed to generate report: {e}"}), 500

# Cleanup function to prevent memory leaks
@app.route("/cleanup/<search_id>", methods=["DELETE"])
def cleanup_search_data(search_id):
    """
    Search complete hone ke baad data cleanup karne ke liye
    """
    try:
        if search_id in progress_store:
            del progress_store[search_id]
        if search_id in person_data_store:
            del person_data_store[search_id]
        
        return jsonify({"message": "Data cleaned up successfully"})
    except Exception as e:
        return jsonify({"error": f"Cleanup failed: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)