
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import create_tables
from app.routes import postgres_router, dataset_router, validation_router

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    create_tables()
    yield
    # Clean up resources if needed

app = FastAPI(
    title="Data Validator API",
    description="Backend API for the Data Validator application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS with settings from environment
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not allowed_origins or allowed_origins[0] == "":
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:5174",  # Another common Vite port
        "http://127.0.0.1:5174",
        "http://localhost:8080",  # Added for current Vite server
        "http://127.0.0.1:8080",   # Added for current Vite server
        "https://*.github.dev",    # GitHub Codespaces URLs
        "https://*.app.github.dev", # GitHub Codespaces URLs
        "*"  # Allow all origins during development
    ]

print(f"Configuring CORS with allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(postgres_router, prefix="/api/postgres", tags=["PostgreSQL Connections"])
app.include_router(dataset_router, prefix="/api/datasets", tags=["CSV Datasets"])
app.include_router(validation_router, prefix="/api/validation", tags=["Validation"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Data Validator API"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Received request: {request.method} {request.url}")
    print(f"Origin: {request.headers.get('origin')}")
    print(f"Headers: {request.headers}")
    
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    
    # Add CORS headers directly for additional safety
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
