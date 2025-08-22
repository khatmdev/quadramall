import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus
import redis
import json
from datetime import datetime, timedelta
import logging
from kafka import KafkaConsumer

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Cấu hình từ biến môi trường
DB_USER = os.getenv("DB_USER", "khadev")
DB_PASSWORD = os.getenv("DB_PASSWORD", quote_plus("Kha@2025"))
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME", "quadra_ecommerce_db_final")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")

# Kết nối MySQL
try:
    engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    logger.info("Connected to MySQL database")
except Exception as e:
    logger.error(f"Failed to connect to MySQL: {e}")
    raise

def get_recent_behaviors(user_id: str, hours: int = 24):
    """Lấy hành vi gần đây của user trong <hours> giờ"""
    query = """
    SELECT 
        u.id AS user_id, 
        p.id AS product_id, 
        p.item_type_id,
        CASE ubl.behavior_type
            WHEN 'VIEW' THEN 1
            WHEN 'LIKE' THEN 2
            WHEN 'ADD_TO_CART' THEN 3
            WHEN 'PURCHASE' THEN 4
        END AS rating
    FROM user_behavior_log ubl
    JOIN users u ON ubl.user_id = u.id
    JOIN products p ON ubl.product_id = p.id
    WHERE ubl.behavior_type IN ('VIEW', 'LIKE', 'ADD_TO_CART', 'PURCHASE')
    AND p.is_active = 1
    AND u.id = %s
    AND ubl.behavior_time >= %s;
    """
    time_threshold = (datetime.now() - timedelta(hours=hours)).strftime('%Y-%m-%d %H:%M:%S')
    df = pd.read_sql(query, engine, params=(user_id, time_threshold))
    return df

def update_dynamic_recommendations(user_id: str):
    """Cập nhật đề xuất động dựa trên hành vi gần đây"""
    try:
        # Kết nối Redis
        redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

        # Lấy hành vi trong 24 giờ
        df_recent = get_recent_behaviors(user_id)
        
        if df_recent.empty:
            logger.info(f"No recent behaviors for user {user_id}")
            return None
        
        # Tính ngành hàng ưa thích dựa trên rating trung bình
        item_type_scores = df_recent.groupby('item_type_id')['rating'].mean()
        preferred_item_type = item_type_scores.idxmax() if not item_type_scores.empty else None
        
        # Lấy tất cả sản phẩm đang hoạt động
        query_products = """
        SELECT id AS product_id, item_type_id
        FROM products
        WHERE is_active = 1;
        """
        df_products = pd.read_sql(query_products, engine)
        
        # Tính điểm cho sản phẩm dựa trên hành vi gần đây
        product_scores = df_recent.groupby('product_id')['rating'].sum().to_dict()
        
        # Tạo danh sách đề xuất
        recommendations = []
        for _, row in df_products.iterrows():
            product_id = row['product_id']
            item_type = row['item_type_id']
            score = product_scores.get(product_id, 0)
            if preferred_item_type and item_type == preferred_item_type:
                score += 2
            recommendations.append((product_id, score, item_type))
        
        # Sắp xếp và lấy top 10, đảm bảo đa dạng
        recommendations = sorted(recommendations, key=lambda x: x[1], reverse=True)
        final_products = []
        item_type_count = {}
        for product_id, score, item_type in recommendations:
            if item_type not in item_type_count:
                item_type_count[item_type] = 0
            if item_type_count[item_type] < 5 and len(final_products) < 10:
                final_products.append(product_id)
                item_type_count[item_type] += 1
        
        # Kết hợp với đề xuất tĩnh (nếu có)
        static_recs = json.loads(redis_client.get(f"rec_user:{user_id}") or "[]")
        final_products = list(set(final_products + static_recs))[:10]
        
        # Đẩy vào Redis với TTL 24 giờ
        redis_key = f"rec_user_dynamic:{user_id}"
        redis_client.setex(redis_key, 86400, json.dumps(final_products))
        logger.info(f"Dynamic recommendations updated for user {user_id}")
        return final_products
    except Exception as e:
        logger.error(f"Error updating dynamic recommendations for user {user_id}: {e}")
        return None

def main():
    # Kết nối Kafka consumer
    consumer = KafkaConsumer(
        'user_behaviors',
        bootstrap_servers=[KAFKA_BOOTSTRAP_SERVERS],
        value_deserializer=lambda x: json.loads(x.decode('utf-8')),
        group_id='recommender_dynamic'
    )
    
    logger.info("Starting Kafka consumer for user behaviors...")
    for message in consumer:
        behavior = message.value
        user_id = message.key  # Key là userId
        logger.info(f"Processing dynamic recommendations for user {user_id}")
        update_dynamic_recommendations(user_id)

if __name__ == "__main__":
    main()
