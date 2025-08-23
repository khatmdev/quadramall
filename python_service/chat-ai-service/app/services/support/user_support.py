"""
User Support Service - Handles user support queries
"""
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class UserSupportService:
    """
    Service for handling user support queries
    """

    def __init__(self):
        self.support_categories = {
            "account": {
                "name": "Tài khoản & Đăng nhập",
                "keywords": [
                    "tài khoản", "đăng nhập", "đăng ký", "account", "login", "register",
                    "mật khẩu", "password", "quên mật khẩu", "forgot password",
                    "email", "xác thực", "verification"
                ],
                "solutions": [
                    "Đặt lại mật khẩu qua email đăng ký",
                    "Kiểm tra thông tin đăng nhập chính xác (email/số điện thoại)",
                    "Xóa cache và cookies trình duyệt",
                    "Thử đăng nhập trên thiết bị khác",
                    "Kiểm tra email xác thực trong hộp thư spam",
                    "Liên hệ hotline nếu vẫn không thể truy cập"
                ],
                "urgent_indicators": ["không thể đăng nhập", "bị khóa tài khoản", "mất tài khoản"]
            },
            "order": {
                "name": "Đơn hàng & Thanh toán",
                "keywords": [
                    "đơn hàng", "order", "mua hàng", "thanh toán", "payment",
                    "hủy đơn", "cancel", "tracking", "theo dõi", "vận chuyển",
                    "hóa đơn", "invoice", "receipt", "cod", "chuyển khoản"
                ],
                "solutions": [
                    "Kiểm tra trạng thái đơn hàng trong tài khoản",
                    "Sử dụng mã tracking để theo dõi vận chuyển",
                    "Liên hệ shop để hủy/thay đổi đơn hàng (trong 1 giờ)",
                    "Kiểm tra email xác nhận đơn hàng",
                    "Thanh toán lại nếu giao dịch bị lỗi",
                    "Chụp ảnh màn hình lỗi thanh toán để được hỗ trợ"
                ],
                "urgent_indicators": ["đơn hàng bị lỗi", "thanh toán thất bại", "giao nhầm hàng"]
            },
            "technical": {
                "name": "Vấn đề kỹ thuật",
                "keywords": [
                    "lỗi", "error", "không hoạt động", "bug", "technical",
                    "website", "app", "ứng dụng", "loading", "chậm", "slow",
                    "không load", "crash", "đơ", "lag"
                ],
                "solutions": [
                    "Làm mới trang web (F5 hoặc Ctrl+R)",
                    "Kiểm tra kết nối internet",
                    "Xóa cache và cookies trình duyệt",
                    "Thử trên trình duyệt khác (Chrome, Firefox, Safari)",
                    "Cập nhật trình duyệt lên phiên bản mới nhất",
                    "Restart thiết bị và thử lại",
                    "Kiểm tra firewall/antivirus có chặn không"
                ],
                "urgent_indicators": ["không thể truy cập", "mất dữ liệu", "bảo mật"]
            },
            "product": {
                "name": "Sản phẩm & Dịch vụ",
                "keywords": [
                    "sản phẩm", "product", "thông tin", "mô tả", "hình ảnh",
                    "video", "đánh giá", "review", "so sánh", "compare",
                    "tư vấn", "tính năng", "thông số", "specifications"
                ],
                "solutions": [
                    "Xem chi tiết sản phẩm và thông số kỹ thuật",
                    "Đọc đánh giá và nhận xét từ khách hàng khác",
                    "Liên hệ shop để được tư vấn chi tiết",
                    "So sánh với sản phẩm tương tự",
                    "Xem video demo/unboxing nếu có",
                    "Hỏi trong phần Q&A của sản phẩm"
                ],
                "urgent_indicators": ["sản phẩm lỗi", "không đúng mô tả", "hàng giả"]
            }
        }

        self.contact_info = {
            "hotline": "1900-xxx-xxx",
            "email": "support@example.com",
            "working_hours": "8:00 - 22:00 (Thứ 2 - CN)",
            "response_time": "Trong vòng 24 giờ",
            "chat_support": "8:00 - 20:00 hàng ngày"
        }

        logger.info("✅ UserSupportService initialized")

    async def handle_query(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Handle user support query
        """
        try:
            # Analyze the support request
            analysis = self._analyze_support_request(message)

            if analysis["category"]:
                answer = self._generate_category_response(message, analysis)
                return {
                    "answer": answer,
                    "support_category": analysis["category"]["key"],
                    "is_urgent": analysis["is_urgent"],
                    "metadata": {
                        "category_name": analysis["category"]["data"]["name"],
                        "confidence": analysis["category"]["score"],
                        "solutions": analysis["category"]["data"]["solutions"]
                    }
                }
            else:
                answer = self._generate_general_support_response(message, analysis)
                return {
                    "answer": answer,
                    "support_category": "general",
                    "is_urgent": analysis["is_urgent"],
                    "metadata": {
                        "available_categories": list(self.support_categories.keys())
                    }
                }

        except Exception as e:
            logger.error(f"Support query handling error: {e}")
            return {
                "answer": "Xin lỗi, có lỗi khi xử lý yêu cầu hỗ trợ. Vui lòng liên hệ hotline để được hỗ trợ trực tiếp.",
                "support_category": "error",
                "is_urgent": True,
                "metadata": {"error": str(e)}
            }

    def _analyze_support_request(self, message: str) -> Dict[str, Any]:
        """Analyze support request to determine category and urgency"""
        message_lower = message.lower()

        # Find best matching category
        category_scores = {}
        for cat_key, cat_data in self.support_categories.items():
            score = 0
            for keyword in cat_data["keywords"]:
                if keyword in message_lower:
                    score += 1

            if score > 0:
                category_scores[cat_key] = score

        best_category = None
        if category_scores:
            best_category_key = max(category_scores, key=category_scores.get)
            best_category = {
                "key": best_category_key,
                "data": self.support_categories[best_category_key],
                "score": category_scores[best_category_key]
            }

        # Check urgency
        is_urgent = self._check_urgency(message_lower, best_category)

        return {
            "category": best_category,
            "is_urgent": is_urgent,
            "message": message
        }

    def _check_urgency(self, message_lower: str, category: Optional[Dict[str, Any]]) -> bool:
        """Check if the request is urgent"""
        # General urgent keywords
        urgent_keywords = [
            "khẩn cấp", "urgent", "gấp", "ngay lập tức", "critical",
            "không thể", "bị lỗi", "không hoạt động", "mất", "bị hack"
        ]

        # Check general urgent keywords
        if any(keyword in message_lower for keyword in urgent_keywords):
            return True

        # Check category-specific urgent indicators
        if category and "urgent_indicators" in category["data"]:
            for indicator in category["data"]["urgent_indicators"]:
                if indicator in message_lower:
                    return True

        return False

    def _generate_category_response(self, message: str, analysis: Dict[str, Any]) -> str:
        """Generate response for specific support category"""
        category = analysis["category"]
        is_urgent = analysis["is_urgent"]

        urgency_note = "🚨 Tôi hiểu đây là vấn đề cần xử lý gấp. " if is_urgent else ""

        solutions = category["data"]["solutions"]
        solutions_text = "\n".join([f"✅ {solution}" for solution in solutions])

        response = f"""{urgency_note}**Hỗ trợ về {category["data"]["name"]}**

Các bước bạn có thể thử:

{solutions_text}

**Nếu các cách trên không giải quyết được:**
{"📞 Vui lòng gọi ngay hotline " if is_urgent else "📞 Liên hệ hotline "}{self.contact_info['hotline']} ({self.contact_info['working_hours']})
📧 Email: {self.contact_info['email']}

Bạn có thể mô tả chi tiết hơn vấn đề đang gặp phải không?"""

        return response

    def _generate_general_support_response(self, message: str, analysis: Dict[str, Any]) -> str:
        """Generate response when no specific category found"""
        is_urgent = analysis["is_urgent"]

        urgency_note = "🚨 Tôi hiểu đây có thể là vấn đề cần xử lý gấp. " if is_urgent else ""

        categories_list = []
        for key, cat_data in self.support_categories.items():
            categories_list.append(f"• **{cat_data['name']}**: Hỗ trợ các vấn đề liên quan đến {key}")

        response = f"""{urgency_note}Tôi sẵn sàng hỗ trợ bạn! Chúng tôi có thể giúp bạn về:

{chr(10).join(categories_list)}

**Thông tin liên hệ:**
📞 Hotline: {self.contact_info['hotline']} ({self.contact_info['working_hours']})
📧 Email: {self.contact_info['email']}
💬 Chat hỗ trợ: {self.contact_info['chat_support']}

Bạn có thể mô tả cụ thể vấn đề cần hỗ trợ để tôi có thể giúp bạn tốt hơn không?"""

        return response

    def get_support_statistics(self) -> Dict[str, Any]:
        """Get support service statistics"""
        return {
            "categories": {
                key: {
                    "name": data["name"],
                    "keywords_count": len(data["keywords"]),
                    "solutions_count": len(data["solutions"])
                }
                for key, data in self.support_categories.items()
            },
            "total_categories": len(self.support_categories),
            "contact_info": self.contact_info
        }

    def health_check(self) -> Dict[str, Any]:
        """Health check for user support service"""
        return {
            "status": "healthy",
            "categories_loaded": len(self.support_categories),
            "contact_info_available": bool(self.contact_info),
            "total_keywords": sum(len(cat["keywords"]) for cat in self.support_categories.values()),
            "total_solutions": sum(len(cat["solutions"]) for cat in self.support_categories.values())
        }
