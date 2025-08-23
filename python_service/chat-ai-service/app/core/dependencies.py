"""
FastAPI Dependencies
"""
from fastapi import Depends, HTTPException, Request
from typing import Optional

from app.services.chat.conversation import ConversationService
from app.services.search.hybrid_search import HybridSearchService
from app.services.ai.vector_search import VectorSearchService
from app.services.ai.llm_service import LLMService

def get_conversation_service(request: Request) -> ConversationService:
    """Get conversation service from app state"""
    if not hasattr(request.app.state, 'conversation_service'):
        raise HTTPException(status_code=503, detail="Conversation service not available")
    return request.app.state.conversation_service

def get_search_service(request: Request) -> HybridSearchService:
    """Get hybrid search service"""
    # Create on demand since it's lightweight
    return HybridSearchService()

def get_vector_service(request: Request) -> VectorSearchService:
    """Get vector search service from app state"""
    if not hasattr(request.app.state, 'vector_service'):
        raise HTTPException(status_code=503, detail="Vector service not available")
    return request.app.state.vector_service

def get_llm_service() -> LLMService:
    """Get LLM service"""
    return LLMService()

def validate_user_id(user_id: Optional[str] = None) -> Optional[str]:
    """Validate user ID format"""
    if user_id and len(user_id.strip()) == 0:
        return None
    return user_id

def validate_session_id(session_id: Optional[str] = None) -> Optional[str]:
    """Validate session ID format"""
    if session_id and len(session_id.strip()) == 0:
        return None
    return session_id
