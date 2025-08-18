from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import quote_plus
import joblib
import pandas as pd
from sqlalchemy import create_engine
import logging
import os
import json
from datetime import datetime
from surprise import Dataset, Reader
import google.generativeai as genai
from typing import Dict, List, Any
import time

# Cấu hình logging
logging.basicConfig(
    filename='/app/app.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

# Kích hoạt CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False
    }
})

# Thông tin kết nối DB
user = "thanhnha"
password = quote_plus("thanhnha05")
host = "192.168.0.140"
port = 3306
database = "quadra_ecommerce_db_final"

# Kết nối MySQL
engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{database}")

# Danh sách API key cho Gemini
GEMINI_API_KEYS = [
    "AIzaSyBxKbwnbu5J8OAGNzk26EWdicvAtv5tTK8",
    "AIzaSyCb6KrKiuo1N4YIR9_GaU1tVdXu2OySFmc",
    "AIzaSyCv1KMq_F8xW9JtFNzHnqRidPMROqaXhvs",
    "AIzaSyDKXI3MgHhe4TufLxr9BABNP3lEG4LLLCI",
    "AIzaSyB3fAWu_apwqqg8Y8xZz9BJn4b4yp15a2E",
    "AIzaSyAJylUMX44gqBLD5zxgLOmeuCOAr2PQRog",
    "AIzaSyCW1JbvmCQvrrHT8TfQ2Z7KUP0GoDP_pH4"
]
CURRENT_API_KEY_INDEX = 0
MAX_RETRIES = 3

def get_gemini_client():
    """Lấy client Gemini với API key hợp lệ, tự động chuyển key nếu lỗi"""
    global CURRENT_API_KEY_INDEX
    for attempt in range(MAX_RETRIES):
        api_key = GEMINI_API_KEYS[CURRENT_API_KEY_INDEX]
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            logging.info(f"[GEMINI] Using API key index {CURRENT_API_KEY_INDEX} (attempt {attempt + 1}/{MAX_RETRIES})")
            return model
        except Exception as e:
            logging.warning(f"[GEMINI] API key index {CURRENT_API_KEY_INDEX} failed (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            if "429" in str(e):  # Quota exceeded
                time.sleep(2 ** attempt)  # Exponential backoff
                CURRENT_API_KEY_INDEX = (CURRENT_API_KEY_INDEX + 1) % len(GEMINI_API_KEYS)
                if CURRENT_API_KEY_INDEX == 0 and attempt == MAX_RETRIES - 1:
                    logging.error("[GEMINI] All API keys failed after retries")
                    raise Exception("All Gemini API keys are invalid or exhausted")
            else:
                raise e
    raise Exception("Failed to get Gemini client after retries")

def ai_attribute_similarity_check(attr1_name, attr2_name):
    """Sử dụng AI để kiểm tra xem 2 attributes có tương tự không và xác định nhóm ngữ nghĩa"""
    if not attr1_name or not attr2_name:
        return False, "", attr1_name or "other", 0.0

    attr1_lower = attr1_name.lower().strip()
    attr2_lower = attr2_name.lower().strip()

    if attr1_lower == attr2_lower:
        try:
            model = get_gemini_client()
            prompt = f"""
Xác định nhóm ngữ nghĩa cho attribute:

ATTRIBUTE: "{attr1_name}"

QUY TẮC:
- Xác định nhóm ngữ nghĩa chính xác (color, size, material, brand, etc.)
- Không phân biệt tiếng Anh/Việt (size = kích thước, color = màu sắc)
- Không phân biệt viết hoa/thường

RETURN JSON:
{{
    "group": "nhóm ngữ nghĩa (color/size/material/brand/etc)",
    "confidence": 0.0-1.0
}}
"""
            response = model.generate_content(
                prompt,
                generation_config={"max_output_tokens": 100, "temperature": 0.1}
            )

            content = response.text.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]

            result = json.loads(content)
            return True, attr1_name, result.get('group', attr1_name), result.get('confidence', 1.0)

        except Exception as e:
            logging.error(f"AI group detection failed for {attr1_name}: {e}")
            return True, attr1_name, attr1_name, 0.5

    try:
        model = get_gemini_client()
        prompt = f"""
Kiểm tra 2 tên attribute có cùng ý nghĩa không:

ATTRIBUTE 1: "{attr1_name}"
ATTRIBUTE 2: "{attr2_name}"

QUY TẮC:
- Chỉ trả về TRUE nếu chắc chắn cùng ý nghĩa (ví dụ: "Màu Sắc" và "Color" là cùng nhóm color)
- Không phân biệt tiếng Anh/Việt (size = kích thước, color = màu sắc)
- Không phân biệt viết hoa/thường
- Xác định nhóm ngữ nghĩa chính xác (color, size, material, brand, etc.)
- Giữ nguyên tên gốc của attribute (KHÔNG gộp thành tên thống nhất)

RETURN JSON:
{{
    "is_similar": true/false,
    "group": "nhóm ngữ nghĩa (color/size/material/brand/etc)",
    "confidence": 0.0-1.0
}}
"""
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 150, "temperature": 0.1}
        )

        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]

        result = json.loads(content)
        return (
            result.get('is_similar', False),
            attr1_name,
            result.get('group', attr1_name),
            result.get('confidence', 0.0)
        )

    except Exception as e:
        logging.error(f"AI similarity check failed: {e}")
        return False, attr1_name, attr1_name, 0.5

def filter_values_by_group(values, group, attr_name=None):
    """Lọc values dựa trên nhóm ngữ nghĩa (chỉ dùng khi API hoạt động)"""
    if group == 'color':
        color_keywords = ['màu', 'color', 'hồng', 'trắng', 'đen', 'xám', 'xanh', 'vàng', 'đỏ', 'tím', 'cam']
        return [v for v in values if any(kw in v.lower() for kw in color_keywords)]
    elif group == 'size':
        size_keywords = ['s', 'm', 'l', 'xl', 'xxl', 'kích thước']
        return [v for v in values if any(kw in v.lower() for kw in size_keywords)]
    return values

def load_enhanced_patterns(item_type_id):
    """Load enhanced patterns từ training result"""
    try:
        patterns_path = f"/app/models/enhanced_patterns_{item_type_id}.json"
        if not os.path.exists(patterns_path):
            logging.warning(f"[LOAD] Enhanced patterns not found: {patterns_path}")
            return None

        with open(patterns_path, 'r', encoding='utf-8') as f:
            patterns = json.load(f)

        logging.info(f"[LOAD] Loaded enhanced patterns for item_type_id={item_type_id}")
        return patterns

    except Exception as e:
        logging.error(f"[LOAD] Failed to load enhanced patterns: {e}")
        return None

def ai_initial_attribute_suggestion(item_type_name, product_name):
    """Gợi ý attributes và values bằng AI khi không có file enhanced_patterns"""
    logging.info(f"[INITIAL] Generating initial attributes for {item_type_name}: {product_name}")

    try:
        model = get_gemini_client()
        prompt = f"""
Tìm kiếm và gợi ý attributes cho sản phẩm thương mại điện tử:

Sản phẩm: {product_name}
Danh mục: {item_type_name}

NHIỆM VỤ:
1. Kiểm tra xem sản phẩm "{product_name}" thuộc danh mục "{item_type_name}" có phổ biến trên các sàn TMĐT (Shopee, Lazada, Tiki, Amazon) không.
2. Nếu sản phẩm phổ biến và thường có các biến thể (attributes như color, size, material, brand, etc.), gợi ý 3-5 attributes với values phù hợp.
3. Nếu sản phẩm không phổ biến hoặc không cần phân loại (không có biến thể), trả về danh sách attributes rỗng và lý do.
4. Mỗi attribute phải có:
   - Tên gốc (KHÔNG gộp thành tên thống nhất).
   - Nhóm ngữ nghĩa (color, size, material, brand, etc.).
   - Danh sách values là chuỗi, không chứa ID.
5. Gán icon phù hợp (color: Palette, size: Ruler, material: Package, brand: Tag, other: UnknownIcon).
6. Đánh giá độ phổ biến (popularity_score) từ 0.0-1.0 dựa trên tần suất xuất hiện trên các sàn TMĐT.

RETURN JSON:
{{
    "is_popular": true/false,
    "popularity_score": 0.0-1.0,
    "reason": "Lý do sản phẩm phổ biến hoặc không",
    "attributes": [
        {{
            "id": number,
            "name": "attribute_name",
            "group": "color/size/material/brand/etc",
            "icon": "<IconName className=\"h-4 w-4\" />",
            "values": ["value1", "value2", ...],
            "confidence": 0.0-1.0,
            "source": "ai_initial_suggestion"
        }}
    ]
}}
"""
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 2000, "temperature": 0.3}
        )

        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]

        result = json.loads(content)
        logging.info(f"[INITIAL] Generated {len(result.get('attributes', []))} initial attributes (popular: {result.get('is_popular', False)})")
        return result

    except Exception as e:
        logging.error(f"[INITIAL] AI initial suggestion failed: {e}")
        return {
            'is_popular': False,
            'popularity_score': 0.0,
            'reason': 'AI suggestion failed due to error',
            'attributes': []
        }

def evaluate_data_quality(patterns, product_name):
    """Đánh giá chất lượng data và quyết định có cần external search không"""
    if not patterns or not patterns.get('enhanced_attributes'):
        return {
            'overall_score': 0.0,
            'needs_external_search': True,
            'reasons': ['No enhanced patterns available']
        }

    quality = patterns.get('data_quality', {})
    overall_score = quality.get('overall_score', 0.0)
    attribute_count = len(patterns.get('enhanced_attributes', []))

    needs_external = False
    reasons = []

    if overall_score < 0.7:
        needs_external = True
        reasons.append('Low data quality score')

    if attribute_count < 2:
        needs_external = True
        reasons.append('Insufficient attributes')

    total_usage = sum(
        sum(val.get('usage_count', 0) for val in attr.get('values', []))
        for attr in patterns.get('enhanced_attributes', [])
    )

    if total_usage < 50:
        needs_external = True
        reasons.append('Low usage data')

    return {
        'overall_score': overall_score,
        'needs_external_search': needs_external,
        'reasons': reasons,
        'attribute_count': attribute_count,
        'total_usage': total_usage
    }

def external_market_search(item_type_name, product_name, existing_patterns):
    """Tìm kiếm external market data để bổ sung bằng Gemini"""
    logging.info(f"[EXTERNAL] Searching market data for {item_type_name}: {product_name}")

    try:
        existing_summary = []
        if existing_patterns and existing_patterns.get('enhanced_attributes'):
            for attr in existing_patterns['enhanced_attributes']:
                existing_summary.append({
                    'name': attr.get('name', ''),
                    'values': [v.get('value', '') for v in attr.get('values', [])]
                })

        prompt = f"""
Tìm kiếm và phân tích thông tin sản phẩm từ các sàn thương mại điện tử:

Sản phẩm: {product_name}
Danh mục: {item_type_name}

DỮ LIỆU CÓ SẴN:
{json.dumps(existing_summary, ensure_ascii=False)}

NHIỆM VỤ:
1. Phân tích sản phẩm "{product_name}" thuộc danh mục "{item_type_name}"
2. Tham khảo các sàn TMDT lớn (Shopee, Lazada, Tiki, Amazon)
3. Tìm các attributes/values phổ biến mà hệ thống chưa có
4. Đề xuất attributes bổ sung hoặc cải thiện dữ liệu hiện có
5. Gán nhóm ngữ nghĩa (color, size, material, brand, etc) cho mỗi attribute
6. Giữ toàn bộ values, không giới hạn số lượng
7. Giữ nguyên tên gốc của attribute (KHÔNG gộp thành tên thống nhất)

RETURN JSON FORMAT:
{{
    "found_products": [
        {{
            "name": "tên sản phẩm tương tự",
            "source": "shopee|lazada|tiki|amazon",
            "attributes": [
                {{
                    "name": "attribute_name",
                    "group": "color/size/material/brand/etc",
                    "values": ["value1", "value2"]
                }}
            ]
        }}
    ],
    "market_standards": [
        {{
            "name": "attribute_name",
            "group": "color/size/material/brand/etc",
            "values": ["standard_value1", "standard_value2"],
            "popularity": 0.0-1.0,
            "source": "market_analysis"
        }}
    ],
    "recommendations": ["specific recommendations"]
}}
"""
        model = get_gemini_client()
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 2000, "temperature": 0.3}
        )

        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]

        external_data = json.loads(content)
        logging.info(f"[EXTERNAL] Found {len(external_data.get('market_standards', []))} market standards")
        return external_data

    except Exception as e:
        logging.error(f"[EXTERNAL] External search failed: {e}")
        return {
            'found_products': [],
            'market_standards': [],
            'recommendations': ['External search unavailable']
        }

def intelligent_merge_data(enhanced_patterns, external_data, product_name):
    """Merge enhanced patterns với external data, sử dụng AI để nhóm và dịch thuật"""
    logging.info(f"[MERGE] Merging enhanced patterns with external data for {product_name}")

    try:
        # Nhóm các thuộc tính theo group
        group_attributes = {}
        attr_id_counter = 1  # Đếm ID cho thuộc tính
        original_values = {}  # Lưu values gốc của mỗi thuộc tính

        # Bước 1: Xử lý enhanced patterns
        if enhanced_patterns and enhanced_patterns.get('enhanced_attributes'):
            for attr in enhanced_patterns['enhanced_attributes']:
                attr_name = attr.get('name', '')
                values = [v.get('value', '') for v in attr.get('values', [])]
                usage_counts = [v.get('usage_count', 0) for v in attr.get('values', [])]

                # Lưu values gốc
                original_values[attr_name] = values

                # Xác định nhóm ngữ nghĩa bằng AI
                _, _, group, confidence = ai_attribute_similarity_check(attr_name, attr_name)
                group = group or attr_name

                if group not in group_attributes:
                    group_attributes[group] = {
                        'attributes': [],
                        'values': set(),
                        'usage_counts': []
                    }

                # Lọc values phù hợp với nhóm (chỉ khi API hoạt động)
                filtered_values = filter_values_by_group(values, group, attr_name) if group in ['color', 'size'] else values

                # Kiểm tra xem attribute có tương tự với attribute hiện có trong nhóm không
                existing_attr = None
                for existing in group_attributes[group]['attributes']:
                    is_similar, _, _, confidence = ai_attribute_similarity_check(existing['name'], attr_name)
                    if is_similar and confidence > 0.7:
                        existing_attr = existing
                        break

                if existing_attr:
                    existing_attr['source'] = 'merged'
                    existing_attr['confidence'] = max(existing_attr['confidence'], attr.get('priority_score', 0.5))
                    logging.info(f"[MERGE] Updated attribute '{attr_name}' in group '{group}'")
                else:
                    group_attributes[group]['attributes'].append({
                        'id': attr_id_counter,
                        'name': attr_name,
                        'group': group,
                        'icon': '<UnknownIcon className="h-4 w-4" />',
                        'source': 'enhanced_training',
                        'confidence': attr.get('priority_score', 0.5),
                        'usage_counts': usage_counts,
                        'original_values': values
                    })
                    attr_id_counter += 1
                    logging.info(f"[MERGE] Added new attribute '{attr_name}' in group '{group}'")

                group_attributes[group]['values'].update(filtered_values)
                group_attributes[group]['usage_counts'].extend(usage_counts[:len(filtered_values)])

        # Bước 2: Xử lý external data
        if external_data and external_data.get('market_standards'):
            for market_attr in external_data['market_standards']:
                attr_name = market_attr.get('name', '')
                group = market_attr.get('group', attr_name)
                values = market_attr.get('values', [])
                popularity = market_attr.get('popularity', 0.0)

                # Lưu values gốc
                original_values[attr_name] = values

                # Xác định nhóm ngữ nghĩa bằng AI
                _, _, detected_group, confidence = ai_attribute_similarity_check(attr_name, attr_name)
                group = detected_group or group or attr_name

                if group not in group_attributes:
                    group_attributes[group] = {
                        'attributes': [],
                        'values': set(),
                        'usage_counts': []
                    }

                # Lọc values phù hợp với nhóm (chỉ khi API hoạt động)
                filtered_values = filter_values_by_group(values, group, attr_name) if group in ['color', 'size'] else values

                # Kiểm tra xem attribute có tương tự với attribute hiện có trong nhóm không
                existing_attr = None
                for existing in group_attributes[group]['attributes']:
                    is_similar, _, _, confidence = ai_attribute_similarity_check(existing['name'], attr_name)
                    if is_similar and confidence > 0.7:
                        existing_attr = existing
                        break

                if existing_attr:
                    existing_attr['source'] = 'merged'
                    existing_attr['confidence'] = max(existing_attr['confidence'], popularity)
                    logging.info(f"[MERGE] Updated attribute '{attr_name}' in group '{group}'")
                else:
                    group_attributes[group]['attributes'].append({
                        'id': attr_id_counter,
                        'name': attr_name,
                        'group': group,
                        'icon': '<UnknownIcon className="h-4 w-4" />',
                        'source': 'external_search',
                        'confidence': popularity,
                        'usage_counts': [0] * len(filtered_values),
                        'original_values': values
                    })
                    attr_id_counter += 1
                    logging.info(f"[MERGE] Added new attribute '{attr_name}' in group '{group}'")

                group_attributes[group]['values'].update(filtered_values)
                group_attributes[group]['usage_counts'].extend([0] * len(filtered_values))

        # Bước 3: Gán icon và hợp nhất values cho các thuộc tính trong cùng nhóm
        icon_map = {
            'color': '<Palette className="h-4 w-4" />',
            'size': '<Ruler className="h-4 w-4" />',
            'material': '<Package className="h-4 w-4" />',
            'brand': '<Tag className="h-4 w-4" />'
        }
        merged_attributes = []
        for group, data in group_attributes.items():
            values_list = sorted(list(data['values']))
            for attr in data['attributes']:
                attr['icon'] = icon_map.get(group.lower(), '<UnknownIcon className="h-4 w-4" />')
                attr['values'] = values_list
                merged_attributes.append(attr)

        return {
            'merged_attributes': merged_attributes,
            'external_recommendations': external_data.get('recommendations', []) if external_data else [],
            'data_sources': ['enhanced_training', 'external_search'] if external_data else ['enhanced_training'],
            'original_values': original_values
        }

    except Exception as e:
        logging.error(f"[MERGE] Failed to merge data: {e}")
        return {
            'merged_attributes': [],
            'external_recommendations': [],
            'data_sources': ['enhanced_training'],
            'original_values': {}
        }

def ai_final_selection(merged_data, item_type_name, product_name, enhanced_patterns=None):
    """AI thực hiện selection cuối cùng dựa trên merged data"""
    logging.info(f"[SELECTION] AI selecting final attributes for {product_name}")

    try:
        attributes_summary = []
        for attr in merged_data.get('merged_attributes', []):
            attributes_summary.append({
                'id': attr.get('id', 0),
                'name': attr.get('name', ''),
                'group': attr.get('group', 'other'),
                'values': attr.get('values', []),
                'confidence': attr.get('confidence', 0.0),
                'source': attr.get('source', 'unknown'),
                'usage_counts': attr.get('usage_counts', [])
            })

        prompt = f"""
Chọn attributes tối ưu cho sản phẩm thương mại điện tử:

Sản phẩm: {product_name}
Danh mục: {item_type_name}

MERGED DATA:
{json.dumps(attributes_summary, ensure_ascii=False, indent=2)}

EXTERNAL RECOMMENDATIONS:
{json.dumps(merged_data.get('external_recommendations', []), ensure_ascii=False)}

NHIỆM VỤ:
1. Chọn 4-5 attributes quan trọng nhất
2. Giữ các attributes riêng biệt, không gộp ngay cả khi cùng nhóm
3. Các attributes trong cùng nhóm (color, size, etc) phải có danh sách values giống nhau
4. Values là danh sách chuỗi, không chứa ID, và giữ toàn bộ values (không giới hạn số lượng)
5. Ưu tiên attributes có confidence cao và usage_counts lớn
6. Gán icon phù hợp với nhóm (color: Palette, size: Ruler, material: Package, brand: Tag)
7. Giữ nguyên tên gốc của mỗi attribute (KHÔNG gộp thành tên thống nhất)

RETURN JSON:
{{
    "attributes": [
        {{
            "id": number,
            "name": "attribute_name",
            "group": "color/size/material/brand/etc",
            "icon": "<IconName className=\"h-4 w-4\" />",
            "values": ["value1", "value2", ...],
            "confidence": 0.0-1.0,
            "source": "source_info",
            "reasoning": "why_selected"
        }}
    ],
    "suggested_variants": ["combination_examples"],
    "overall_confidence": 0.0-1.0
}}
"""
        model = get_gemini_client()
        response = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 3000, "temperature": 0.2}
        )

        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]

        final_selection = json.loads(content)
        logging.info(f"[SELECTION] Selected {len(final_selection.get('attributes', []))} final attributes")
        return final_selection

    except Exception as e:
        logging.error(f"[SELECTION] Final selection failed: {e}")
        # Fallback sử dụng dữ liệu gốc từ enhanced_patterns mà không lọc
        fallback_attributes = []
        original_values = merged_data.get('original_values', {})
        if enhanced_patterns and enhanced_patterns.get('enhanced_attributes'):
            for attr in enhanced_patterns['enhanced_attributes'][:4]:
                attr_name = attr.get('name', '')
                values = original_values.get(attr_name, [v.get('value', '') for v in attr.get('values', [])])
                # Sử dụng name làm group trong fallback
                group = attr_name
                icon = '<UnknownIcon className="h-4 w-4" />'
                # Gán icon nếu name khớp với color hoặc size
                if 'màu' in attr_name.lower() or 'color' in attr_name.lower():
                    icon = '<Palette className="h-4 w-4" />'
                elif 'size' in attr_name.lower() or 'kích thước' in attr_name.lower():
                    icon = '<Ruler className="h-4 w-4" />'

                fallback_attributes.append({
                    'id': attr.get('id', 0) or len(fallback_attributes) + 1,
                    'name': attr_name,
                    'group': group,
                    'icon': icon,
                    'values': values,  # Giữ nguyên values gốc
                    'confidence': attr.get('priority_score', 0.5),
                    'source': 'fallback_enhanced_training',
                    'reasoning': 'Fallback selection using original values due to AI error'
                })

        return {
            'attributes': fallback_attributes,
            'suggested_variants': [],
            'overall_confidence': 0.5
        }

def enhanced_recommendation_pipeline(item_type_id, product_name):
    """Complete recommendation pipeline với enhanced patterns hoặc AI suggestion"""
    start_time = datetime.now()
    logging.info(f"[PIPELINE] Starting enhanced recommendation for item_type_id={item_type_id}, product='{product_name}'")

    try:
        item_type_name = get_item_type_name(item_type_id)
        enhanced_patterns = load_enhanced_patterns(item_type_id)

        # Nếu không có file enhanced_patterns, sử dụng AI để gợi ý attributes
        if enhanced_patterns is None:
            logging.info(f"[PIPELINE] No enhanced patterns found, generating initial attributes")
            initial_suggestion = ai_initial_attribute_suggestion(item_type_name, product_name)
            if not initial_suggestion.get('is_popular', False):
                logging.info(f"[PIPELINE] Product not popular: {initial_suggestion.get('reason', 'Unknown')}")
                return {
                    'success': True,
                    'attributes': [],
                    'suggested_variants': [],
                    'metadata': {
                        'item_type_id': item_type_id,
                        'item_type_name': item_type_name,
                        'product_name': product_name,
                        'data_quality_score': 0.0,
                        'external_search_used': True,
                        'external_search_reasons': ['No enhanced patterns', initial_suggestion.get('reason', 'Product not popular')],
                        'overall_confidence': initial_suggestion.get('popularity_score', 0.0),
                        'processing_time_seconds': round((datetime.now() - start_time).total_seconds(), 2),
                        'data_sources': ['ai_initial_suggestion']
                    }
                }

            # Tạo enhanced_patterns từ initial_suggestion
            enhanced_patterns = {
                'enhanced_attributes': initial_suggestion.get('attributes', []),
                'data_quality': {
                    'overall_score': initial_suggestion.get('popularity_score', 0.5)
                }
            }

        quality_assessment = evaluate_data_quality(enhanced_patterns, product_name)

        external_data = None
        if quality_assessment['needs_external_search']:
            logging.info(f"[PIPELINE] External search needed: {quality_assessment['reasons']}")
            external_data = external_market_search(item_type_name, product_name, enhanced_patterns)

        merged_data = intelligent_merge_data(enhanced_patterns, external_data, product_name)
        final_suggestions = ai_final_selection(merged_data, item_type_name, product_name, enhanced_patterns)

        processing_time = (datetime.now() - start_time).total_seconds()
        response = {
            'success': True,
            'attributes': final_suggestions.get('attributes', []),
            'suggested_variants': final_suggestions.get('suggested_variants', []),
            'metadata': {
                'item_type_id': item_type_id,
                'item_type_name': item_type_name,
                'product_name': product_name,
                'data_quality_score': quality_assessment['overall_score'],
                'external_search_used': quality_assessment['needs_external_search'],
                'external_search_reasons': quality_assessment['reasons'],
                'overall_confidence': final_suggestions.get('overall_confidence', 0.0),
                'processing_time_seconds': round(processing_time, 2),
                'data_sources': merged_data.get('data_sources', [])
            }
        }

        logging.info(f"[PIPELINE] Recommendation completed in {processing_time:.2f}s")
        return response

    except Exception as e:
        logging.error(f"[PIPELINE] Recommendation pipeline failed: {e}")
        return fallback_basic_recommendation(item_type_id, product_name, start_time)

def fallback_basic_recommendation(item_type_id, product_name, start_time):
    """Fallback khi enhanced pipeline fail"""
    logging.info(f"[FALLBACK] Using basic recommendation for item_type_id={item_type_id}")

    try:
        item_type_name = get_item_type_name(item_type_id)
        initial_suggestion = ai_initial_attribute_suggestion(item_type_name, product_name)
        if not initial_suggestion.get('is_popular', False):
            logging.info(f"[FALLBACK] Product not popular: {initial_suggestion.get('reason', 'Unknown')}")
            return {
                'success': True,
                'attributes': [],
                'suggested_variants': [],
                'metadata': {
                    'item_type_id': item_type_id,
                    'item_type_name': item_type_name,
                    'product_name': product_name,
                    'fallback_mode': True,
                    'processing_time_seconds': round((datetime.now() - start_time).total_seconds(), 2)
                }
            }

        processing_time = (datetime.now() - start_time).total_seconds()
        return {
            'success': True,
            'attributes': initial_suggestion.get('attributes', []),
            'suggested_variants': [],
            'metadata': {
                'item_type_id': item_type_id,
                'item_type_name': item_type_name,
                'product_name': product_name,
                'fallback_mode': True,
                'processing_time_seconds': round(processing_time, 2),
                'data_sources': ['ai_initial_suggestion']
            }
        }

    except Exception as e:
        logging.error(f"[FALLBACK] AI fallback failed: {e}")
        return {
            'success': False,
            'error': 'All recommendation methods failed',
            'attributes': []
        }

def get_item_type_name(item_type_id):
    """Get item_type name from database"""
    try:
        query = "SELECT name FROM item_types WHERE id = %s"
        result = pd.read_sql(query, engine, params=(item_type_id,))
        if not result.empty:
            return result.iloc[0]['name']
        return f"item_type_{item_type_id}"
    except Exception as e:
        logging.error(f"Failed to get item_type name: {e}")
        return f"item_type_{item_type_id}"

# API Endpoints
@app.route('/suggest', methods=['POST'])
def suggest():
    """Main suggestion endpoint"""
    try:
        data = request.get_json()
        item_type_id = data.get('item_type_id')
        product_name = data.get('product_name')

        if not item_type_id or not product_name:
            return jsonify({
                "success": False,
                "error": "Thiếu item_type_id hoặc product_name"
            }), 400

        suggestions = enhanced_recommendation_pipeline(item_type_id, product_name)
        return jsonify(suggestions)

    except Exception as e:
        logging.error(f"Lỗi endpoint API: {e}")
        return jsonify({
            "success": False,
            "error": "Lỗi server nội bộ"
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint kiểm tra sức khỏe"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == "__main__":
    logging.info("[MAIN] Khởi động dịch vụ đề xuất nâng cao")
    app.run(host='0.0.0.0', port=5000, debug=True)