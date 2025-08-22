# Giả định: Đây là nội dung của main.py trước đó
# Đổi tên thành recommender_hybrid.py
# Nội dung giữ nguyên, ví dụ:
import argparse
import logging
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional

import faiss
import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from sentence_transformers import SentenceTransformer
import redis
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score

def parse_args():
    parser = argparse.ArgumentParser(description="Hybrid Recommendation System")
    parser.add_argument("--behavior", type=str, default="user_behavior.csv")
    parser.add_argument("--products", type=str, default="product_details.csv")
    parser.add_argument("--w2v-model", type=str, default="models/prod2vec.model")
    parser.add_argument("--embeddings-cache", type=str, default="models/product_embeddings.npz")
    parser.add_argument("--faiss-index", type=str, default="models/faiss.index")
    parser.add_argument("--sentence-model", type=str, default="all-MiniLM-L6-v2")
    parser.add_argument("--out-json", type=str, default="related_products.json")
    parser.add_argument("--redis-host", type=str, default="redis")
    parser.add_argument("--redis-port", type=int, default=6379)
    parser.add_argument("--min-count", type=int, default=1)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--topn-w2v", type=int, default=10)
    parser.add_argument("--topn-content", type=int, default=10)
    parser.add_argument("--hybrid-weight-w2v", type=float, default=0.7)
    parser.add_argument("--content-only-for-new", action="store_true")
    parser.add_argument("--evaluate", action="store_true")
    parser.add_argument("--faiss-clusters", type=int, default=128)
    return parser.parse_args()

def load_data(behavior_path: str, products_path: str):
    df_behavior = pd.read_csv(behavior_path)
    df_products = pd.read_csv(products_path)
    df_behavior["user_id"] = df_behavior["user_id"].astype(str)
    df_behavior["product_id"] = df_behavior["product_id"].astype(str)
    df_products["product_id"] = df_products["product_id"].astype(str)
    return df_behavior, df_products

def prepare_w2v_data(df_behavior: pd.DataFrame):
    user_sequences = df_behavior.groupby("user_id")["product_id"].apply(list).tolist()
    return [seq for seq in user_sequences if len(seq) >= 2]

def train_w2v_model(sequences: List[List[str]], min_count: int, epochs: int) -> Word2Vec:
    model = Word2Vec(
        sentences=sequences,
        vector_size=100,
        window=5,
        min_count=min_count,
        workers=4,
        epochs=epochs,
    )
    return model

def prepare_content_embeddings(df_products: pd.DataFrame, sentence_model: str, cache_path: str):
    if os.path.exists(cache_path):
        data = np.load(cache_path)
        return data["embeddings"], data["product_ids"]
    model = SentenceTransformer(sentence_model)
    descriptions = df_products["description"].fillna("").tolist()
    embeddings = model.encode(descriptions, show_progress_bar=True)
    np.savez(cache_path, embeddings=embeddings, product_ids=df_products["product_id"].to_numpy())
    return embeddings, df_products["product_id"].to_numpy()

def build_faiss_index(embeddings: np.ndarray, n_clusters: int):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    if n_clusters > 1:
        quantizer = faiss.IndexFlatL2(dim)
        index = faiss.IndexIVFFlat(quantizer, dim, n_clusters, faiss.METRIC_L2)
        index.train(embeddings)
    index.add(embeddings)
    return index

def get_w2v_recommendations(model: Word2Vec, product_id: str, topn: int):
    try:
        return [pid for pid, _ in model.wv.most_similar(product_id, topn=topn)]
    except KeyError:
        return []

def get_content_recommendations(index: faiss.Index, embeddings: np.ndarray, product_ids: np.ndarray, product_id: str, topn: int):
    try:
        idx = np.where(product_ids == product_id)[0][0]
        distances, indices = index.search(embeddings[idx : idx + 1], topn + 1)
        return [product_ids[i] for i in indices[0] if i != idx][:topn]
    except IndexError:
        return []

def generate_related_products(
    df_products: pd.DataFrame,
    w2v_model: Word2Vec,
    index: faiss.Index,
    product_ids: np.ndarray,
    embeddings: np.ndarray,
    topn_w2v: int,
    topn_content: int,
    hybrid_weight_w2v: float,
    content_only_for_new: bool,
    behavior_products: set,
):
    related_products = {}
    for product_id in df_products["product_id"]:
        w2v_recs = get_w2v_recommendations(w2v_model, product_id, topn_w2v)
        content_recs = get_content_recommendations(index, embeddings, product_ids, product_id, topn_content)
        if content_only_for_new and product_id in behavior_products:
            related_products[product_id] = w2v_recs[:topn_w2v]
        else:
            combined = list(set(w2v_recs + content_recs))
            related_products[product_id] = combined[: max(topn_w2v, topn_content)]
    return related_products

def evaluate_recommendations(df_behavior: pd.DataFrame, related_products: Dict[str, List[str]]):
    train, test = train_test_split(df_behavior, test_size=0.2, random_state=42)
    test_products = set(test["product_id"])
    y_true, y_pred = [], []
    for _, row in test.iterrows():
        user_id, product_id = row["user_id"], row["product_id"]
        recs = related_products.get(product_id, [])
        y_true.append(1 if product_id in test_products else 0)
        y_pred.append(1 if product_id in recs else 0)
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    return precision, recall

def save_related_to_redis(related_products: Dict[str, List[str]], redis_host: str, redis_port: int):
    r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    for product_id, recs in related_products.items():
        r.set(f"related_products:{product_id}", json.dumps(recs))

def main():
    args = parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    logger = logging.getLogger(__name__)

    logger.info("Loading data")
    df_behavior, df_products = load_data(args.behavior, args.products)

    logger.info("Preparing Word2Vec data")
    sequences = prepare_w2v_data(df_behavior)
    behavior_products = set(df_behavior["product_id"])

    logger.info("Training Word2Vec model")
    w2v_model = train_w2v_model(sequences, args.min_count, args.epochs)
    w2v_model.save(args.w2v_model)

    logger.info("Preparing content embeddings")
    embeddings, product_ids = prepare_content_embeddings(df_products, args.sentence_model, args.embeddings_cache)

    logger.info("Building FAISS index")
    index = build_faiss_index(embeddings, args.faiss_clusters)
    faiss.write_index(index, args.faiss_index)

    logger.info("Generating related products")
    related_products = generate_related_products(
        df_products,
        w2v_model,
        index,
        product_ids,
        embeddings,
        args.topn_w2v,
        args.topn_content,
        args.hybrid_weight_w2v,
        args.content_only_for_new,
        behavior_products,
    )

    logger.info("Saving to Redis")
    save_related_to_redis(related_products, args.redis_host, args.redis_port)

    with open(args.out_json, "w") as f:
        json.dump(related_products, f, indent=2)

    if args.evaluate:
        logger.info("Evaluating recommendations")
        precision, recall = evaluate_recommendations(df_behavior, related_products)
        logger.info(f"Precision: {precision:.4f}, Recall: {recall:.4f}")

if __name__ == "__main__":
    main()
