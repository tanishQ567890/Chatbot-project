from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
import re
import uuid

app = FastAPI(title="Bruno AI Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = OllamaLLM(
    model="llama3",
    temperature=0.5,
    top_k=40,
    top_p=0.9,
    repeat_penalty=1.1,
    num_predict=512,
)

prompt_temp = PromptTemplate(
    input_variables=["chat_history", "question"],
    template=(
        "You are a helpful AI assistant named Bruno.\n\n"
        "- Do NOT assume the user is Bruno.\n"
        "- Be short and precise.\n"
        "- If the user asks for longer or detailed solutions, provide them.\n"
        "- If the question is simple (like math), give only the answer.\n"
        "- Do NOT add unnecessary explanation.\n"
        "- Keep responses under 10-20 lines unless asked for more.\n"
        "- NEVER add disclaimers, caveats, or warnings at the end of your response.\n"
        "- NEVER say things like 'based on my training data', 'I recommend checking other sources',\n"
        "  'please verify this information', 'this may not be accurate', or any similar phrase.\n"
        "- Just answer directly and stop. No closing remarks, no reminders, no footnotes.\n\n"
        "Chat History:\n{chat_history}\n"
        "User: {question}\n\n"
        "Assistant:"
    ),
)

MAX_HISTORY = 10
sessions: dict[str, list[dict]] = {}


def get_session(session_id: str) -> list[dict]:
    if session_id not in sessions:
        sessions[session_id] = []
    return sessions[session_id]


def build_history_str(history: list[dict]) -> str:
    return "".join(
        f"User: {turn['user']}\nAssistant: {turn['assistant']}\n"
        for turn in history
    )


def clean_response(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"`{1,3}", "", text)

    # Strip common disclaimer sentences the LLM appends despite instructions
    disclaimer_patterns = [
        r"(Please\s+keep\s+in\s+mind\s+that|Note\s+that|Please\s+note)[^.!?]*[.!?]",
        r"(based\s+on\s+my\s+training\s+data)[^.!?]*[.!?]",
        r"(I\s+recommend\s+(checking|verifying|consulting))[^.!?]*[.!?]",
        r"(for\s+real[\-\s]time\s+information)[^.!?]*[.!?]",
        r"(this\s+(information\s+)?may\s+not\s+be\s+(accurate|current|up[\-\s]to[\-\s]date))[^.!?]*[.!?]",
        r"(please\s+verify|always\s+verify)[^.!?]*[.!?]",
        r"(my\s+knowledge\s+(cutoff|is\s+limited))[^.!?]*[.!?]",
    ]
    for pattern in disclaimer_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    return text.strip()


class ChatRequest(BaseModel):
    question: str
    session_id: str = ""

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty.")
        if len(v) > 2000:
            raise ValueError("Question is too long. Max 2000 characters.")
        return v


class ClearRequest(BaseModel):
    session_id: str = ""


@app.post("/chat")
def chat(req: ChatRequest):
    sid = req.session_id or str(uuid.uuid4())
    history = get_session(sid)

    history_str = build_history_str(history)
    prompt = prompt_temp.format(chat_history=history_str, question=req.question)

    try:
        raw_answer = llm.invoke(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Bruno is currently unavailable. Make sure Ollama is running with LLaMA 3. Error: " + str(e),
        )

    answer = clean_response(raw_answer)

    history.append({"user": req.question, "assistant": answer})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    return {"answer": answer, "session_id": sid}


@app.post("/clear")
def clear(req: ClearRequest):
    sid = req.session_id
    if sid and sid in sessions:
        sessions[sid].clear()
    return {"status": "cleared"}


@app.get("/health")
def health():
    return {"status": "ok", "model": "llama3"}
