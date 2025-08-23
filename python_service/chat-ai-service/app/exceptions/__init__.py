"""
Exception Handling Package
Custom exceptions and error handlers
"""

from .handlers import (
    ChatServiceException,
    ConversationNotFoundError,
    VectorSearchError,
    EmbeddingError,
    CacheError,
    AIServiceError,
    DatabaseError,
    ValidationError
)

__all__ = [
    "ChatServiceException",
    "ConversationNotFoundError",
    "VectorSearchError",
    "EmbeddingError",
    "CacheError",
    "AIServiceError",
    "DatabaseError",
    "ValidationError"
]
