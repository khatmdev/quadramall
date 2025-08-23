"""
Logging Configuration
"""
import logging
import logging.handlers
import os
import sys
from datetime import datetime

from app.config.settings import get_settings

def setup_logging():
    """Setup logging configuration"""
    settings = get_settings()

    # Create logs directory
    os.makedirs(settings.LOG_STORAGE_PATH, exist_ok=True)

    # Create formatter
    formatter = logging.Formatter(settings.LOG_FORMAT)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Clear existing handlers
    root_logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    root_logger.addHandler(console_handler)

    # File handler
    try:
        log_file = os.path.join(settings.LOG_STORAGE_PATH, "ai_service.log")
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.INFO)
        root_logger.addHandler(file_handler)
    except Exception as e:
        root_logger.warning(f"Failed to setup file logging: {e}")

    # Error file handler
    try:
        error_log_file = os.path.join(settings.LOG_STORAGE_PATH, "errors.log")
        error_handler = logging.handlers.RotatingFileHandler(
            error_log_file,
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3,
            encoding='utf-8'
        )
        error_handler.setFormatter(formatter)
        error_handler.setLevel(logging.ERROR)
        root_logger.addHandler(error_handler)
    except Exception as e:
        root_logger.warning(f"Failed to setup error file logging: {e}")

    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    # Log startup message
    root_logger.info(f"🚀 Logging configured - Level: {settings.LOG_LEVEL}")

def get_logger(name: str) -> logging.Logger:
    """Get logger for specific module"""
    return logging.getLogger(name)

class LoggerMixin:
    """Mixin class to add logging capability"""

    @property
    def logger(self) -> logging.Logger:
        return logging.getLogger(self.__class__.__name__)

def log_performance(func_name: str, execution_time: float, **kwargs):
    """Log performance metrics"""
    logger = logging.getLogger("performance")

    extra_info = " | ".join([f"{k}={v}" for k, v in kwargs.items()])
    logger.info(f"Performance | {func_name} | {execution_time:.3f}s | {extra_info}")

def log_request(method: str, path: str, status_code: int, response_time: float, user_id: str = None):
    """Log HTTP requests"""
    logger = logging.getLogger("requests")

    user_info = f"user={user_id}" if user_id else "anonymous"
    logger.info(f"Request | {method} {path} | {status_code} | {response_time:.3f}s | {user_info}")

def log_error(error: Exception, context: dict = None):
    """Log errors with context"""
    logger = logging.getLogger("errors")

    context_str = ""
    if context:
        context_str = " | " + " | ".join([f"{k}={v}" for k, v in context.items()])

    logger.error(f"Error | {type(error).__name__}: {str(error)}{context_str}", exc_info=True)
