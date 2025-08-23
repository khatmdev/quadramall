"""Configuration management for AI service - Updated with Session Management"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Application
    app_name: str = "E-commerce AI Chat Service"
    app_version: str = "2.2.0"
    debug: bool = False

    # Database Configuration
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "vandat"
    mysql_password: str = "admin"
    mysql_database: str = "quadra_ecommerce_db1"
    mysql_charset: str = "utf8mb4"

    # Redis Configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    redis_decode_responses: bool = True

    # Session Management Settings
    session_ttl_hours: int = 24
    max_context_messages: int = 10
    auto_session_cleanup: bool = True
    session_active_window_hours: int = 2

    # OpenAI Configuration
    openai_api_key: str = "your-openai-api-key"
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 1000
    openai_temperature: float = 0.7
    openai_timeout: int = 30

    # Google Gemini Configuration
    google_api_key: str = "your-google-api-key"

    # Vector Search Configuration
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    vector_dimension: int = 384
    top_k_results: int = 5
    similarity_threshold: float = 0.5

    # FAISS Configuration
    faiss_index_path: str = "data/faiss_index.bin"
    metadata_path: str = "data/product_metadata.json"

    # Cache Configuration
    cache_ttl_seconds: int = 900
    cache_prefix: str = "ecommerce_chat"

    # Logging Configuration
    log_level: str = "INFO"
    log_file: str = "logs/ai_service.log"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Performance Configuration
    max_concurrent_requests: int = 10
    request_timeout: int = 30
    batch_size: int = 100

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

if not settings.openai_api_key or settings.openai_api_key == "your-openai-api-key":
    print("Warning: OPENAI_API_KEY not configured")

if not settings.google_api_key or settings.google_api_key == "your-google-api-key":
    print("Warning: GOOGLE_API_KEY not configured")

for directory in ["data", "logs"]:
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)

if settings.debug:
    print(f"🔧 Configuration loaded:")
    print(f"   - App: {settings.app_name} v{settings.app_version}")
    print(f"   - Database: {settings.mysql_host}:{settings.mysql_port}/{settings.mysql_database}")
    print(f"   - Redis: {settings.redis_host}:{settings.redis_port}")
    print(f"   - Session TTL: {settings.session_ttl_hours}h")
