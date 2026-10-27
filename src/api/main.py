from fastapi import FastAPI
from api.routers import sessions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(sessions.router)

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }


