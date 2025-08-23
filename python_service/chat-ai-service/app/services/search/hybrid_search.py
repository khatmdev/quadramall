"""
Hybrid Search Service - Combines AI intelligence with vector search
"""
import logging
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from enum import Enum

from app.models.conversation import ConversationType
from app.services.ai.vector_search import VectorSearchService
from app.services.ai.llm_service import LLMService
from app.services.support.policy import PolicySupportService
from app.services.support.user_support import UserSupportService

logger = logging.getLogger(__name__)

class SearchType(str, Enum):
    VECTOR_SEARCH = "vector_search"
    POLICY_SUPPORT = "policy_support"
    USER_SUPPORT = "user_support"
    AI_FALLBACK = "ai_fallback"
    HYBRID = "hybrid"

@dataclass
class SearchResult:
    answer: str
    products: Optional[List[Dict[str, Any]]] = None
    total_found: int = 0
    search_type: SearchType = SearchType.AI_FALLBACK
    conversation_type: ConversationType = ConversationType.GENERAL
    topic: Optional[str] = None
    confidence: float = 0.0
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class StreamChunk:
    type: str  # "content", "products", "metadata", "done", "error"
    content: Optional[str] = None
    data: Optional[Any] = None

    def json(self) -> str:
        import json
        return json.dumps({
            "type": self.type,
            "content": self.content,
            "data": self.data
        }, ensure_ascii=False)

class HybridSearchService:
    """
    Intelligent search service that routes queries to appropriate handlers
    """

    def __init__(self):
        self.vector_service = VectorSearchService()
        self.llm_service = LLMService()
        self.policy_service = PolicySupportService()
        self.user_support_service = UserSupportService()
        logger.info("✅ HybridSearchService initialized")

    async def process_message(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> SearchResult:
        """
        Process message and return appropriate response
        """
        try:
            # Analyze message intent
            intent = await self._analyze_intent(message, context)

            # Route to appropriate handler
            if intent["type"] == "policy":
                return await self._handle_policy_query(message, context, intent)
            elif intent["type"] == "support":
                return await self._handle_support_query(message, context, intent)
            elif intent["type"] == "product_search":
                return await self._handle_product_search(message, context, intent)
            else:
                return await self._handle_general_query(message, context, intent)

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return SearchResult(
                answer="Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.",
                search_type=SearchType.AI_FALLBACK,
                confidence=0.0
            )

    async def process_message_stream(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[StreamChunk, None]:
        """
        Process message with streaming response
        """
        try:
            # Send typing indicator
            yield StreamChunk(type="typing", content="Đang xử lý...")
            await asyncio.sleep(0.1)

            # Analyze intent
            intent = await self._analyze_intent(message, context)
            yield StreamChunk(type="intent", data=intent)

            # Route and stream response
            if intent["type"] == "product_search":
                async for chunk in self._stream_product_search(message, context, intent):
                    yield chunk
            else:
                # For non-product queries, process normally then stream
                result = await self.process_message(message, context)

                # Stream the answer
                words = result.answer.split()
                current_chunk = ""

                for word in words:
                    current_chunk += word + " "
                    if len(current_chunk.split()) >= 5:  # Send every 5 words
                        yield StreamChunk(type="content", content=current_chunk)
                        current_chunk = ""
                        await asyncio.sleep(0.05)

                if current_chunk:
                    yield StreamChunk(type="content", content=current_chunk)

                # Send final data
                yield StreamChunk(type="done", data=result.__dict__)

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield StreamChunk(type="error", content=str(e))

    async def _analyze_intent(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze message intent using AI
        """
        try:
            # Get conversation context
            conversation_history = ""
            if context and context.get("recent_messages"):
                history_parts = []
                for msg in context["recent_messages"][-3:]:  # Last 3 messages
                    role = "Người dùng" if msg["role"] == "user" else "AI"
                    history_parts.append(f"{role}: {msg['content'][:100]}...")
                conversation_history = "\n".join(history_parts)

            # Analyze with LLM
            analysis_prompt = f"""
Phân tích câu hỏi và lịch sử trò chuyện để xác định intent:

Lịch sử gần đây:
{conversation_history}

Câu hỏi hiện tại: "{message}"

Trả về JSON với format:
{{
    "type": "product_search|policy|support|general",
    "confidence": 0.0-1.0,
    "category": "specific category",
    "keywords": ["key", "words"],
    "needs_context": true/false,
    "topic": "main topic"
}}

Quy tắc:
- "policy" nếu hỏi về chính sách, quy định, điều khoản
- "support" nếu cần hỗ trợ tài khoản, đơn hàng, kỹ thuật
- "product_search" nếu tìm hoặc hỏi về sản phẩm
- "general" cho các câu hỏi khác
"""

            intent_result = await self.llm_service.analyze_intent(analysis_prompt)

            # Validate and set defaults
            intent = {
                "type": intent_result.get("type", "general"),
                "confidence": float(intent_result.get("confidence", 0.5)),
                "category": intent_result.get("category", "unknown"),
                "keywords": intent_result.get("keywords", []),
                "needs_context": intent_result.get("needs_context", False),
                "topic": intent_result.get("topic", "general")
            }

            logger.info(f"Intent analysis: {intent['type']} (confidence: {intent['confidence']})")
            return intent

        except Exception as e:
            logger.error(f"Intent analysis error: {e}")
            return {
                "type": "general",
                "confidence": 0.3,
                "category": "unknown",
                "keywords": message.split()[:3],
                "needs_context": False,
                "topic": "general"
            }

    async def _handle_product_search(
        self,
        message: str,
        context: Optional[Dict[str, Any]],
        intent: Dict[str, Any]
    ) -> SearchResult:
        """
        Handle product search queries
        """
        try:
            # Enhance query with context if needed
            enhanced_query = await self._enhance_query_with_context(message, context, intent)

            # Vector search
            products = await self.vector_service.search(enhanced_query)

            # Generate AI response
            if products:
                response = await self.llm_service.generate_product_response(
                    query=enhanced_query,
                    products=products,
                    context=context
                )
            else:
                response = await self.llm_service.generate_no_results_response(
                    query=enhanced_query,
                    context=context
                )

            return SearchResult(
                answer=response,
                products=products,
                total_found=len(products),
                search_type=SearchType.VECTOR_SEARCH if products else SearchType.AI_FALLBACK,
                conversation_type=ConversationType.PRODUCT_SEARCH,
                topic=intent.get("topic", "product"),
                confidence=intent.get("confidence", 0.7),
                metadata={"enhanced_query": enhanced_query, "original_query": message}
            )

        except Exception as e:
            logger.error(f"Product search error: {e}")
            return SearchResult(
                answer="Có lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.",
                search_type=SearchType.AI_FALLBACK,
                confidence=0.0
            )

    async def _handle_policy_query(
        self,
        message: str,
        context: Optional[Dict[str, Any]],
        intent: Dict[str, Any]
    ) -> SearchResult:
        """
        Handle policy support queries
        """
        try:
            response = await self.policy_service.handle_query(message, context)

            return SearchResult(
                answer=response["answer"],
                search_type=SearchType.POLICY_SUPPORT,
                conversation_type=ConversationType.POLICY_SUPPORT,
                topic=intent.get("topic", "policy"),
                confidence=intent.get("confidence", 0.8),
                metadata=response.get("metadata", {})
            )

        except Exception as e:
            logger.error(f"Policy query error: {e}")
            return SearchResult(
                answer="Có lỗi khi xử lý câu hỏi về chính sách. Vui lòng liên hệ hỗ trợ.",
                search_type=SearchType.AI_FALLBACK,
                confidence=0.0
            )

    async def _handle_support_query(
        self,
        message: str,
        context: Optional[Dict[str, Any]],
        intent: Dict[str, Any]
    ) -> SearchResult:
        """
        Handle user support queries
        """
        try:
            response = await self.user_support_service.handle_query(message, context)

            return SearchResult(
                answer=response["answer"],
                search_type=SearchType.USER_SUPPORT,
                conversation_type=ConversationType.USER_SUPPORT,
                topic=intent.get("topic", "support"),
                confidence=intent.get("confidence", 0.8),
                metadata=response.get("metadata", {})
            )

        except Exception as e:
            logger.error(f"Support query error: {e}")
            return SearchResult(
                answer="Có lỗi khi xử lý yêu cầu hỗ trợ. Vui lòng liên hệ hotline.",
                search_type=SearchType.AI_FALLBACK,
                confidence=0.0
            )

    async def _handle_general_query(
        self,
        message: str,
        context: Optional[Dict[str, Any]],
        intent: Dict[str, Any]
    ) -> SearchResult:
        """
        Handle general queries
        """
        try:
            response = await self.llm_service.generate_general_response(message, context)

            return SearchResult(
                answer=response,
                search_type=SearchType.AI_FALLBACK,
                conversation_type=ConversationType.GENERAL,
                topic=intent.get("topic", "general"),
                confidence=intent.get("confidence", 0.6)
            )

        except Exception as e:
            logger.error(f"General query error: {e}")
            return SearchResult(
                answer="Tôi sẵn sàng hỗ trợ bạn. Bạn có thể hỏi về sản phẩm, chính sách hoặc cần hỗ trợ gì không?",
                search_type=SearchType.AI_FALLBACK,
                confidence=0.0
            )

    async def _enhance_query_with_context(
        self,
        message: str,
        context: Optional[Dict[str, Any]],
        intent: Dict[str, Any]
    ) -> str:
        """
        Enhance query with conversation context
        """
        try:
            if not context or not intent.get("needs_context"):
                return message

            # Add context from previous searches
            if context.get("last_search_query"):
                # Check if current query is a follow-up
                follow_up_indicators = ["đó", "này", "kia", "cái đó", "cái này", "nó", "thế"]
                if any(indicator in message.lower() for indicator in follow_up_indicators):
                    enhanced = f"{context['last_search_query']} {message}"
                    logger.info(f"Enhanced query with context: {message} -> {enhanced}")
                    return enhanced

            return message

        except Exception as e:
            logger.error(f"Query enhancement error: {e}")
            return message

    async def _stream_product_search(
        self,
        message: str,
        context: Optional[Dict[str, Any]],
        intent: Dict[str, Any]
    ) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream product search results
        """
        try:
            # Search products
            yield StreamChunk(type="searching", content="Đang tìm kiếm sản phẩm...")
            enhanced_query = await self._enhance_query_with_context(message, context, intent)
            products = await self.vector_service.search(enhanced_query)

            # Send products first
            if products:
                yield StreamChunk(type="products", data={
                    "products": products[:3],
                    "total_found": len(products)
                })
                await asyncio.sleep(0.1)

            # Generate and stream response
            if products:
                response = await self.llm_service.generate_product_response(
                    query=enhanced_query,
                    products=products,
                    context=context
                )
            else:
                response = await self.llm_service.generate_no_results_response(
                    query=enhanced_query,
                    context=context
                )

            # Stream response in chunks
            words = response.split()
            current_chunk = ""

            for word in words:
                current_chunk += word + " "
                if len(current_chunk.split()) >= 5:
                    yield StreamChunk(type="content", content=current_chunk)
                    current_chunk = ""
                    await asyncio.sleep(0.05)

            if current_chunk:
                yield StreamChunk(type="content", content=current_chunk)

            # Send completion
            yield StreamChunk(type="done", data={
                "products": products,
                "total_found": len(products),
                "search_type": "vector_search" if products else "ai_fallback"
            })

        except Exception as e:
            logger.error(f"Stream product search error: {e}")
            yield StreamChunk(type="error", content=str(e))

    async def health_check(self) -> Dict[str, Any]:
        """
        Check service health
        """
        return {
            "vector_service": await self.vector_service.health_check(),
            "llm_service": await self.llm_service.health_check(),
            "policy_service": self.policy_service.health_check(),
            "user_support_service": self.user_support_service.health_check()
        }
