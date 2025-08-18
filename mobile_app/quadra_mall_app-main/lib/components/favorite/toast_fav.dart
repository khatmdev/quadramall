import 'package:overlay_support/overlay_support.dart';
import 'package:flutter/material.dart';

void showFavToast({required bool isFav}) {
  showSimpleNotification(
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), // Padding gọn gàng
      decoration: BoxDecoration(
        color: isFav ? Colors.green.withAlpha(200) : Colors.grey.withAlpha(200), // Nền mờ
        borderRadius: BorderRadius.circular(12), // Bo góc mềm mại
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(50),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min, // Giới hạn kích thước theo nội dung
        children: [
          Icon(
            isFav ? Icons.favorite : Icons.heart_broken_outlined,
            color: isFav ? Colors.red : Colors.white,
            size: 20, // Kích thước biểu tượng nhỏ hơn
          ),
          const SizedBox(width: 8),
          Text(
            isFav ? "Đã thêm vào mục yêu thích" : "Đã xóa khỏi mục yêu thích",
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14, // Cỡ chữ nhỏ gọn
            ),
          ),
        ],
      ),
    ),
    position: NotificationPosition.bottom, // Xuất hiện ở dưới cùng
    background: Colors.transparent, // Nền trong suốt để Container tự xử lý
    duration: const Duration(seconds: 2),
    slideDismissDirection: DismissDirection.vertical, // Vuốt dọc để tắt
  );
}
