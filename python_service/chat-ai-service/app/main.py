"""
FastAPI Entry Point - Clean and Focused
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.core.middleware import setup_middleware
from app.api.v1 import chat, search, admin, health
from app.utils.logger import setup_logging
from app.exceptions.handlers import setup_exception_handlers
from app.services.ai.vector_search import VectorSearchService
from app.services.chat.conversation import ConversationService

# Initialize settings and logging
settings = get_settings()
setup_logging()
logger = logging.getLogger(__name__)

# Global services
vector_service = None
conversation_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown"""
    global vector_service, conversation_service

    # Startup
    logger.info("🚀 Starting Chat AI Service...")
    try:
        # Initialize core services
        vector_service = VectorSearchService()
        conversation_service = ConversationService()

        # Store in app state
        app.state.vector_service = vector_service
        app.state.conversation_service = conversation_service

        logger.info("✅ All services initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

    yield

    # Shutdown
    logger.info("🔄 Shutting down services...")
    if vector_service:
        await vector_service.cleanup()
    if conversation_service:
        await conversation_service.cleanup()
    logger.info("✅ Shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Chat AI Service",
    description="Intelligent Chat AI with Memory and Product Search",
    version="2.0.0",
    lifespan=lifespan
)

# Setup middleware
setup_middleware(app)

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Chat AI Service",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Conversation Memory",
            "Vector Search",
            "Product Search",
            "Multi-language Support",
            "Real-time Streaming"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
