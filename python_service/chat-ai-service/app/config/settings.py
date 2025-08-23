"""
Configuration Settings
"""
import os
from typing import Optional, List
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Chat AI Service"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "vandat"
    MYSQL_PASSWORD: str = "admin"
    MYSQL_DATABASE: str = "quadra_ecommerce_db1"
    MYSQL_CHARSET: str = "utf8mb4"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0

    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    # Vector Search
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    VECTOR_DIMENSION: int = 384
    TOP_K_RESULTS: int = 5
    SIMILARITY_THRESHOLD: float = 0.5

    # Conversation Memory
    MAX_CONVERSATION_HISTORY: int = 20
    CONVERSATION_TTL_HOURS: int = 24
    AUTO_CLEANUP_ENABLED: bool = True

    # Cache
    CACHE_TTL_SECONDS: int = 3600
    ENABLE_CACHE: bool = True

    # Performance
    MAX_CONCURRENT_REQUESTS: int = 100
    REQUEST_TIMEOUT: int = 30
    BATCH_SIZE: int = 32

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Security
    ALLOWED_HOSTS: List[str] = ["*"]
    CORS_ORIGINS: List[str] = ["*"]

    # File Storage
    DATA_DIR: str = "data"
    VECTOR_STORAGE_PATH: str = "data/vectors"
    CACHE_STORAGE_PATH: str = "data/cache"
    LOG_STORAGE_PATH: str = "data/logs"

    @property
    def mysql_url(self) -> str:
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
            f"?charset={self.MYSQL_CHARSET}"
        )

    @property
    def redis_url(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    def create_directories(self):
        """Create necessary directories"""
        directories = [
            self.DATA_DIR,
            self.VECTOR_STORAGE_PATH,
            self.CACHE_STORAGE_PATH,
            self.LOG_STORAGE_PATH
        ]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.create_directories()
    return settings
