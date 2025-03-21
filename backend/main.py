
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_tables
from app.routes import postgres_router, dataset_router, validation_router

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

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
