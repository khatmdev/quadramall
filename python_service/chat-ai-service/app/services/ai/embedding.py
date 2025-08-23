"""
Embedding Service - Handles text embedding generation
"""
import logging
import numpy as np
from typing import List, Optional
from sentence_transformers import SentenceTransformer

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class EmbeddingService:
    """
    Service for generating text embeddings
    """

    def __init__(self):
        self.model = None
        self.model_name = settings.EMBEDDING_MODEL
        self.dimension = settings.VECTOR_DIMENSION
        self._initialize()

    def _initialize(self):
        """Initialize the embedding model"""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)

            # Test and get actual dimension
            test_embedding = self.model.encode(["test"])
            self.dimension = test_embedding.shape[1]

            logger.info(f"✅ Embedding model loaded. Dimension: {self.dimension}")

        except Exception as e:
            logger.error(f"❌ Failed to load embedding model: {e}")
            raise

    def encode(
        self,
        texts: List[str],
        normalize: bool = True,
        batch_size: Optional[int] = None
    ) -> np.ndarray:
        """
        Generate embeddings for a list of texts
        """
        try:
            if not self.model:
                raise ValueError("Embedding model not loaded")

            batch_size = batch_size or settings.BATCH_SIZE

            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=normalize
            )

            return embeddings.astype('float32')

        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise

    def encode_single(self, text: str, normalize: bool = True) -> np.ndarray:
        """
        Generate embedding for a single text
        """
        try:
            embeddings = self.encode([text], normalize=normalize)
            return embeddings[0]

        except Exception as e:
            logger.error(f"Error generating single embedding: {e}")
            raise

    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        """
        try:
            # Normalize if not already normalized
            norm1 = np.linalg.norm(embedding1)
            norm2 = np.linalg.norm(embedding2)

            if norm1 == 0 or norm2 == 0:
                return 0.0

            similarity = np.dot(embedding1, embedding2) / (norm1 * norm2)
            return float(similarity)

        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0

    def batch_similarity(self, query_embedding: np.ndarray, embeddings: np.ndarray) -> np.ndarray:
        """
        Calculate similarity between query and batch of embeddings
        """
        try:
            # Normalize query embedding
            query_norm = np.linalg.norm(query_embedding)
            if query_norm == 0:
                return np.zeros(len(embeddings))

            query_normalized = query_embedding / query_norm

            # Normalize document embeddings
            doc_norms = np.linalg.norm(embeddings, axis=1)
            valid_docs = doc_norms != 0

            similarities = np.zeros(len(embeddings))
            if np.any(valid_docs):
                valid_embeddings = embeddings[valid_docs]
                valid_embeddings_normalized = valid_embeddings / doc_norms[valid_docs][:, np.newaxis]
                valid_similarities = np.dot(valid_embeddings_normalized, query_normalized)
                similarities[valid_docs] = valid_similarities

            return similarities

        except Exception as e:
            logger.error(f"Error calculating batch similarity: {e}")
            return np.zeros(len(embeddings))

    def get_model_info(self) -> dict:
        """
        Get information about the loaded model
        """
        return {
            "model_name": self.model_name,
            "dimension": self.dimension,
            "max_seq_length": getattr(self.model, 'max_seq_length', None),
            "loaded": self.model is not None
        }

    async def health_check(self) -> dict:
        """
        Health check for embedding service
        """
        try:
            if not self.model:
                return {"status": "unhealthy", "error": "Model not loaded"}

            # Test embedding generation
            test_embedding = self.encode_single("health check test")

            return {
                "status": "healthy",
                "model_loaded": True,
                "dimension": self.dimension,
                "test_embedding_shape": test_embedding.shape
            }

        except Exception as e:
            logger.error(f"Embedding service health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
