"""
Cache Utilities
"""
import json
import logging
import hashlib
from typing import Any, Optional, Callable
from functools import wraps

from app.config.database import get_redis_client
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class CacheService:
    """
    Redis-based cache service
    """

    def __init__(self):
        self.redis_client = None
        self.enabled = settings.ENABLE_CACHE
        self.default_ttl = settings.CACHE_TTL_SECONDS
        self._initialize()

    def _initialize(self):
        """Initialize Redis connection"""
        try:
            if self.enabled:
                self.redis_client = get_redis_client()
                logger.info("✅ Cache service initialized")
        except Exception as e:
            logger.warning(f"Cache initialization failed: {e}")
            self.enabled = False

    def _make_key(self, key: str) -> str:
        """Create cache key with prefix"""
        return f"cache:{key}"

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if not self.enabled or not self.redis_client:
                return None

            cache_key = self._make_key(key)
            data = self.redis_client.get(cache_key)

            if data:
                return json.loads(data)

            return None

        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        try:
            if not self.enabled or not self.redis_client:
                return False

            cache_key = self._make_key(key)
            ttl = ttl or self.default_ttl

            data = json.dumps(value, ensure_ascii=False, default=str)
            self.redis_client.setex(cache_key, ttl, data)

            return True

        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            if not self.enabled or not self.redis_client:
                return False

            cache_key = self._make_key(key)
            result = self.redis_client.delete(cache_key)

            return result > 0

        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            if not self.enabled or not self.redis_client:
                return False

            cache_key = self._make_key(key)
            return self.redis_client.exists(cache_key) > 0

        except Exception as e:
            logger.error(f"Cache exists error: {e}")
            return False

    def clear_pattern(self, pattern: str) -> int:
        """Clear keys matching pattern"""
        try:
            if not self.enabled or not self.redis_client:
                return 0

            cache_pattern = self._make_key(pattern)
            keys = self.redis_client.keys(cache_pattern)

            if keys:
                return self.redis_client.delete(*keys)

            return 0

        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return 0

    def get_stats(self) -> dict:
        """Get cache statistics"""
        try:
            if not self.enabled or not self.redis_client:
                return {"enabled": False}

            info = self.redis_client.info()

            return {
                "enabled": True,
                "connected": True,
                "total_keys": info.get("db0", {}).get("keys", 0),
                "memory_used": info.get("used_memory_human", "0B"),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0)
            }

        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {"enabled": self.enabled, "connected": False, "error": str(e)}.redis_client.delete(*keys)

            return 0

        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return 0

    def get_stats(self) -> dict:
        """Get cache statistics"""
        try:
            if not self.enabled or not self.redis_client:
                return {"enabled": False}

            info = self.redis_client.info()

            return {
                "enabled": True,
                "connected": True,
                "total_keys": info.get("db0", {}).get("keys", 0),
                "memory_used": info.get("used_memory_human", "0B"),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0)
            }

        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {"enabled": self.enabled, "connected": False, "error": str(e)}

# Global cache instance
cache = CacheService()

def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments"""
    key_parts = []

    # Add positional arguments
    for arg in args:
        if isinstance(arg, (str, int, float, bool)):
            key_parts.append(str(arg))
        else:
            key_parts.append(hashlib.md5(str(arg).encode()).hexdigest()[:8])

    # Add keyword arguments
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (str, int, float, bool)):
            key_parts.append(f"{k}={v}")
        else:
            key_parts.append(f"{k}={hashlib.md5(str(v).encode()).hexdigest()[:8]}")

    return ":".join(key_parts)

def cached(ttl: int = None, key_prefix: str = ""):
    """
    Decorator for caching function results
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            func_key = f"{key_prefix}{func.__name__}:{cache_key(*args, **kwargs)}"

            # Try to get from cache
            cached_result = cache.get(func_key)
            if cached_result is not None:
                logger.debug(f"Cache hit: {func_key}")
                return cached_result

            # Execute function
            result = func(*args, **kwargs)

            # Cache result
            cache_ttl = ttl or settings.CACHE_TTL_SECONDS
            cache.set(func_key, result, cache_ttl)
            logger.debug(f"Cache set: {func_key}")

            return result

        return wrapper
    return decorator

def cached_async(ttl: int = None, key_prefix: str = ""):
    """
    Decorator for caching async function results
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            func_key = f"{key_prefix}{func.__name__}:{cache_key(*args, **kwargs)}"

            # Try to get from cache
            cached_result = cache.get(func_key)
            if cached_result is not None:
                logger.debug(f"Cache hit: {func_key}")
                return cached_result

            # Execute function
            result = await func(*args, **kwargs)

            # Cache result
            cache_ttl = ttl or settings.CACHE_TTL_SECONDS
            cache.set(func_key, result, cache_ttl)
            logger.debug(f"Cache set: {func_key}")

            return result

        return wrapper
    return decorator

class CacheManager:
    """
    High-level cache management
    """

    @staticmethod
    def invalidate_search_cache():
        """Invalidate all search-related cache"""
        try:
            count = cache.clear_pattern("search:*")
            logger.info(f"Invalidated {count} search cache entries")
            return count
        except Exception as e:
            logger.error(f"Error invalidating search cache: {e}")
            return 0

    @staticmethod
    def invalidate_conversation_cache(user_id: str):
        """Invalidate conversation cache for user"""
        try:
            count = cache.clear_pattern(f"conversation:{user_id}:*")
            logger.info(f"Invalidated {count} conversation cache entries for user {user_id}")
            return count
        except Exception as e:
            logger.error(f"Error invalidating conversation cache: {e}")
            return 0

    @staticmethod
    def invalidate_product_cache():
        """Invalidate product-related cache"""
        try:
            count = cache.clear_pattern("product:*")
            logger.info(f"Invalidated {count} product cache entries")
            return count
        except Exception as e:
            logger.error(f"Error invalidating product cache: {e}")
            return 0

    @staticmethod
    def clear_all_cache():
        """Clear all application cache"""
        try:
            count = cache.clear_pattern("*")
            logger.info(f"Cleared all cache ({count} entries)")
            return count
        except Exception as e:
            logger.error(f"Error clearing all cache: {e}")
            return 0
