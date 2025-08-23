"""
Database Connection Management
"""
import logging
import redis
from typing import Generator, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# SQLAlchemy setup
engine = create_engine(
    settings.mysql_url,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
redis_client: Optional[redis.Redis] = None

def get_redis_client() -> redis.Redis:
    """Get Redis client singleton"""
    global redis_client
    if redis_client is None:
        try:
            redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            redis_client.ping()
            logger.info("✅ Redis connection established")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            redis_client = None
            raise
    return redis_client

def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

async def check_db_health() -> bool:
    """Check database health"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

async def check_redis_health() -> bool:
    """Check Redis health"""
    try:
        if redis_client:
            redis_client.ping()
            return True
        return False
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return False

class DatabaseManager:
    """Database connection manager"""

    def __init__(self):
        self.db_engine = engine
        self.redis_client = None
        self._initialize_redis()

    def _initialize_redis(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = get_redis_client()
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")

    async def health_check(self) -> dict:
        """Comprehensive health check"""
        db_status = await check_db_health()
        redis_status = await check_redis_health()

        return {
            "database": {
                "status": "healthy" if db_status else "unhealthy",
                "connected": db_status
            },
            "redis": {
                "status": "healthy" if redis_status else "unhealthy",
                "connected": redis_status
            }
        }

    def get_db_session(self) -> Session:
        """Get new database session"""
        return SessionLocal()

    def close_connections(self):
        """Close all connections"""
        try:
            if self.redis_client:
                self.redis_client.close()
            self.db_engine.dispose()
            logger.info("✅ Database connections closed")
        except Exception as e:
            logger.error(f"Error closing connections: {e}")

# Global database manager instance
db_manager = DatabaseManager()
