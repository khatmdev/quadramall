"""
Utilities Package
Helper functions, logging, and cache utilities
"""

from .logger import setup_logging, get_logger
from .cache import cache, cached, cached_async, CacheManager

# Import từng function có sẵn từ helpers
try:
    from .helpers import (
        clean_text,
        format_price,
        validate_email,
        Timer
    )
except ImportError as e:
    # Fallback nếu helpers không có function
    print(f"Warning: {e}")
    clean_text = lambda x: x
    format_price = lambda x, c="đ": f"{x}{c}"
    validate_email = lambda x: "@" in x
    Timer = object

__all__ = [
    "setup_logging",
    "get_logger", 
    "cache",
    "cached",
    "cached_async",
    "CacheManager",
    "clean_text",
    "format_price",
    "validate_email",
    "Timer"
]
