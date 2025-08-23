"""
Chat API Routes - Clean and focused
"""
import logging
from typing import Optional, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.models.conversation import MessageRole, ConversationType
from app.services.chat.conversation import ConversationService
from app.services.search.hybrid_search import HybridSearchService
from app.core.dependencies import get_conversation_service, get_search_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None
    stream: bool = False

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    message_id: str
    products: Optional[list] = None
    total_found: int = 0
    conversation_type: ConversationType = ConversationType.GENERAL
    has_context: bool = False

class ConversationHistoryResponse(BaseModel):
    conversations: list
    total: int

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    conversation_service: ConversationService = Depends(get_conversation_service),
    search_service: HybridSearchService = Depends(get_search_service)
):
    """
    Ask a question with conversation memory
    """
    try:
        # Get or create conversation
        conversation = await conversation_service.get_or_create_conversation(
            user_id=request.user_id,
            session_id=request.session_id,
            conversation_id=request.conversation_id
        )

        # Add user message
        user_message = conversation.add_message(
            role=MessageRole.USER,
            content=request.message
        )

        # Get conversation context for AI
        context = await conversation_service.get_conversation_context(conversation.conversation_id)

        # Process message with search service
        search_result = await search_service.process_message(
            message=request.message,
            context=context
        )

        # Add AI response
        ai_message = conversation.add_message(
            role=MessageRole.ASSISTANT,
            content=search_result.answer,
            metadata={
                "products": search_result.products,
                "search_type": search_result.search_type,
                "total_found": search_result.total_found
            }
        )

        # Update conversation context
        conversation.update_context(
            conversation_type=search_result.conversation_type,
            last_search_query=request.message if search_result.products else None,
            last_search_results=search_result.products,
            current_topic=search_result.topic
        )

        # Save conversation
        await conversation_service.save_conversation(conversation)

        return ChatResponse(
            message=search_result.answer,
            conversation_id=conversation.conversation_id,
            message_id=ai_message.id,
            products=search_result.products,
            total_found=search_result.total_found,
            conversation_type=search_result.conversation_type,
            has_context=len(conversation.messages) > 2
        )

    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask/stream")
async def ask_question_stream(
    request: ChatRequest,
    conversation_service: ConversationService = Depends(get_conversation_service),
    search_service: HybridSearchService = Depends(get_search_service)
):
    """
    Ask a question with streaming response
    """
    async def generate_stream() -> AsyncGenerator[str, None]:
        try:
            # Get or create conversation
            conversation = await conversation_service.get_or_create_conversation(
                user_id=request.user_id,
                session_id=request.session_id,
                conversation_id=request.conversation_id
            )

            # Add user message
            conversation.add_message(
                role=MessageRole.USER,
                content=request.message
            )

            # Get context
            context = await conversation_service.get_conversation_context(conversation.conversation_id)

            # Stream response
            full_response = ""
            search_result = None

            async for chunk in search_service.process_message_stream(
                message=request.message,
                context=context
            ):
                if chunk.type == "content":
                    full_response += chunk.content
                    yield f"data: {chunk.json()}\n\n"
                elif chunk.type == "products":
                    yield f"data: {chunk.json()}\n\n"
                elif chunk.type == "done":
                    search_result = chunk.data
                    yield f"data: {chunk.json()}\n\n"
                    break

            # Save final response
            if full_response and search_result:
                conversation.add_message(
                    role=MessageRole.ASSISTANT,
                    content=full_response,
                    metadata=search_result
                )

                await conversation_service.save_conversation(conversation)

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {{'type': 'error', 'error': '{str(e)}'}}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

@router.get("/history/{user_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    user_id: str,
    limit: int = 10,
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get user's conversation history
    """
    try:
        conversations = await conversation_service.get_user_conversations(user_id, limit)

        # Format conversations for response
        formatted_conversations = []
        for conv in conversations:
            formatted_conversations.append({
                "conversation_id": conv.conversation_id,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "message_count": len(conv.messages),
                "conversation_type": conv.context.conversation_type,
                "last_message_preview": conv.messages[-1].content[:100] + "..." if conv.messages else "",
                "current_topic": conv.context.current_topic
            })

        return ConversationHistoryResponse(
            conversations=formatted_conversations,
            total=len(conversations)
        )

    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversation/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get detailed conversation
    """
    try:
        conversation = await conversation_service.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {
            "conversation_id": conversation.conversation_id,
            "user_id": conversation.user_id,
            "session_id": conversation.session_id,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
            "context": conversation.context.to_dict(),
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "metadata": msg.metadata
                }
                for msg in conversation.messages
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Delete a conversation
    """
    try:
        success = await conversation_service.delete_conversation(conversation_id)

        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {"message": "Conversation deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversation/{conversation_id}/context")
async def update_conversation_context(
    conversation_id: str,
    context_update: dict,
    conversation_service: ConversationService = Depends(get_conversation_service)
):
    """
    Update conversation context
    """
    try:
        conversation = await conversation_service.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        conversation.update_context(**context_update)
        await conversation_service.save_conversation(conversation)

        return {"message": "Context updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating context: {e}")
        raise HTTPException(status_code=500, detail=str(e))
