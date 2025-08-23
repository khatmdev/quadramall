"""
Vector Search Service - Fixed to handle None values from database
"""
import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

from app.config.settings import get_settings
from app.config.database import get_db
from app.models.product import Product, ProductVariant, Store, Category, ItemType
from sqlalchemy.orm import joinedload
from sqlalchemy import text

logger = logging.getLogger(__name__)
settings = get_settings()

class VectorSearchService:
    """
    Clean vector search implementation with FAISS - Fixed for None handling
    """

    def __init__(self):
        self.model = None
        self.index = None
        self.product_metadata = []
        self.dimension = settings.VECTOR_DIMENSION
        self.model_name = settings.EMBEDDING_MODEL
        self.index_path = os.path.join(settings.VECTOR_STORAGE_PATH, "faiss_index.bin")
        self.metadata_path = os.path.join(settings.VECTOR_STORAGE_PATH, "metadata.json")
        self._initialize()

    def _initialize(self):
        """Initialize the service"""
        try:
            self._load_model()
            if not self._load_index():
                logger.info("No existing index found, will build new one")
            logger.info("✅ VectorSearchService initialized")
        except Exception as e:
            logger.error(f"❌ VectorSearchService initialization failed: {e}")
            raise

    def _load_model(self):
        """Load sentence transformer model"""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)

            # Test and get actual dimension
            test_embedding = self.model.encode(["test"])
            self.dimension = test_embedding.shape[1]

            logger.info(f"Model loaded successfully. Dimension: {self.dimension}")

        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise

    def _load_index(self) -> bool:
        """Load existing FAISS index"""
        try:
            if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
                # Load FAISS index
                self.index = faiss.read_index(self.index_path)

                # Load metadata
                with open(self.metadata_path, 'r', encoding='utf-8') as f:
                    self.product_metadata = json.load(f)

                logger.info(f"Index loaded: {self.index.ntotal} vectors")
                return True

            return False

        except Exception as e:
            logger.error(f"Error loading index: {e}")
            return False

    def _save_index(self):
        """Save FAISS index and metadata"""
        try:
            os.makedirs(settings.VECTOR_STORAGE_PATH, exist_ok=True)

            if self.index:
                faiss.write_index(self.index, self.index_path)

            if self.product_metadata:
                with open(self.metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(self.product_metadata, f, ensure_ascii=False, indent=2)

            logger.info("Index saved successfully")

        except Exception as e:
            logger.error(f"Error saving index: {e}")
            raise

    async def build_index(self, force_rebuild: bool = False) -> bool:
        """Build FAISS index from database"""
        try:
            if self.index and not force_rebuild:
                logger.info("Index already exists, skipping build")
                return True

            logger.info("Building FAISS index from database...")

            # Get products from database
            products_data = await self._fetch_products_from_db()

            if not products_data:
                logger.warning("No products found in database")
                return False

            logger.info(f"Processing {len(products_data)} products")

            # Create embeddings
            texts = [item['text'] for item in products_data]
            embeddings = self._create_embeddings(texts)

            # Build FAISS index
            self.index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
            faiss.normalize_L2(embeddings)  # Normalize for cosine similarity
            self.index.add(embeddings)

            # Store metadata
            self.product_metadata = products_data

            # Save to disk
            self._save_index()

            logger.info(f"FAISS index built successfully: {self.index.ntotal} vectors")
            return True

        except Exception as e:
            logger.error(f"Error building index: {e}")
            return False

    async def search(
        self,
        query: str,
        top_k: int = None,
        min_score: float = None
    ) -> List[Dict[str, Any]]:
        """Search for products using vector similarity"""
        try:
            if not self.index or not self.model:
                logger.warning("Index or model not available")
                return []

            top_k = top_k or settings.TOP_K_RESULTS
            min_score = min_score or settings.SIMILARITY_THRESHOLD

            # Create query embedding
            query_embedding = self._create_embeddings([query])
            faiss.normalize_L2(query_embedding)

            # Search
            scores, indices = self.index.search(query_embedding, top_k)

            # Process results
            results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if idx < len(self.product_metadata) and score >= min_score:
                    product = self.product_metadata[idx].copy()
                    product['similarity_score'] = float(score)
                    product['rank'] = i + 1
                    results.append(product)

            logger.info(f"Vector search found {len(results)} products for: {query}")
            return results

        except Exception as e:
            logger.error(f"Search error: {e}")
            return []

    def _create_embeddings(self, texts: List[str]) -> np.ndarray:
        """Create embeddings for texts"""
        try:
            embeddings = self.model.encode(
                texts,
                batch_size=settings.BATCH_SIZE,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True
            )
            return embeddings.astype('float32')

        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            raise

    async def _fetch_products_from_db(self) -> List[Dict[str, Any]]:
        """Fetch products from database with proper None handling"""
        try:
            db = next(get_db())

            # Use raw SQL for better performance
            sql = """
                SELECT
                    p.id, p.name, p.slug, p.description, p.thumbnail_url,
                    s.name as store_name,
                    c.name as category_name,
                    it.name as item_type_name,
                    MIN(pv.price) as min_price,
                    MAX(pv.price) as max_price,
                    SUM(pv.stock_quantity) as total_stock
                FROM products p
                JOIN stores s ON p.store_id = s.id
                LEFT JOIN categories c ON p.category_id = c.id
                JOIN item_types it ON p.item_type_id = it.id
                LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = 1
                WHERE p.is_active = 1 AND s.status = 'ACTIVE'
                GROUP BY p.id
                ORDER BY p.created_at DESC
            """

            result = db.execute(text(sql))
            rows = result.fetchall()
            columns = result.keys()

            products_data = []
            for row in rows:
                try:
                    row_dict = dict(zip(columns, row))
                    product_info = self._build_product_text(row_dict)
                    products_data.append(product_info)
                except Exception as e:
                    logger.warning(f"Error processing product row: {e}")
                    continue

            db.close()
            logger.info(f"Successfully fetched {len(products_data)} products from database")
            return products_data

        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            return []

    def _build_product_text(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Build searchable text and metadata for product with None handling"""
        try:
            # Build searchable text
            text_parts = []

            # Product name
            name = product_data.get('name')
            if name:
                text_parts.append(f"Tên sản phẩm: {name}")

            # Description
            description = product_data.get('description')
            if description:
                # Limit description length
                desc_clean = str(description).strip()[:200]
                text_parts.append(f"Mô tả: {desc_clean}")

            # Category
            category_name = product_data.get('category_name')
            if category_name:
                text_parts.append(f"Danh mục: {category_name}")

            # Item type
            item_type_name = product_data.get('item_type_name')
            if item_type_name:
                text_parts.append(f"Loại: {item_type_name}")

            # Store
            store_name = product_data.get('store_name')
            if store_name:
                text_parts.append(f"Cửa hàng: {store_name}")

            # Price information - Handle None values carefully
            min_price = product_data.get('min_price')
            max_price = product_data.get('max_price')

            if min_price is not None and min_price > 0:
                if max_price is not None and min_price != max_price:
                    text_parts.append(f"Giá từ: {float(min_price):,.0f}đ đến {float(max_price):,.0f}đ")
                else:
                    text_parts.append(f"Giá: {float(min_price):,.0f}đ")

            # Stock information - Handle None values
            total_stock = product_data.get('total_stock')
            if total_stock is not None and total_stock > 0:
                text_parts.append(f"Còn hàng: {int(total_stock)} sản phẩm")
            else:
                text_parts.append("Hết hàng")

            # Create search text
            search_text = ". ".join(text_parts) if text_parts else f"Sản phẩm {name or 'không xác định'}"

            # Return structured data with safe type conversion
            return {
                "id": int(product_data.get('id', 0)),
                "name": str(name or 'Sản phẩm không tên'),
                "slug": str(product_data.get('slug', '')),
                "description": str(description or ''),
                "text": search_text,
                "category": str(category_name or ''),
                "item_type": str(item_type_name or ''),
                "store": str(store_name or ''),
                "min_price": float(min_price) if min_price is not None else None,
                "max_price": float(max_price) if max_price is not None else None,
                "total_stock": int(total_stock) if total_stock is not None else 0,
                "thumbnail_url": str(product_data.get('thumbnail_url', '')),
                "url": f"/products/{product_data.get('slug', '')}" if product_data.get('slug') else None
            }

        except Exception as e:
            logger.error(f"Error building product text: {e}")
            # Return minimal valid product data
            return {
                "id": int(product_data.get('id', 0)),
                "name": str(product_data.get('name', 'Sản phẩm lỗi')),
                "slug": str(product_data.get('slug', '')),
                "description": "",
                "text": f"Sản phẩm: {product_data.get('name', 'Không xác định')}",
                "category": "",
                "item_type": "",
                "store": str(product_data.get('store_name', '')),
                "min_price": None,
                "max_price": None,
                "total_stock": 0,
                "thumbnail_url": "",
                "url": None
            }

    async def add_product(self, product_data: Dict[str, Any]) -> bool:
        """Add single product to index"""
        try:
            if not self.index or not self.model:
                return False

            # Build product text
            product_info = self._build_product_text(product_data)

            # Create embedding
            embedding = self._create_embeddings([product_info['text']])
            faiss.normalize_L2(embedding)

            # Add to index
            self.index.add(embedding)
            self.product_metadata.append(product_info)

            # Save to disk
            self._save_index()

            logger.info(f"Added product to index: {product_info['name']}")
            return True

        except Exception as e:
            logger.error(f"Error adding product: {e}")
            return False

    async def remove_product(self, product_id: int) -> bool:
        """Remove product from index (rebuild required)"""
        try:
            # Find product in metadata
            product_idx = None
            for i, product in enumerate(self.product_metadata):
                if product.get('id') == product_id:
                    product_idx = i
                    break

            if product_idx is None:
                logger.warning(f"Product {product_id} not found in index")
                return False

            # Remove from metadata
            removed_product = self.product_metadata.pop(product_idx)

            # Rebuild index (FAISS doesn't support efficient removal)
            await self._rebuild_index_from_metadata()

            logger.info(f"Removed product from index: {removed_product['name']}")
            return True

        except Exception as e:
            logger.error(f"Error removing product: {e}")
            return False

    async def _rebuild_index_from_metadata(self):
        """Rebuild index from current metadata"""
        try:
            if not self.product_metadata:
                return

            # Create embeddings for all products
            texts = [item['text'] for item in self.product_metadata]
            embeddings = self._create_embeddings(texts)

            # Build new index
            self.index = faiss.IndexFlatIP(self.dimension)
            faiss.normalize_L2(embeddings)
            self.index.add(embeddings)

            # Save to disk
            self._save_index()

            logger.info(f"Index rebuilt with {len(self.product_metadata)} products")

        except Exception as e:
            logger.error(f"Error rebuilding index: {e}")
            raise

    async def get_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        try:
            return {
                "total_vectors": self.index.ntotal if self.index else 0,
                "dimension": self.dimension,
                "model_name": self.model_name,
                "metadata_count": len(self.product_metadata),
                "index_exists": self.index is not None,
                "index_path": self.index_path,
                "metadata_path": self.metadata_path
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {}

    async def health_check(self) -> Dict[str, Any]:
        """Health check for vector service"""
        try:
            health = {
                "status": "healthy",
                "model_loaded": self.model is not None,
                "index_loaded": self.index is not None,
                "total_products": len(self.product_metadata),
                "dimension": self.dimension
            }

            if not self.model or not self.index:
                health["status"] = "degraded"

            return health

        except Exception as e:
            logger.error(f"Health check error: {e}")
            return {"status": "unhealthy", "error": str(e)}

    async def cleanup(self):
        """Cleanup resources"""
        try:
            if self.index:
                del self.index
            if self.model:
                del self.model
            logger.info("✅ VectorSearchService cleanup completed")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
