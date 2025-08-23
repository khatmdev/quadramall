"""
Health Check Routes
"""
import logging
from fastapi import APIRouter, Depends, Request
from typing import Dict, Any

from app.config.database import db_manager
from app.services.chat.conversation import ConversationService
from app.services.ai.vector_search import VectorSearchService
from app.core.dependencies import get_conversation_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "Chat AI Service",
        "version": "2.0.0"
    }

@router.get("/detailed")
async def detailed_health_check(
    request: Request,
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """Detailed health check"""
    try:
        # Database health
        db_health = await db_manager.health_check()

        # Vector service health
        vector_health = {"status": "not_available"}
        if hasattr(request.app.state, 'vector_service'):
            vector_service: VectorSearchService = request.app.state.vector_service
            vector_health = await vector_service.health_check()

        # Conversation service health
        conversation_health = {
            "status": "healthy" if conversation_service else "unhealthy",
            "redis_available": conversation_service.redis_client is not None if conversation_service else False
        }

        # Overall status
        overall_status = "healthy"
        if (db_health["database"]["status"] == "unhealthy" or
            vector_health["status"] == "unhealthy" or
            conversation_health["status"] == "unhealthy"):
            overall_status = "degraded"

        return {
            "status": overall_status,
            "timestamp": "2024-01-01T00:00:00Z",  # You can use datetime.utcnow().isoformat()
            "services": {
                "database": db_health,
                "vector_search": vector_health,
                "conversation": conversation_health
            }
        }

    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@router.get("/database")
async def database_health():
    """Database specific health check"""
    try:
        health = await db_manager.health_check()
        return health
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@router.get("/services")
async def services_health(request: Request):
    """Check all AI services"""
    try:
        services_status = {}

        # Vector Service
        if hasattr(request.app.state, 'vector_service'):
            vector_service: VectorSearchService = request.app.state.vector_service
            services_status["vector_search"] = await vector_service.health_check()
        else:
            services_status["vector_search"] = {"status": "not_initialized"}

        # Conversation Service
        if hasattr(request.app.state, 'conversation_service'):
            conversation_service: ConversationService = request.app.state.conversation_service
            services_status["conversation"] = {
                "status": "healthy",
                "redis_available": conversation_service.redis_client is not None
            }
        else:
            services_status["conversation"] = {"status": "not_initialized"}

        return {
            "status": "healthy",
            "services": services_status
        }

    except Exception as e:
        logger.error(f"Services health check error: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
