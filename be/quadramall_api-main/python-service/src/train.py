import socket
from urllib.parse import quote_plus
from sqlalchemy import create_engine
import pandas as pd
from surprise import SVD, Dataset, Reader
import joblib
import os
import sys
import json
from datetime import datetime
import logging
import google.generativeai as genai
from typing import Dict, List, Any

# Biến đếm toàn cục để xoay vòng API key
API_KEY_COUNTER = 0

# Cấu hình logging
def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Clear existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # File handler
    file_handler = logging.FileHandler('/app/app.log', mode='a')
    file_handler.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

setup_logging()

# Database connection
user = "thanhnha"
password = quote_plus("thanhnha05")
host = "192.168.0.140"
port = 3306
database = "quadra_ecommerce_db_final"

engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{database}", pool_recycle=3600, pool_pre_ping=True)

# Gemini API keys pool
GEMINI_API_KEYS = [
      "AIzaSyBxKbwnbu5J8OAGNzk26EWdicvAtv5tTK8",
      "AIzaSyCb6KrKiuo1N4YIR9_GaU1tVdXu2OySFmc",
      "AIzaSyCv1KMq_F8xW9JtFNzHnqRidPMROqaXhvs",
      "AIzaSyDKXI3MgHhe4TufLxr9BABNP3lEG4LLLCI",
      "AIzaSyB3fAWu_apwqqg8Y8xZz9BJn4b4yp15a2E",
      "AIzaSyAJylUMX44gqBLD5zxgLOmeuCOAr2PQRog",
      "AIzaSyCW1JbvmCQvrrHT8TfQ2Z7KUP0GoDP_pH4"
]

def get_api_key_for_item_type(item_type_id):
    """
    Xoay vòng API keys để sử dụng đều cho các item_type_id
    """
    global API_KEY_COUNTER
    if not GEMINI_API_KEYS:
        logging.error("[API-KEY] No Gemini API keys provided")
        raise ValueError("No Gemini API keys available")

    # Chọn API key theo biến đếm toàn cục
    api_key_index = API_KEY_COUNTER % len(GEMINI_API_KEYS)
    selected_key = GEMINI_API_KEYS[api_key_index]
    key_suffix = selected_key[-8:]  # Last 8 chars for logging

    # Tăng biến đếm
    API_KEY_COUNTER += 1

    logging.info(f"[API-KEY] Using API key ...{key_suffix} for item_type_id={item_type_id}, key_index={api_key_index}")
    return selected_key

def create_db_engine():
    return engine

def load_raw_training_data(engine, item_type_id):
    """
    Phase 1: Load raw training data từ database
    """
    logging.info(f"[PHASE-1] Loading raw training data for item_type_id={item_type_id}")

    try:
        # Optimized query - chỉ lấy dữ liệu cần thiết
        query = """
        SELECT
            a.name as attribute_name,
            av.value as attribute_value,
            av.id as attribute_value_id,
            COUNT(*) as usage_count
        FROM product_details pd
        JOIN product_variants pv ON pd.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN attributes_value av ON pd.value_id = av.id
        JOIN attributes a ON av.attributes_id = a.id
        WHERE p.item_type_id = %s
        GROUP BY a.name, av.value, av.id
        ORDER BY usage_count DESC
        """

        df = pd.read_sql(query, engine, params=(item_type_id,))

        if df.empty:
            logging.warning(f"[PHASE-1] No data found for item_type_id={item_type_id}")
            return None

        # Log detailed statistics
        unique_attributes = df['attribute_name'].nunique()
        unique_values = df['attribute_value'].nunique()
        total_usage = df['usage_count'].sum()

        logging.info(f"[PHASE-1] Raw data statistics:")
        logging.info(f"  - Total records: {len(df)}")
        logging.info(f"  - Unique attributes: {unique_attributes}")
        logging.info(f"  - Unique values: {unique_values}")
        logging.info(f"  - Total usage count: {total_usage}")
        logging.info(f"  - Top attributes: {df.groupby('attribute_name')['usage_count'].sum().sort_values(ascending=False).head(3).to_dict()}")

        # Save raw training data
        os.makedirs("/app/train_data", exist_ok=True)
        raw_data_path = f"/app/train_data/raw_data_{item_type_id}.csv"
        df.to_csv(raw_data_path, index=False)

        logging.info(f"[PHASE-1] Raw data saved to {raw_data_path}")
        return df

    except Exception as e:
        logging.error(f"[PHASE-1] Error loading raw training data: {e}")
        return None

def get_item_type_name(engine, item_type_id):
    """
    Get item_type name from database
    """
    try:
        query = "SELECT name FROM item_types WHERE id = %s"
        result = pd.read_sql(query, engine, params=(item_type_id,))
        if not result.empty:
            return result.iloc[0]['name']
        return f"item_type_{item_type_id}"
    except Exception as e:
        logging.error(f"Error getting item_type name: {e}")
        return f"item_type_{item_type_id}"

def ai_enhance_training_data(raw_data, item_type_id, item_type_name):
    """
    Phase 2: AI enhancement cho training data using Gemini
    """
    logging.info(f"[PHASE-2] AI enhancing training data for {item_type_name} (ID: {item_type_id})")

    try:
        # Prepare compact data for AI analysis (optimize prompt length)
        attributes_summary = {}
        for _, row in raw_data.iterrows():
            attr_name = row['attribute_name']
            attr_value = row['attribute_value']
            usage_count = row['usage_count']

            if attr_name not in attributes_summary:
                attributes_summary[attr_name] = {
                    'values': [],
                    'total_usage': 0
                }

            attributes_summary[attr_name]['values'].append({
                'value': str(attr_value),
                'count': usage_count
            })
            attributes_summary[attr_name]['total_usage'] += usage_count

        # Limit values per attribute để tránh prompt quá dài
        for attr_name in attributes_summary:
            values = attributes_summary[attr_name]['values']
            # Sort by usage count và chỉ lấy top 10 values (giảm từ 20 để tối ưu quota)
            values_sorted = sorted(values, key=lambda x: x['count'], reverse=True)
            attributes_summary[attr_name]['values'] = values_sorted[:10]

        logging.info(f"[PHASE-2] Prepared {len(attributes_summary)} attributes for AI analysis:")
        for attr_name, attr_info in attributes_summary.items():
            logging.info(f"  - {attr_name}: {len(attr_info['values'])} values, total usage: {attr_info['total_usage']}")

        # Calculate estimated prompt size
        prompt_data_size = len(json.dumps(attributes_summary, ensure_ascii=False))
        logging.info(f"[PHASE-2] Estimated prompt data size: {prompt_data_size} characters")

        # AI enhancement prompt - optimized cho prompt length
        prompt = f"""
Analyze and enhance training data for: {item_type_name}

DATA:
{json.dumps(attributes_summary, ensure_ascii=False)}

TASKS:
1. Clean attribute names (group similar ones)
2. Clean values (remove duplicates, standardize)
3. Rate data quality
4. Detect patterns

Return JSON:
{{
    "enhanced_attributes": [
        {{
            "name": "clean_name",
            "values": [
                {{
                    "value": "clean_value",
                    "usage_count": number,
                    "confidence": 0.0-1.0
                }}
            ],
            "detected_pattern": "pattern_description",
            "priority_score": 0.0-1.0
        }}
    ],
    "data_quality": {{
        "overall_score": 0.0-1.0,
        "completeness": 0.0-1.0,
        "consistency": 0.0-1.0
    }},
    "recommendations": ["brief_suggestions"]
}}
"""

        # Set API key for this item_type
        current_api_key = get_api_key_for_item_type(item_type_id)
        genai.configure(api_key=current_api_key)

        # Call Gemini with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logging.info(f"[PHASE-2] Calling Gemini (attempt {attempt + 1}/{max_retries})...")
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "max_output_tokens": 1500,
                        "temperature": 0.3
                    }
                )

                # Success - break retry loop
                logging.info(f"[PHASE-2] ✅ Gemini call successful on attempt {attempt + 1}")
                break

            except Exception as api_error:
                logging.warning(f"[PHASE-2] ❌ Gemini attempt {attempt + 1} failed: {str(api_error)}")

                if attempt == max_retries - 1:
                    # Final attempt failed
                    logging.error(f"[PHASE-2] All Gemini attempts failed for item_type_id={item_type_id}")
                    raise api_error

                # Wait before retry
                import time
                time.sleep(min(5 * (2 ** attempt), 30))  # Exponential backoff: tối thiểu 5s, tối đa 30s

        # Parse response
        content = response.text.strip()
        logging.info(f"[PHASE-2] Gemini response received ({len(content)} characters)")

        # Clean markdown if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        try:
            enhanced_data = json.loads(content)
            logging.info(f"[PHASE-2] ✅ JSON parsing successful")
        except json.JSONDecodeError as e:
            logging.error(f"[PHASE-2] ❌ JSON parsing failed: {e}")
            logging.error(f"[PHASE-2] Raw content: {content[:500]}...")
            raise e

        # Validate response structure
        if not enhanced_data.get('enhanced_attributes'):
            logging.warning(f"[PHASE-2] ⚠️ No enhanced_attributes in response")

        if not enhanced_data.get('data_quality'):
            logging.warning(f"[PHASE-2] ⚠️ No data_quality in response")

        # Log AI results
        num_enhanced_attrs = len(enhanced_data.get('enhanced_attributes', []))
        quality_score = enhanced_data.get('data_quality', {}).get('overall_score', 0.0)

        logging.info(f"[PHASE-2] ✅ AI enhancement completed:")
        logging.info(f"  - Enhanced attributes: {num_enhanced_attrs}")
        logging.info(f"  - Quality score: {quality_score:.2f}")
        logging.info(f"  - Recommendations: {len(enhanced_data.get('recommendations', []))}")

        return enhanced_data

    except Exception as e:
        logging.error(f"[PHASE-2] ❌ AI enhancement failed for item_type_id={item_type_id}: {e}")
        # Fallback: basic processing without AI
        logging.info(f"[PHASE-2] 🔄 Falling back to basic processing")
        return create_fallback_enhanced_data(raw_data)

def create_fallback_enhanced_data(raw_data):
    """
    Fallback processing without AI
    """
    logging.info("[PHASE-2] 🔄 Using fallback processing (no AI)")

    enhanced_attributes = []
    attributes_summary = {}

    # Group by attribute name
    for _, row in raw_data.iterrows():
        attr_name = row['attribute_name']
        if attr_name not in attributes_summary:
            attributes_summary[attr_name] = []
        attributes_summary[attr_name].append({
            'value': str(row['attribute_value']),
            'usage_count': row['usage_count']
        })

    # Convert to enhanced format
    for attr_name, values in attributes_summary.items():
        # Sort by usage_count
        values_sorted = sorted(values, key=lambda x: x['usage_count'], reverse=True)

        enhanced_attributes.append({
            'name': attr_name,
            'values': [{**v, 'confidence': 0.5} for v in values_sorted],
            'detected_pattern': 'basic_analysis',
            'priority_score': 0.5
        })

        logging.info(f"[FALLBACK] Added attribute '{attr_name}' with {len(values)} values")

    fallback_data = {
        'enhanced_attributes': enhanced_attributes,
        'data_quality': {
            'overall_score': 0.6,
            'completeness': 0.6,
            'consistency': 0.5
        },
        'recommendations': ['AI enhancement not available - using basic processing']
    }

    logging.info(f"[FALLBACK] ✅ Created fallback data with {len(enhanced_attributes)} attributes")
    return fallback_data

def train_svd_model(raw_data, item_type_id):
    """
    Train SVD model từ raw data
    """
    logging.info(f"[SVD-TRAIN] Training SVD model for item_type_id={item_type_id}")

    try:
        # Prepare data for SVD (store_id, attribute_value_id, usage_count)
        svd_data = raw_data[['store_id', 'attribute_value_id', 'usage_count']].copy()

        if svd_data.empty:
            logging.warning(f"[SVD-TRAIN] Empty data for SVD training")
            return None

        # Train SVD
        reader = Reader(rating_scale=(1, svd_data['usage_count'].max()))
        dataset = Dataset.load_from_df(svd_data, reader)
        trainset = dataset.build_full_trainset()

        model = SVD(n_factors=50, n_epochs=20, random_state=42)
        model.fit(trainset)

        # Save SVD model
        os.makedirs("/app/models", exist_ok=True)
        model_path = f"/app/models/svd_model_{item_type_id}.joblib"
        joblib.dump(model, model_path)

        logging.info(f"[SVD-TRAIN] SVD model saved: {model_path} with {trainset.n_ratings} ratings")
        return model

    except Exception as e:
        logging.error(f"[SVD-TRAIN] SVD training failed: {e}")
        return None

def save_enhanced_patterns(enhanced_data, item_type_id, item_type_name):
    """
    Save enhanced patterns to JSON file
    """
    try:
        os.makedirs("/app/models", exist_ok=True)

        # Add metadata
        patterns_data = {
            'item_type_id': item_type_id,
            'item_type_name': item_type_name,
            'training_timestamp': datetime.now().isoformat(),
            'data_quality': enhanced_data['data_quality'],
            'enhanced_attributes': enhanced_data['enhanced_attributes'],
            'recommendations': enhanced_data['recommendations']
        }

        patterns_path = f"/app/models/enhanced_patterns_{item_type_id}.json"
        with open(patterns_path, 'w', encoding='utf-8') as f:
            json.dump(patterns_data, f, ensure_ascii=False, indent=2)

        file_size = os.path.getsize(patterns_path)
        logging.info(f"[SAVE] Enhanced patterns saved: {patterns_path} ({file_size} bytes)")

        # Log pattern summary
        logging.info(f"[SAVE] Pattern summary:")
        logging.info(f"  - Item type: {item_type_name}")
        logging.info(f"  - Attributes: {len(enhanced_data['enhanced_attributes'])}")
        logging.info(f"  - Overall quality: {enhanced_data['data_quality']['overall_score']:.2f}")

        return patterns_path

    except Exception as e:
        logging.error(f"[SAVE] Failed to save enhanced patterns: {e}")
        return None

def enhanced_train_pipeline(engine, item_type_id):
    """
    Complete 2-phase training pipeline
    """
    logging.info(f"[PIPELINE] Starting enhanced training for item_type_id={item_type_id}")

    # Get item type name
    item_type_name = get_item_type_name(engine, item_type_id)

    # Phase 1: Load raw data
    raw_data = load_raw_training_data(engine, item_type_id)
    if raw_data is None or raw_data.empty:
        logging.warning(f"[PIPELINE] No raw data available for item_type_id={item_type_id}")
        return False

    # Phase 2: AI enhancement
    enhanced_data = ai_enhance_training_data(raw_data, item_type_id, item_type_name)
    if enhanced_data is None:
        logging.error(f"[PIPELINE] AI enhancement failed for item_type_id={item_type_id}")
        return False

    # Train SVD model
    svd_model = train_svd_model(raw_data, item_type_id)

    # Save enhanced patterns
    patterns_path = save_enhanced_patterns(enhanced_data, item_type_id, item_type_name)

    success = (enhanced_data is not None and patterns_path is not None)

    if success:
        logging.info(f"[PIPELINE] Training completed for {item_type_name}. Quality score: {enhanced_data['data_quality']['overall_score']:.2f}")
    else:
        logging.error(f"[PIPELINE] Training failed for item_type_id={item_type_id}")

    return success

def get_all_item_type_ids(engine):
    """
    Get all item_type_ids from database
    """
    logging.info("[DISCOVERY] Getting all item_type_ids from database")
    try:
        query = "SELECT DISTINCT item_type_id FROM products"
        df = pd.read_sql(query, engine)
        item_type_ids = df['item_type_id'].tolist()
        logging.info(f"[DISCOVERY] Found {len(item_type_ids)} item_type_ids: {item_type_ids}")
        return item_type_ids
    except Exception as e:
        logging.error(f"[DISCOVERY] Error getting item_type_ids: {e}")
        return []

if __name__ == "__main__":
    logging.info(f"[MAIN] ==> Starting enhanced training at {datetime.now()}")

    engine = create_db_engine()
    if not engine:
        logging.error("[MAIN] Cannot create database connection")
        sys.exit(1)

    try:
        # Get all item_type_ids
        item_type_ids = get_all_item_type_ids(engine)
        if not item_type_ids:
            logging.error("[MAIN] No item_type_ids found")
            sys.exit(1)

        # Train all item types
        successful_trainings = 0
        failed_trainings = 0
        total_trainings = len(item_type_ids)

        for i, item_type_id in enumerate(item_type_ids):
            logging.info(f"[MAIN] ==========================================")
            logging.info(f"[MAIN] Processing item_type_id={item_type_id} ({i + 1}/{total_trainings})")
            logging.info(f"[MAIN] Progress: {((i) / total_trainings * 100):.1f}%")

            try:
                if enhanced_train_pipeline(engine, item_type_id):
                    successful_trainings += 1
                    logging.info(f"[MAIN] ✅ SUCCESS: item_type_id={item_type_id}")
                    time.sleep(5)  # Chờ 5 giây trước khi xử lý item_type_id tiếp theo
                else:
                    failed_trainings += 1
                    logging.error(f"[MAIN] ❌ FAILED: item_type_id={item_type_id}")

            except Exception as e:
                failed_trainings += 1
                logging.error(f"[MAIN] ❌ EXCEPTION for item_type_id={item_type_id}: {e}")

            # Progress summary
            logging.info(f"[MAIN] Current status: {successful_trainings} success, {failed_trainings} failed")

        logging.info(f"[MAIN] ==========================================")
        logging.info(f"[MAIN] ==> Final Results:")
        logging.info(f"[MAIN] ✅ Successful: {successful_trainings}/{total_trainings}")
        logging.info(f"[MAIN] ❌ Failed: {failed_trainings}/{total_trainings}")
        logging.info(f"[MAIN] 📊 Success rate: {(successful_trainings/total_trainings*100):.1f}%")
        logging.info(f"[MAIN] ==> Training completed at {datetime.now()}")

        # Summary of created files
        logging.info(f"[MAIN] Generated files:")
        models_dir = "/app/models"
        if os.path.exists(models_dir):
            pattern_files = [f for f in os.listdir(models_dir) if f.startswith('enhanced_patterns_')]
            svd_files = [f for f in os.listdir(models_dir) if f.startswith('svd_model_')]
            logging.info(f"[MAIN] - Enhanced patterns: {len(pattern_files)} files")
            logging.info(f"[MAIN] - SVD models: {len(svd_files)} files")

    except Exception as e:
        logging.error(f"[MAIN] Training process failed: {e}")
    finally:
        if engine:
            engine.dispose()
        logging.info(f"[MAIN] ==> Training process ended at {datetime.now()}")
