"""
LLM Service - Fixed Intent Analysis
"""
import json
import logging
from typing import Dict, Any, Optional, List
import google.generativeai as genai
import openai

from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class LLMService:
    """
    Service for interacting with Large Language Models
    """

    def __init__(self):
        self.gemini_model = None
        self.openai_client = None
        self._initialize_models()
        logger.info("✅ LLMService initialized")

    def _initialize_models(self):
        """Initialize available LLM models"""
        # Initialize Google Gemini
        try:
            if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != 'your-google-api-key':
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("✅ Google Gemini initialized")
        except Exception as e:
            logger.warning(f"Gemini initialization failed: {e}")

        # Initialize OpenAI
        try:
            if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key':
                self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("✅ OpenAI initialized")
        except Exception as e:
            logger.warning(f"OpenAI initialization failed: {e}")

    async def analyze_intent(self, prompt: str) -> Dict[str, Any]:
        """
        Analyze user intent using AI with better fallback logic
        """
        try:
            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                try:
                    # Try to parse JSON response
                    result = json.loads(response.text.strip())
                    return result
                except json.JSONDecodeError:
                    logger.warning("Failed to parse Gemini JSON response, using fallback")
                    return self._extract_intent_from_text(response.text, prompt)

            elif self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
                try:
                    result = json.loads(response.choices[0].message.content.strip())
                    return result
                except json.JSONDecodeError:
                    logger.warning("Failed to parse OpenAI JSON response, using fallback")
                    return self._extract_intent_from_text(response.choices[0].message.content, prompt)
            else:
                # Use advanced fallback analysis
                return self._advanced_intent_analysis(prompt)

        except Exception as e:
            logger.error(f"Intent analysis error: {e}")
            return self._advanced_intent_analysis(prompt)

    def _extract_intent_from_text(self, response_text: str, original_prompt: str) -> Dict[str, Any]:
        """Extract intent from non-JSON AI response"""
        response_lower = response_text.lower()

        # Look for intent indicators in AI response
        if any(word in response_lower for word in ["product", "search", "find", "look for", "tìm", "sản phẩm"]):
            return {
                "type": "product_search",
                "confidence": 0.8,
                "category": "product",
                "keywords": ["product", "search"],
                "needs_context": True,
                "topic": "product"
            }
        elif any(word in response_lower for word in ["policy", "chính sách", "quy định"]):
            return {
                "type": "policy",
                "confidence": 0.8,
                "category": "policy",
                "keywords": ["policy"],
                "needs_context": False,
                "topic": "policy"
            }
        elif any(word in response_lower for word in ["support", "help", "hỗ trợ"]):
            return {
                "type": "support",
                "confidence": 0.8,
                "category": "support",
                "keywords": ["support"],
                "needs_context": False,
                "topic": "support"
            }
        else:
            # Default to analyzing the original prompt
            return self._advanced_intent_analysis(original_prompt)

    def _advanced_intent_analysis(self, prompt: str) -> Dict[str, Any]:
        """Advanced fallback intent analysis with better logic"""
        # Extract the actual user message from the prompt
        user_message = self._extract_user_message(prompt)
        message_lower = user_message.lower()

        logger.info(f"Analyzing intent for message: {user_message}")

        # Product search keywords (more comprehensive)
        product_keywords = [
            "tìm", "mua", "cần", "muốn", "xem", "có", "bán",
            "điện thoại", "phone", "iphone", "samsung", "laptop",
            "máy tính", "tv", "tivi", "tablet", "đồng hồ", "watch",
            "tai nghe", "headphone", "camera", "máy ảnh", "sản phẩm",
            "giá", "price", "bao nhiêu", "how much", "store", "shop"
        ]

        # Policy keywords
        policy_keywords = [
            "chính sách", "policy", "quy định", "điều khoản", "terms",
            "đổi trả", "return", "refund", "bảo hành", "warranty",
            "vận chuyển", "shipping", "thanh toán", "payment"
        ]

        # Support keywords
        support_keywords = [
            "hỗ trợ", "support", "help", "giúp", "làm sao", "how to",
            "tài khoản", "account", "đăng nhập", "login", "lỗi", "error",
            "không thể", "can't", "cannot", "vấn đề", "problem"
        ]

        # Greeting keywords
        greeting_keywords = [
            "xin chào", "hello", "hi", "chào", "hey", "good morning",
            "good afternoon", "good evening", "chào buổi"
        ]

        # Calculate scores
        product_score = sum(1 for keyword in product_keywords if keyword in message_lower)
        policy_score = sum(1 for keyword in policy_keywords if keyword in message_lower)
        support_score = sum(1 for keyword in support_keywords if keyword in message_lower)
        greeting_score = sum(1 for keyword in greeting_keywords if keyword in message_lower)

        logger.info(f"Intent scores - Product: {product_score}, Policy: {policy_score}, Support: {support_score}, Greeting: {greeting_score}")

        # Determine intent based on scores
        if product_score > 0 and product_score >= policy_score and product_score >= support_score:
            return {
                "type": "product_search",
                "confidence": min(0.9, 0.5 + product_score * 0.1),
                "category": "product",
                "keywords": [kw for kw in product_keywords if kw in message_lower],
                "needs_context": True,
                "topic": "product"
            }
        elif policy_score > 0 and policy_score > product_score and policy_score >= support_score:
            return {
                "type": "policy",
                "confidence": min(0.9, 0.5 + policy_score * 0.1),
                "category": "policy",
                "keywords": [kw for kw in policy_keywords if kw in message_lower],
                "needs_context": False,
                "topic": "policy"
            }
        elif support_score > 0 and support_score > product_score and support_score > policy_score:
            return {
                "type": "support",
                "confidence": min(0.9, 0.5 + support_score * 0.1),
                "category": "support",
                "keywords": [kw for kw in support_keywords if kw in message_lower],
                "needs_context": False,
                "topic": "support"
            }
        elif greeting_score > 0:
            return {
                "type": "general",
                "confidence": 0.8,
                "category": "greeting",
                "keywords": [kw for kw in greeting_keywords if kw in message_lower],
                "needs_context": False,
                "topic": "general"
            }
        else:
            # Default to general for unclear intent
            return {
                "type": "general",
                "confidence": 0.6,
                "category": "general",
                "keywords": message_lower.split()[:3],
                "needs_context": True,
                "topic": "general"
            }

    def _extract_user_message(self, prompt: str) -> str:
        """Extract the actual user message from the analysis prompt"""
        # Look for the user message in the prompt
        lines = prompt.split('\n')
        for line in lines:
            if 'Câu hỏi hiện tại:' in line or 'tin nhắn:' in line.lower():
                # Extract the message between quotes
                if '"' in line:
                    start = line.find('"') + 1
                    end = line.rfind('"')
                    if start > 0 and end > start:
                        return line[start:end]

        # If not found, return the whole prompt (fallback)
        return prompt

    async def generate_product_response(
        self,
        query: str,
        products: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate response for product search results
        """
        try:
            # Build context
            conversation_context = ""
            if context and context.get("recent_messages"):
                recent = context["recent_messages"][-2:]  # Last 2 messages
                context_parts = []
                for msg in recent:
                    role = "Người dùng" if msg["role"] == "user" else "AI"
                    context_parts.append(f"{role}: {msg['content'][:100]}...")
                conversation_context = "\n".join(context_parts)

            # Build product information
            product_info = []
            for i, product in enumerate(products[:3], 1):
                info_parts = [f"{i}. {product['name']}"]

                if product.get('min_price'):
                    if product['min_price'] == product.get('max_price'):
                        info_parts.append(f"Giá: {product['min_price']:,.0f}đ")
                    else:
                        info_parts.append(f"Giá: {product['min_price']:,.0f}đ - {product.get('max_price', 0):,.0f}đ")

                if product.get('category'):
                    info_parts.append(f"Danh mục: {product['category']}")

                if product.get('store'):
                    info_parts.append(f"Cửa hàng: {product['store']}")

                if product.get('total_stock', 0) > 0:
                    info_parts.append(f"Còn hàng: {product['total_stock']} sản phẩm")
                else:
                    info_parts.append("Hết hàng")

                product_info.append(" - ".join(info_parts))

            # Create prompt
            prompt = f"""
Bạn là chuyên gia tư vấn sản phẩm thân thiện và chuyên nghiệp.

Lịch sử trò chuyện gần đây:
{conversation_context}

Câu hỏi: "{query}"

Sản phẩm tìm thấy:
{chr(10).join(product_info)}

Hãy tư vấn chi tiết:
1. Thể hiện sự hiểu biết về nhu cầu
2. Giới thiệu sản phẩm phù hợp nhất
3. So sánh ưu điểm của từng sản phẩm
4. Đưa ra gợi ý dựa trên giá cả và tình trạng kho
5. Kết thúc bằng câu hỏi để tương tác

Giọng điệu: Thân thiện, chuyên nghiệp, hữu ích.
"""

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return response.text.strip()
            elif self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Bạn là chuyên gia tư vấn sản phẩm thân thiện."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                return response.choices[0].message.content.strip()
            else:
                return self._fallback_product_response(query, products)

        except Exception as e:
            logger.error(f"Product response generation error: {e}")
            return self._fallback_product_response(query, products)

    def _fallback_product_response(self, query: str, products: List[Dict[str, Any]]) -> str:
        """Fallback product response when AI is unavailable"""
        if not products:
            return f"Không tìm thấy sản phẩm phù hợp với '{query}'. Bạn có thể thử từ khóa khác không?"

        response_parts = [f"Tôi tìm thấy {len(products)} sản phẩm phù hợp với '{query}':"]

        for i, product in enumerate(products[:3], 1):
            parts = [f"{i}. {product['name']}"]

            if product.get('min_price'):
                parts.append(f"Giá: {product['min_price']:,.0f}đ")

            if product.get('store'):
                parts.append(f"Tại: {product['store']}")

            response_parts.append(" - ".join(parts))

        response_parts.append("Bạn muốn biết thêm thông tin về sản phẩm nào không?")

        return "\n".join(response_parts)

    async def generate_no_results_response(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate response when no products found
        """
        try:
            prompt = f"""
Khách hàng tìm kiếm: "{query}"
Kết quả: Không tìm thấy sản phẩm phù hợp.

Hãy tạo phản hồi thân thiện:
1. Thể hiện sự tiếc nuối
2. Đề xuất từ khóa tìm kiếm khác
3. Gợi ý danh mục sản phẩm phổ biến
4. Mời khách hàng mô tả rõ hơn nhu cầu
5. Khuyến khích tiếp tục tương tác

Giữ giọng điệu tích cực và hỗ trợ.
"""

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return response.text.strip()
            elif self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=500
                )
                return response.choices[0].message.content.strip()
            else:
                return f"""Xin lỗi, tôi không tìm thấy sản phẩm phù hợp với '{query}'.

Bạn có thể thử:
• Sử dụng từ khóa khác hoặc ngắn gọn hơn
• Mô tả rõ hơn về sản phẩm bạn cần
• Tìm theo danh mục: điện thoại, laptop, TV, tablet

Tôi sẵn sàng hỗ trợ bạn tìm đúng sản phẩm mong muốn!"""

        except Exception as e:
            logger.error(f"No results response error: {e}")
            return f"Không tìm thấy sản phẩm phù hợp với '{query}'. Bạn có thể thử từ khóa khác không?"

    async def generate_general_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate response for general queries
        """
        try:
            conversation_context = ""
            if context and context.get("recent_messages"):
                recent = context["recent_messages"][-2:]
                context_parts = []
                for msg in recent:
                    role = "Người dùng" if msg["role"] == "user" else "AI"
                    context_parts.append(f"{role}: {msg['content'][:100]}...")
                conversation_context = "\n".join(context_parts)

            prompt = f"""
Bạn là trợ lý AI thân thiện của sàn thương mại điện tử.

Lịch sử trò chuyện:
{conversation_context}

Tin nhắn: "{message}"

Hãy phản hồi:
1. Thân thiện và chuyên nghiệp
2. Hiểu và đáp ứng nhu cầu
3. Hướng dẫn cụ thể nếu cần
4. Gợi ý cách thức tương tác với hệ thống
5. Kết thúc bằng câu hỏi mở

Chức năng có sẵn:
- Tìm kiếm sản phẩm
- Hỗ trợ chính sách
- Trợ giúp tài khoản và đơn hàng
"""

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return response.text.strip()
            elif self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Bạn là trợ lý AI thân thiện của sàn thương mại điện tử."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=800
                )
                return response.choices[0].message.content.strip()
            else:
                return """Chào bạn! Tôi là trợ lý AI và sẵn sàng hỗ trợ bạn:

• Tìm kiếm sản phẩm
• Tư vấn về chính sách mua hàng
• Hỗ trợ tài khoản và đơn hàng
• Giải đáp thắc mắc

Bạn cần tôi hỗ trợ gì hôm nay?"""

        except Exception as e:
            logger.error(f"General response error: {e}")
            return "Tôi sẵn sàng hỗ trợ bạn. Bạn cần giúp đỡ gì?"

    async def health_check(self) -> Dict[str, Any]:
        """Health check for LLM service"""
        return {
            "status": "healthy" if (self.gemini_model or self.openai_client) else "degraded",
            "gemini_available": self.gemini_model is not None,
            "openai_available": self.openai_client is not None,
            "models_count": sum([
                1 if self.gemini_model else 0,
                1 if self.openai_client else 0
            ])
        }
