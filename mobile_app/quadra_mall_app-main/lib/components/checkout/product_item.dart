import 'dart:ffi';

import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/utils/formater.dart';

class ProductItem extends StatelessWidget {
  final String name;
  final double price;
  final String imageUrl;
  final num quantity;
  final VoidCallback? onTap;

  const ProductItem({
    required this.name,
    required this.price,
    required this.imageUrl,
    required this.quantity,
    this.onTap,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap, // Xử lý sự kiện nhấn
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hình ảnh sản phẩm
            ClipRRect(
              borderRadius: BorderRadius.circular(8.0),
              child: Image.asset(
                imageUrl,
                width: 60,
                height: 60,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 60,
                    height: 60,
                    color: Colors.grey[300],
                    child: Icon(Icons.broken_image, color: Colors.grey),
                  );
                },
              ),
            ),
            SizedBox(width: 12),
            // Tên sản phẩm và số lượng
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(fontSize: 11),
                    overflow: TextOverflow.ellipsis, // Hiển thị ... nếu tên quá dài
                    maxLines: 2, // Giới hạn tối đa 2 dòng
                  ),
                  SizedBox(height: 4),
                  Text(
                    'x$quantity',
                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            SizedBox(width: 12),
            // Giá sản phẩm
            Flexible(
              flex: 2,
              child: Text(
                Formatter.formatCurrencyWithSymbol(price),
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
      ),
    );
  }
}