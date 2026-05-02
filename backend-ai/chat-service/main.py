from fastapi import FastAPI
from groq import Groq
from embedding import load_all_embeddings, store
from database import get_categories, save_complaint, get_priority_rules, check_duplicate, check_resolved, load_embeddings_from_db,add_complaint_history, get_officers_by_category
import os
import json
from typing import List, Any
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

@app.on_event("startup")
def startup():
    complaints = load_embeddings_from_db()
    load_all_embeddings(complaints)
    print(f"Startup complete — {len(store['id_map'])} embeddings loaded")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@app.get("/")
def root():
    return {"message": "AI Chatbot Running"}

########################### helper

def detect_lang(text: str):
    return "ar" if any("\u0600" <= c <= "\u06ff" for c in text) else "en"


def enforce_language(parsed, user_message):
    lang = detect_lang(user_message)

    def clean(text):
        if not text:
            return text
        if lang == "ar":
            return "".join(c for c in text if not ("a" <= c.lower() <= "z"))
        else:
            return "".join(c for c in text if not ("\u0600" <= c <= "\u06ff"))

    parsed["reply"] = clean(parsed.get("reply"))
    parsed["ai_summary"] = clean(parsed.get("ai_summary"))
    return parsed


def get_system_prompt(categories_text, priority_text):
    with open("prompts.txt", "r", encoding="utf-8") as f:
        prompt_template = f.read()

    prompt = prompt_template.replace("{categories_text}", categories_text)
    prompt = prompt.replace("{priority_text}", priority_text)

    return prompt

@app.post("/api/chat/message")
def chat(data: dict):
    user_message = data.get("message")
    if user_message is None:
        return {"reply": "الرسالة فارغة، من فضلك اكتب شيئاً", "intent": "error"}
    
    ########################### #get body input

    faculty_id = data.get("faculty_id", 1)
    user_id = data.get("user_id", 1)
    history = data.get("history", [])
    state = data.get("conversation_state", {})

    ########################### #get categories and priority from database

    categories = get_categories(faculty_id)
    priority_rules = get_priority_rules()

    categories_text = "\n".join([
        f"- ID: {c['id']} | Name: {c['name']} | Description: {c['description']} | Keywords: {c['keywords']}"
        for c in categories
    ])

    priority_text = "\n".join([
        f"- Level {r['level']}: {r['description']} | Examples: {r['examples']}"
        for r in priority_rules
    ])

    ########################### #System prompt

    system_prompt = get_system_prompt(categories_text, priority_text)

   ########################### # (System + History)
    messages: List[Any] = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        messages.append({
            "role": str(msg.get("role", "user")), 
            "content": str(msg.get("content", ""))
        })

    ########################### # add conversation state
    context_text = ""
    if state:
        context_text = "Current collected info:\n"
        for k, v in state.items():
            context_text += f"- {k}: {v}\n"

    full_input = context_text + f"\nUser message: {user_message}"

    messages.append({"role": "user", "content": full_input})


    ########################### #CALL AI
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.1 
    )

    result = response.choices[0].message.content

    if not result:
        return {"reply": "حصل خطأ، حاولي تاني", "intent": "error"}
    
    ########################### #parse response

    try:
        parsed = json.loads(result)
    except:
        return {"reply": "حصل خطأ، حاولي تاني", "intent": "error"}

    ########################### #update state
    new_state = state.copy()
    data_fields = parsed.get("complaint_data", {})

    for key in ["problem", "location", "since"]:
        if data_fields.get(key):
            new_state[key] = data_fields[key]

    parsed["conversation_state"] = new_state

    ########################### #language fix
    parsed = enforce_language(parsed, user_message)

    ########################### #handle complaint flow
    complaint_id = None

    if parsed.get("intent") == "complaint" and parsed.get("category_id"):
        if len(parsed.get("missing_fields", [])) == 0:

            if parsed.get("missing_fields"):
                return parsed

            ########################### #complete complaint 
            category_id = parsed["category_id"]
            complaint_data = parsed.get("complaint_data", {})
            problem_text = (
                (complaint_data.get("problem") or user_message)
                + " "
                + (parsed.get("ai_summary") or "")
            )
           

            ########################### #duplicate check

            print(f"DEBUG: checking duplicate for user={user_id}, category={category_id}, problem={problem_text}")
            print(f"DEBUG: store has {len(store['id_map'])} embeddings")

            duplicate = check_duplicate(user_id, category_id, problem_text)

            if duplicate:
                lang = detect_lang(user_message)

                reply = (
                    f"لديك شكوى مشابهة برقم #{duplicate['id']} حالتها {duplicate['status']}"
                    if lang == "ar"
                    else f"You already have complaint #{duplicate['id']} with status {duplicate['status']}"
                )

                return {
                    "intent": "duplicate",
                    "reply": reply,
                    "complaint_id": duplicate["id"],
                    "status": duplicate["status"],
                    "redirect": "/complaints"
                }

            ########################### #check resolved

            resolved = check_resolved(user_id, category_id, problem_text)

            if resolved:
                lang = detect_lang(user_message)

                reply = (
                    f"تم حل شكوى مشابهة, للتظلم اذهب لصفحة الشكاوي التي تم حلها: {resolved['resolution_text']}"
                    if lang == "ar"
                    else f"Similar issue solved: {resolved['resolution_text']}, for appealing go to solved complaint page"
                )

                return {
                    "intent": "already_resolved",
                    "reply": reply,
                    "complaint_id": resolved["id"]
                }
            

            ########################### #save complaint to db
            complaint_id = save_complaint(
            user_id=user_id,
            category_id=category_id,
            problem=complaint_data.get("problem"),
            location=complaint_data.get("location"),
            since=complaint_data.get("since"),
            ai_summary=parsed.get("ai_summary"),
            priority=parsed.get("priority")
            )
            if 'complaint_id' in locals():
                parsed["complaint_id"] = complaint_id

            ########################### #save complaint history to db
            add_complaint_history(
                complaint_id=complaint_id,
                status="pending",
                changed_by=user_id
            )

            ########################### #get who is the officer for this complaint
            officers = get_officers_by_category(category_id)

            if not officers:
                parsed["routing_status"] = "no_officer_found"
            else:
                parsed["routing_status"] = "assigned"
                parsed["assigned_to"] = [
                    {"id": o["id"], "name": o["full_name"]}
                    for o in officers
                ]
            if parsed.get("complaint_id"):

                lang = detect_lang(user_message)

                if lang == "ar":
                    parsed["reply"] += "\n\nتم إرسال الشكوى إلى الجهة المختصة. يمكنك متابعة حالتها من صفحة الشكاوى."
                else:
                    parsed["reply"] += "\n\nYour complaint has been forwarded to the responsible department. You can track it from the complaints page."


        parsed["complaint_id"] = complaint_id

    return parsed