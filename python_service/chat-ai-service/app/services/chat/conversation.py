"""
Conversation Service - Manages chat memory and context
"""
import logging
import json
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.config.database import get_redis_client
from app.config.settings import get_settings
from app.models.conversation import Conversation, Message, MessageRole, ConversationType

logger = logging.getLogger(__name__)
settings = get_settings()

class ConversationService:
    """Service for managing conversations with Redis storage"""

    def __init__(self):
        self.redis_client = None
        self.key_prefix = "conversation:"
        self.user_sessions_key = "user_sessions:"
        self._initialize()

    def _initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = get_redis_client()
            logger.info("✅ ConversationService initialized")
        except Exception as e:
            logger.error(f"❌ ConversationService initialization failed: {e}")
            raise

    async def get_or_create_conversation(
        self,
        user_id: str = None,
        session_id: str = None,
        conversation_id: str = None
    ) -> Conversation:
        """Get existing conversation or create new one"""
        try:
            # Try to get existing conversation
            if conversation_id:
                conversation = await self.get_conversation(conversation_id)
                if conversation:
                    return conversation

            # Try to get user's latest conversation
            if user_id:
                conversation = await self.get_user_latest_conversation(user_id)
                if conversation and not conversation.is_expired(settings.CONVERSATION_TTL_HOURS):
                    return conversation

            # Create new conversation
            conversation = Conversation(
                conversation_id=conversation_id,
                user_id=user_id,
                session_id=session_id,
                max_history=settings.MAX_CONVERSATION_HISTORY
            )

            await self.save_conversation(conversation)
            logger.info(f"Created new conversation: {conversation.conversation_id}")

            return conversation

        except Exception as e:
            logger.error(f"Error getting/creating conversation: {e}")
            # Return new conversation as fallback
            return Conversation(user_id=user_id, session_id=session_id)

    async def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Get conversation by ID"""
        try:
            if not self.redis_client:
                return None

            key = f"{self.key_prefix}{conversation_id}"
            data = self.redis_client.get(key)

            if data:
                conversation_dict = json.loads(data)
                conversation = Conversation.from_dict(conversation_dict)

                # Check if expired
                if conversation.is_expired(settings.CONVERSATION_TTL_HOURS):
                    await self.delete_conversation(conversation_id)
                    return None

                return conversation

            return None

        except Exception as e:
            logger.error(f"Error getting conversation {conversation_id}: {e}")
            return None

    async def save_conversation(self, conversation: Conversation) -> bool:
        """Save conversation to Redis"""
        try:
            if not self.redis_client:
                return False

            key = f"{self.key_prefix}{conversation.conversation_id}"
            data = conversation.to_json()

            # Save with TTL
            ttl_seconds = settings.CONVERSATION_TTL_HOURS * 3600
            self.redis_client.setex(key, ttl_seconds, data)

            # Update user sessions mapping
            if conversation.user_id:
                await self._update_user_sessions(conversation.user_id, conversation.conversation_id)

            return True

        except Exception as e:
            logger.error(f"Error saving conversation {conversation.conversation_id}: {e}")
            return False

    async def add_message_to_conversation(
        self,
        conversation_id: str,
        role: MessageRole,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Message]:
        """Add message to existing conversation"""
        try:
            conversation = await self.get_conversation(conversation_id)
            if not conversation:
                logger.warning(f"Conversation {conversation_id} not found")
                return None

            message = conversation.add_message(role, content, metadata)
            await self.save_conversation(conversation)

            return message

        except Exception as e:
            logger.error(f"Error adding message to conversation {conversation_id}: {e}")
            return None

    async def get_user_latest_conversation(self, user_id: str) -> Optional[Conversation]:
        """Get user's latest conversation"""
        try:
            if not self.redis_client:
                return None

            # Get user's conversation IDs
            user_key = f"{self.user_sessions_key}{user_id}"
            conversation_ids = self.redis_client.lrange(user_key, 0, 0)  # Get latest

            if conversation_ids:
                return await self.get_conversation(conversation_ids[0])

            return None

        except Exception as e:
            logger.error(f"Error getting user's latest conversation: {e}")
            return None

    async def get_user_conversations(self, user_id: str, limit: int = 10) -> List[Conversation]:
        """Get user's conversation history"""
        try:
            if not self.redis_client:
                return []

            user_key = f"{self.user_sessions_key}{user_id}"
            conversation_ids = self.redis_client.lrange(user_key, 0, limit - 1)

            conversations = []
            for conv_id in conversation_ids:
                conversation = await self.get_conversation(conv_id)
                if conversation:
                    conversations.append(conversation)

            return conversations

        except Exception as e:
            logger.error(f"Error getting user conversations: {e}")
            return []

    async def delete_conversation(self, conversation_id: str) -> bool:
        """Delete conversation"""
        try:
            if not self.redis_client:
                return False

            key = f"{self.key_prefix}{conversation_id}"
            result = self.redis_client.delete(key)

            return result > 0

        except Exception as e:
            logger.error(f"Error deleting conversation {conversation_id}: {e}")
            return False

    async def cleanup_expired_conversations(self) -> int:
        """Clean up expired conversations"""
        try:
            if not self.redis_client:
                return 0

            pattern = f"{self.key_prefix}*"
            keys = self.redis_client.keys(pattern)
            cleaned_count = 0

            for key in keys:
                try:
                    data = self.redis_client.get(key)
                    if data:
                        conversation_dict = json.loads(data)
                        conversation = Conversation.from_dict(conversation_dict)

                        if conversation.is_expired(settings.CONVERSATION_TTL_HOURS):
                            self.redis_client.delete(key)
                            cleaned_count += 1

                except Exception as e:
                    logger.warning(f"Error processing key {key}: {e}")
                    continue

            logger.info(f"Cleaned up {cleaned_count} expired conversations")
            return cleaned_count

        except Exception as e:
            logger.error(f"Error cleaning up conversations: {e}")
            return 0

    async def _update_user_sessions(self, user_id: str, conversation_id: str):
        """Update user sessions list"""
        try:
            if not self.redis_client:
                return

            user_key = f"{self.user_sessions_key}{user_id}"

            # Add conversation ID to the beginning of the list
            self.redis_client.lpush(user_key, conversation_id)

            # Keep only recent conversations (max 20)
            self.redis_client.ltrim(user_key, 0, 19)

            # Set expiry on user sessions
            ttl_seconds = settings.CONVERSATION_TTL_HOURS * 3600 * 7  # Keep for 7x longer
            self.redis_client.expire(user_key, ttl_seconds)

        except Exception as e:
            logger.error(f"Error updating user sessions: {e}")

    async def get_conversation_context(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation context for AI"""
        try:
            conversation = await self.get_conversation(conversation_id)
            if not conversation:
                return None

            # Get recent messages for context
            recent_messages = conversation.get_recent_messages(6)

            context = {
                "conversation_id": conversation_id,
                "user_id": conversation.user_id,
                "conversation_type": conversation.context.conversation_type,
                "recent_messages": [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "timestamp": msg.timestamp.isoformat()
                    }
                    for msg in recent_messages
                ],
                "last_search_query": conversation.context.last_search_query,
                "current_topic": conversation.context.current_topic,
                "conversation_summary": conversation.get_conversation_summary()
            }

            return context

        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            return None

    async def start_background_cleanup(self):
        """Start background cleanup task"""
        if settings.AUTO_CLEANUP_ENABLED:
            asyncio.create_task(self._background_cleanup_task())

    async def _background_cleanup_task(self):
        """Background task for cleaning up expired conversations"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                await self.cleanup_expired_conversations()
            except Exception as e:
                logger.error(f"Background cleanup error: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes before retry

    async def cleanup(self):
        """Cleanup service resources"""
        try:
            if self.redis_client:
                await self.cleanup_expired_conversations()
            logger.info("✅ ConversationService cleanup completed")
        except Exception as e:
            logger.error(f"Error in ConversationService cleanup: {e}")
