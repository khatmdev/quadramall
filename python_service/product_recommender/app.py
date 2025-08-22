from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import json
import redis
import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus
import subprocess
import logging
import os
from typing import Optional
from recommender_hybrid import main as hybrid_main
from recommender_static import train_static_recommendations

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Hybrid Recommender Service")

# Cấu hình từ biến môi trường
DB_USER = os.getenv("DB_USER", "khadev")
DB_PASSWORD = os.getenv("DB_PASSWORD", quote_plus("Kha@2025"))
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME", "quadra_ecommerce_db_final")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Kết nối MySQL
try:
    engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    logger.info("Connected to MySQL database")
except Exception as e:
    logger.error(f"Failed to connect to MySQL: {e}")
    raise

# Kết nối Redis
try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    r.ping()
    logger.info("Connected to Redis")
except redis.RedisError as e:
    logger.error(f"Failed to connect to Redis: {e}")
    raise

class UpdateHybridRequest(BaseModel):
    behavior_path: str = "data/user_behavior.csv"
    products_path: str = "data/product_details.csv"
    w2v_model: str = "models/prod2vec.model"
    embeddings_cache: str = "models/product_embeddings.npz"
    faiss_index: str = "models/faiss.index"
    sentence_model: str = "all-MiniLM-L6-v2"
    redis_host: str = REDIS_HOST
    redis_port: int = REDIS_PORT
    min_count: int = 1
    epochs: int = 10
    topn_w2v: int = 10
    topn_content: int = 10
    hybrid_weight_w2v: float = 0.7
    content_only_for_new: bool = True
    evaluate: bool = True
    faiss_clusters: int = 128

class UpdateStaticRequest(BaseModel):
    behavior_path: str = "data/user_behavior.csv"
    redis_host: str = REDIS_HOST
    redis_port: int = REDIS_PORT
    output_json: str = "data/recommendations.json"

@app.post("/update-hybrid-recommendations")
async def update_hybrid_recommendations(req: UpdateHybridRequest):
    try:
        # Tạo user_behavior.csv
        logger.info("Generating user_behavior.csv")
        query_behavior = """
        SELECT 
            ubl.user_id, 
            ubl.product_id, 
            p.item_type_id,
            CASE ubl.behavior_type
                WHEN 'VIEW' THEN 1
                WHEN 'LIKE' THEN 2
                WHEN 'ADD_TO_CART' THEN 3
                WHEN 'PURCHASE' THEN 4
            END AS rating
        FROM user_behavior_log ubl
        JOIN products p ON ubl.product_id = p.id
        WHERE ubl.behavior_type IN ('VIEW', 'LIKE', 'ADD_TO_CART', 'PURCHASE')
        AND p.is_active = 1
        AND ubl.behavior_time >= NOW() - INTERVAL 3 MONTH;
        """
        df_behavior = pd.read_sql(query_behavior, engine)
        df_behavior.to_csv(req.behavior_path, index=False)
        logger.info(f"Saved user_behavior.csv with {len(df_behavior)} records")

        # Tạo product_details.csv
        logger.info("Generating product_details.csv")
        query_products = """
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.description AS description,
            it.name AS category_name
        FROM products p
        LEFT JOIN item_types it ON p.item_type_id = it.id
        WHERE p.is_active = 1
        AND p.description IS NOT NULL
        AND it.is_active = 1;
        """
        df_products = pd.read_sql(query_products, engine)
        df_products['product_id'] = df_products['product_id'].astype(str)
        df_products['description'] = df_products['description'].fillna('')
        df_products['product_name'] = df_products['product_name'].fillna('')
        df_products['category_name'] = df_products['category_name'].fillna('')
        df_products.to_csv(req.products_path, index=False)
        logger.info(f"Saved product_details.csv with {len(df_products)} records")

        # Chạy đề xuất hybrid
        logger.info("Running hybrid recommendation pipeline")
        cmd = [
            "python", "recommender_hybrid.py",
            "--behavior", req.behavior_path,
            "--products", req.products_path,
            "--w2v-model", req.w2v_model,
            "--embeddings-cache", req.embeddings_cache,
            "--faiss-index", req.faiss_index,
            "--sentence-model", req.sentence_model,
            "--redis-host", req.redis_host,
            "--redis-port", str(req.redis_port),
            "--min-count", str(req.min_count),
            "--epochs", str(req.epochs),
            "--topn-w2v", str(req.topn_w2v),
            "--topn-content", str(req.topn_content),
            "--hybrid-weight-w2v", str(req.hybrid_weight_w2v),
            "--faiss-clusters", str(req.faiss_clusters)
        ]
        if req.content_only_for_new:
            cmd.append("--content-only-for-new")
        if req.evaluate:
            cmd.append("--evaluate")

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"Hybrid recommendation pipeline failed: {result.stderr}")
            raise HTTPException(status_code=500, detail=result.stderr)
        
        logger.info("Hybrid recommendations updated successfully")
        return {"message": "Hybrid recommendations updated successfully", "records_processed": len(df_behavior)}
    except Exception as e:
        logger.error(f"Error updating hybrid recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-static-recommendations")
async def update_static_recommendations(req: UpdateStaticRequest):
    try:
        # Tạo user_behavior.csv
        logger.info("Generating user_behavior.csv")
        query_behavior = """
        SELECT 
            ubl.user_id, 
            ubl.product_id, 
            p.item_type_id,
            CASE ubl.behavior_type
                WHEN 'VIEW' THEN 1
                WHEN 'LIKE' THEN 2
                WHEN 'ADD_TO_CART' THEN 3
                WHEN 'PURCHASE' THEN 4
            END AS rating
        FROM user_behavior_log ubl
        JOIN products p ON ubl.product_id = p.id
        WHERE ubl.behavior_type IN ('VIEW', 'LIKE', 'ADD_TO_CART', 'PURCHASE')
        AND p.is_active = 1
        AND ubl.behavior_time >= NOW() - INTERVAL 3 MONTH;
        """
        df_behavior = pd.read_sql(query_behavior, engine)
        df_behavior.to_csv(req.behavior_path, index=False)
        logger.info(f"Saved user_behavior.csv with {len(df_behavior)} records")

        # Chạy đề xuất tĩnh
        logger.info("Running static recommendation pipeline")
        recommendations = train_static_recommendations(req.behavior_path, req.redis_host, req.redis_port, req.output_json)
        
        logger.info("Static recommendations updated successfully")
        return {"message": "Static recommendations updated successfully", "users_processed": len(recommendations)}
    except Exception as e:
        logger.error(f"Error updating static recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/related-products/{product_id}")
async def get_related_products(product_id: str):
    try:
        related = r.get(f"related_products:{product_id}")
        if not related:
            logger.warning(f"No recommendations found for product_id: {product_id}")
            raise HTTPException(status_code=404, detail="No recommendations found")
        logger.info(f"Retrieved recommendations for product_id: {product_id}")
        return json.loads(related)
    except redis.RedisError as e:
        logger.error(f"Redis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to access Redis")
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/home-recommendations/{user_id}")
async def get_home_recommendations(user_id: str):
    try:
        # Ưu tiên đề xuất động
        related = r.get(f"rec_user_dynamic:{user_id}")
        if related:
            logger.info(f"Retrieved dynamic recommendations for user {user_id}")
            return json.loads(related)
        # Fallback về đề xuất tĩnh
        related = r.get(f"rec_user:{user_id}")
        if not related:
            logger.warning(f"No recommendations found for user {user_id}")
            raise HTTPException(status_code=404, detail="No recommendations found")
        logger.info(f"Retrieved static recommendations for user {user_id}")
        return json.loads(related)
    except redis.RedisError as e:
        logger.error(f"Redis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to access Redis")
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
