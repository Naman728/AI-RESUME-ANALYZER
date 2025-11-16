from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import upload, notes, flashcards, quiz, generator, ats
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return JSONResponse({
        "status": "ok",
        "message": "AI Resume Analyzer API is running",
        "version": "1.0.0"
    })

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return JSONResponse({
        "status": "ok",
        "service": "AI Resume Analyzer",
        "upload_dir": settings.UPLOAD_DIR,
        "max_upload_mb": settings.MAX_UPLOAD_MB
    })

app.include_router(upload.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(generator.router, prefix="/api")
app.include_router(ats.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
