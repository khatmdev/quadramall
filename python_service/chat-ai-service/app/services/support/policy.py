"""
Policy Support Service - Handles policy-related queries
"""
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class PolicySupportService:
    """
    Service for handling policy-related queries
    """

    def __init__(self):
        self.policies = {
            "return": {
                "title": "Chính sách đổi trả",
                "content": """
• Thời gian đổi trả: 7 ngày kể từ ngày nhận hàng
• Sản phẩm phải còn nguyên vẹn, chưa sử dụng, còn tem niêm phong
• Có hóa đơn mua hàng và phiếu bảo hành (nếu có)
• Không áp dụng với sản phẩm đã qua sử dụng hoặc có dấu hiệu hư hỏng do người dùng
• Phí vận chuyển đổi trả do khách hàng chi trả (trừ trường hợp lỗi từ shop)
• Sản phẩm sale/khuyến mãi không áp dụng đổi trả
                """,
                "keywords": ["đổi trả", "hoàn trả", "trả hàng", "đổi hàng", "return", "exchange", "refund"]
            },
            "warranty": {
                "title": "Chính sách bảo hành",
                "content": """
• Bảo hành chính hãng theo quy định nhà sản xuất
• Thời gian bảo hành từ 6 tháng đến 24 tháng tùy sản phẩm
• Bảo hành miễn phí lỗi do nhà sản xuất
• Không bảo hành: lỗi do người dùng, rơi vỡ, ngấm nước, cháy nổ
• Trung tâm bảo hành toàn quốc
• Hỗ trợ sửa chữa có phí sau thời gian bảo hành
                """,
                "keywords": ["bảo hành", "warranty", "sửa chữa", "lỗi sản phẩm", "guarantee", "repair"]
            },
            "shipping": {
                "title": "Chính sách vận chuyển",
                "content": """
• Miễn phí vận chuyển đơn hàng từ 500.000đ
• Giao hàng nhanh trong 1-3 ngày (nội thành)
• Giao hàng toàn quốc, miền núi 3-7 ngày
• Kiểm tra hàng trước khi thanh toán
• Hỗ trợ giao hàng tận nơi
• Đóng gói cẩn thận, bảo vệ sản phẩm
                """,
                "keywords": ["giao hàng", "vận chuyển", "shipping", "delivery", "phí ship", "phí giao hàng"]
            },
            "payment": {
                "title": "Chính sách thanh toán",
                "content": """
• Thanh toán khi nhận hàng (COD)
• Thanh toán online qua thẻ ngân hàng (ATM, Visa, Mastercard)
• Chuyển khoản ngân hàng
• Ví điện tử: MoMo, ZaloPay, ShopeePay, VNPay
• Trả góp 0% lãi suất cho đơn hàng từ 3 triệu
• Hỗ trợ trả góp qua thẻ tín dụng
                """,
                "keywords": ["thanh toán", "payment", "trả tiền", "cod", "trả góp", "installment", "credit"]
            },
            "privacy": {
                "title": "Chính sách bảo mật",
                "content": """
• Bảo mật thông tin cá nhân khách hàng theo luật pháp Việt Nam
• Không chia sẻ thông tin với bên thứ 3 khi chưa có sự đồng ý
• Mã hóa dữ liệu thanh toán và thông tin nhạy cảm
• Tuân thủ luật bảo vệ dữ liệu cá nhân
• Quyền yêu cầu xóa dữ liệu cá nhân
• Sử dụng cookie để cải thiện trải nghiệm
                """,
                "keywords": ["bảo mật", "privacy", "thông tin cá nhân", "dữ liệu", "security", "gdpr"]
            }
        }

        self.contact_info = {
            "hotline": "1900-xxx-xxx",
            "email": "support@example.com",
            "working_hours": "8:00 - 22:00 (Thứ 2 - CN)",
            "response_time": "Trong vòng 24 giờ"
        }

        logger.info("✅ PolicySupportService initialized")

    async def handle_query(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Handle policy-related query
        """
        try:
            # Find relevant policy
            relevant_policy = self._find_relevant_policy(message)

            if relevant_policy:
                answer = self._generate_policy_response(message, relevant_policy)
                return {
                    "answer": answer,
                    "policy_type": relevant_policy["key"],
                    "policy_title": relevant_policy["data"]["title"],
                    "metadata": {
                        "has_policy": True,
                        "confidence": relevant_policy["score"]
                    }
                }
            else:
                answer = self._generate_general_policy_response(message)
                return {
                    "answer": answer,
                    "policy_type": "general",
                    "metadata": {
                        "has_policy": False,
                        "available_policies": list(self.policies.keys())
                    }
                }

        except Exception as e:
            logger.error(f"Policy query handling error: {e}")
            return {
                "answer": "Xin lỗi, có lỗi khi xử lý câu hỏi về chính sách. Vui lòng liên hệ hotline để được hỗ trợ.",
                "policy_type": "error",
                "metadata": {"error": str(e)}
            }

    def _find_relevant_policy(self, message: str) -> Optional[Dict[str, Any]]:
        """Find the most relevant policy for the message"""
        message_lower = message.lower()

        policy_scores = {}
        for policy_key, policy_data in self.policies.items():
            score = 0
            for keyword in policy_data["keywords"]:
                if keyword in message_lower:
                    score += 1

            if score > 0:
                policy_scores[policy_key] = score

        if policy_scores:
            best_policy_key = max(policy_scores, key=policy_scores.get)
            return {
                "key": best_policy_key,
                "data": self.policies[best_policy_key],
                "score": policy_scores[best_policy_key]
            }

        return None

    def _generate_policy_response(self, message: str, policy_info: Dict[str, Any]) -> str:
        """Generate response for specific policy"""
        policy_data = policy_info["data"]

        response = f"""**{policy_data['title']}**

{policy_data['content'].strip()}

**Thông tin liên hệ:**
• Hotline: {self.contact_info['hotline']} ({self.contact_info['working_hours']})
• Email: {self.contact_info['email']}

Bạn có cần thêm thông tin gì về chính sách này không?"""

        return response

    def _generate_general_policy_response(self, message: str) -> str:
        """Generate response when no specific policy found"""
        policies_list = [f"• {policy['title']}" for policy in self.policies.values()]

        response = f"""Chúng tôi có các chính sách sau để hỗ trợ khách hàng:

{chr(10).join(policies_list)}

**Thông tin liên hệ:**
• Hotline: {self.contact_info['hotline']} ({self.contact_info['working_hours']})
• Email: {self.contact_info['email']}

Bạn muốn biết chi tiết về chính sách nào? Hoặc có thể mô tả cụ thể vấn đề bạn gặp phải."""

        return response

    def get_all_policies(self) -> Dict[str, Any]:
        """Get all available policies"""
        return {
            "policies": self.policies,
            "contact_info": self.contact_info,
            "total_policies": len(self.policies)
        }

    def health_check(self) -> Dict[str, Any]:
        """Health check for policy service"""
        return {
            "status": "healthy",
            "policies_loaded": len(self.policies),
            "contact_info_available": bool(self.contact_info)
        }
