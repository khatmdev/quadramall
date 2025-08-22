import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise.accuracy import rmse
import json
import redis
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def train_static_recommendations(behavior_path: str, redis_host: str, redis_port: int, output_json: str = "recommendations.json"):
    try:
        # Đọc CSV
        logger.info("Loading user_behavior.csv")
        df = pd.read_csv(behavior_path)
        df["user_id"] = df["user_id"].astype(str)
        df["product_id"] = df["product_id"].astype(str)

        # Thiết lập Surprise Dataset
        reader = Reader(rating_scale=(1, 4))
        data = Dataset.load_from_df(df[['user_id', 'product_id', 'rating']], reader)

        # Train/test split
        trainset, testset = train_test_split(data, test_size=0.2, random_state=42)

        # Huấn luyện mô hình SVD
        logger.info("Training SVD model")
        algo = SVD(n_factors=50, n_epochs=20, random_state=42)
        algo.fit(trainset)

        # Đánh giá mô hình
        predictions = [algo.predict(uid, iid, r_ui) for (uid, iid, r_ui) in testset]
        logger.info(f"RMSE: {rmse(predictions)}")

        # Dự đoán top sản phẩm cho mỗi user
        logger.info("Generating static recommendations")
        recommendations = {}
        all_products = df[['product_id', 'item_type_id']].drop_duplicates()

        # Tính điểm xu hướng
        trend_scores = df.groupby('product_id')['rating'].mean().to_dict()

        redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        for uid in df['user_id'].unique():
            # Tính ngành hàng ưa thích
            user_item_types = df[df['user_id'] == uid].groupby('item_type_id')['rating'].mean()
            preferred_item_type = user_item_types.idxmax() if not user_item_types.empty else None

            # Dự đoán điểm số cho tất cả sản phẩm
            scored = [(iid, algo.predict(uid, iid).est) for iid in all_products['product_id']]
            top = sorted(scored, key=lambda x: x[1], reverse=True)[:15]

            # Ưu tiên sản phẩm thuộc ngành hàng ưa thích và xu hướng
            top_products = []
            for iid, score in top:
                item_type = all_products[all_products['product_id'] == iid]['item_type_id'].iloc[0]
                trend_boost = trend_scores.get(iid, 1) / 4
                top_products.append((iid, score * trend_boost, item_type))

            # Sắp xếp lại
            if preferred_item_type:
                top_products = sorted(
                    top_products,
                    key=lambda x: (x[2] == preferred_item_type, x[1]),
                    reverse=True
                )
            else:
                top_products = sorted(top_products, key=lambda x: x[1], reverse=True)

            # Đảm bảo đa dạng
            final_products = []
            item_type_count = {}
            for iid, score, item_type in top_products:
                if item_type not in item_type_count:
                    item_type_count[item_type] = 0
                if item_type_count[item_type] < 5 and len(final_products) < 10:
                    final_products.append(iid)
                    item_type_count[item_type] += 1

            recommendations[uid] = [str(iid) for iid in final_products]

            # Đẩy vào Redis
            redis_key = f"rec_user:{uid}"
            redis_client.set(redis_key, json.dumps(final_products))

        # Ghi ra JSON (tùy chọn)
        with open(output_json, "w") as f:
            json.dump(recommendations, f, indent=2)

        logger.info("Static recommendations saved to Redis and JSON")
        return recommendations
    except Exception as e:
        logger.error(f"Error in static recommendations: {e}")
        raise
