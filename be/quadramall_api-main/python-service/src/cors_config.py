# src/cors_config.py

from flask_cors import CORS

class CorsConfig:
    def __init__(self, app):
        self.app = app
        self.configure_cors()

    def configure_cors(self):
        # Cấu hình CORS cho phép tất cả các nguồn
        CORS(self.app, supports_credentials=True)

    def update_origins(self, endpoint, new_origins):
        """Cập nhật danh sách origin cho một endpoint cụ thể (tùy chọn)"""
        # Phương thức này có thể được giữ nguyên hoặc bỏ nếu không cần
        pass