import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .models import user, issue  # Ensure all models are registered on Base
from .services.issue_service import seed_demo_data
from .routes import auth_router, issues_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables and seed realistic demo data on startup."""
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[CivicConnect] Database initialization notice: {e}")

    yield


app = FastAPI(
    title="CivicConnect API",
    description="Real-time Civic Issue Reporting and Municipal Dispatch API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url.strip().rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "CivicConnect API",
    }


# Include Routers
app.include_router(auth_router)
app.include_router(issues_router)
