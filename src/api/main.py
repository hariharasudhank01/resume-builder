"""
This script is the entry point of the API server.

Run "uvicorn src.api.main:app --reload" to start the server

"""
from fastapi import FastAPI
from api.routers import sessions, evidence
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# All routers will be linked to the app here.
app.include_router(sessions.router)
app.include_router(evidence.router)

# Origins list holds the list of URL supported for
# cross origin resource sharing (CORS).
origins = [
    "http://localhost:5173" # Front End - npm run dev
]

# Settings for the CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# GET request to check API health
@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }


