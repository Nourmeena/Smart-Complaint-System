from fastapi import FastAPI
from groq import Groq
import os
import json
from dotenv import load_dotenv


load_dotenv()

app = FastAPI()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@app.get("/")
def root():
    return {"message": "AI Chatbot Running"}


def get_categories():
    return [
        {
            "id": 1,
            "name": "Maintenance",
            "description": "مشاكل الصيانة زي الميه والكهربا والتكييف",
            "keywords": ["water", "electricity", "AC", "ميه", "كهربا", "تكييف"],
            "required_fields": ["location"]
        },
        {
            "id": 2,
            "name": "Academic",
            "description": "مشاكل الدراسة والدكاترة والامتحانات",
            "keywords": ["doctor", "course", "exam", "دكتور", "مادة", "امتحان"],
            "required_fields": ["course_name"]
        }
    ]


@app.post("/api/chat/message")
def chat(data: dict):
    user_message = data.get("message")

    categories = get_categories()

    prompt = f"""
        You are an AI assistant for a university complaint system.

        IMPORTANT:
        - If the user writes in Arabic → reply in Arabic
        - If the user writes in English → reply in English

        Available categories:
        {categories}

        Examples:
            - "فيه ميه بتنزل من السقف" → Maintenance
            - "Water is leaking" → Maintenance

        Each category includes keywords. Use them to help you classify the complaint.

        Rules:
        - Detect intent: complaint, question, irrelevant
        - If complaint:
            - Choose the BEST matching category from the list
            - Use keywords (Arabic + English)
            - Extract required fields
            - If no category matches, return category = null
            - If a required field is missing, you MUST set its value to null (JSON null), NOT a string like "not provided".

        Return ONLY JSON:

        {{
        "intent": "complaint/question/irrelevant",
        "category": "string or null",
        "complaint_data": {{}}
        }}

        Message: "{user_message}"
        """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
    )
    

    result = response.choices[0].message.content
    print("AI RESPONSE:", result)

    if result is None:
        return {
            "intent": "error",
            "message": "AI returned an empty response"
        }
    
    try:
        parsed = json.loads(result)
    except:
        return {"reply": "حصل خطأ، حاولي تاني"}
    
################################### Message type handle ##########################################3

    # if irrelevant message
    if parsed["intent"] == "irrelevant":
        return {
            "reply": "المشكلة دي مش ضمن خدمات الجامعة."
        }
    
    # if Complaint message
    if parsed["intent"] == "complaint":
        category_name = parsed.get("category")
        category = next((c for c in categories if c["name"].lower() == str(category_name).lower()), None)

        if not category:
            return {
                "reply": "ممكن توضحي المشكلة أكتر؟"
            }
        
        #extracted required filed for the complaint
        complaint_data = parsed.get("complaint_data", {})

        missing_fields = []

        for field in category["required_fields"]:
            value = complaint_data.get(field)
            if not value or str(value).lower() in ["not provided", "unknown", "null", "none", "n/a"]:
                missing_fields.append(field)
                

        #handle having missing information
        if missing_fields:

            question_prompt = f"""
            The user submitted a complaint but forgot to mention: {missing_fields}.
            Write a very short, friendly, and natural question to ask the user for this missing info.
            
            IMPORTANT RULES:
            - Respond ONLY with the question text.
            - DO NOT explain anything.
            - DO NOT write any code or Python snippets.
            

            IMPORTANT:
            - If the user writes in Arabic → reply in Arabic
            - If the user writes in English → reply in English

            Do NOT return JSON, return only the sentence.
            Example: "ممكن توضح لنا المكان فين بالظبط عشان نقدر نساعدك؟"
            """
            question_response = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": question_prompt}],
                )

            question = question_response.choices[0].message.content

            return {
                "reply": question,
                "needs_more_info": True,
                "missing_fields": missing_fields
            }
        
        #if no missing information
        return {
            **parsed,
            "needs_complaint": True
        }
    
    #if question message
    return {
        "reply": "هحاول أساعدك، ممكن توضح سؤالك أكتر؟"
    }
