from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
import re
app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

llm = OllamaLLM(model = "llama3",temperature=0.5,top_k=25,top_p=0.9,repeat_penalty=1.0,num_predict=128)

prompt_temp = PromptTemplate(
    input_variables=["chat_history","question"],
    template="""
             You are a helpful AI assistant named Bruno.

            - Do NOT assume the user is Bruno.
            - Be short and precise.
            - If user asked for longer or detailed solutions so give the solution.
            - If the question is simple (like math), give only the answer.
            - Do NOT add unnecessary explanation.
            - Keep responses under 10-20 lines unless asked.
             chat_history:{chat_history}
             user:{question}

             Assistant:
"""
)

chat_history = []

class ChatRequest(BaseModel):
    question:str

@app.post("/chat")
def chat(req:ChatRequest):
    history_str = ""
    for turn in chat_history:
        history_str += f"User: {turn['user']}\nAssistant: {turn['assistant']}\n"
    prompt = prompt_temp.format(chat_history=history_str,question=req.question)
    answer = llm.invoke(prompt)
    answer = re.sub(r'\*\*|\*|#{1,6}\s', '', answer).strip() 
    chat_history.append({"user": req.question, "assistant": answer})
    return {"answer": answer}
        

@app.post("/clear")

def clear():
    chat_history.clear()
    return {"status": "cleared"}

