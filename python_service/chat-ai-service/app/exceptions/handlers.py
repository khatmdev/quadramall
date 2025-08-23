"""
Exception Handlers
"""
import logging
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    """Setup exception handlers for the FastAPI app"""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions"""
        logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.url}")

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url.path)
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
        """Handle Starlette HTTP exceptions"""
        logger.warning(f"Starlette HTTP {exc.status_code}: {exc.detail} - {request.url}")

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url.path)
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle request validation errors"""
        logger.warning(f"Validation error: {exc.errors()} - {request.url}")

        # Format validation errors
        formatted_errors = []
        for error in exc.errors():
            formatted_errors.append({
                "field": " -> ".join(str(x) for x in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })

        return JSONResponse(
            status_code=422,
            content={
                "error": "Validation Error",
                "detail": "Request validation failed",
                "validation_errors": formatted_errors,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url.path)
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle general exceptions"""
        logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)} - {request.url}")
        logger.error(f"Traceback: {traceback.format_exc()}")

        # Don't expose internal error details in production
        error_detail = str(exc) if app.debug else "Internal server error"

        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": error_detail,
                "timestamp": datetime.now().isoformat(),
                "path": str(request.url.path)
            }
        )

# Custom exceptions
class ChatServiceException(Exception):
    """Base exception for chat service"""
    pass

class ConversationNotFoundError(ChatServiceException):
    """Conversation not found"""
    pass

class VectorSearchError(ChatServiceException):
    """Vector search error"""
    pass

class EmbeddingError(ChatServiceException):
    """Embedding generation error"""
    pass

class CacheError(ChatServiceException):
    """Cache operation error"""
    pass

class AIServiceError(ChatServiceException):
    """AI service error"""
    pass

class DatabaseError(ChatServiceException):
    """Database operation error"""
    pass

class ValidationError(ChatServiceException):
    """Data validation error"""
    pass
