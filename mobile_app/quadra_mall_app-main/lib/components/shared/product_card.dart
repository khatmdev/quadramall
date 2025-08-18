import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/models/product.dart';
import 'package:quarda_mall_home_app/utils/formater.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final bool isGrid;
  final VoidCallback onFavPressed; // Callback để xử lý nhấn nút yêu thích

  const ProductCard({
    super.key,
    required this.product,
    this.isGrid = true,
    required this.onFavPressed, // Thêm callback
  });

  Widget image(String imageUrl) {
    if (imageUrl == '') {
      return Icon(Icons.image, size: 48, color: Colors.grey.shade400);
    }
    return Image.asset(imageUrl);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(12),
      ),
      child: isGrid ? _buildGridView() : _buildListView(),
    );
  }

  Widget _buildGridView() {
    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 180,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: Center(
                child: image(product.imageUrl),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    Formatter.formatCurrencyWithSymbol(product.price),
                    style: TextStyle(color: Colors.green.shade700, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.star, size: 16, color: Colors.amber.shade600),
                      const SizedBox(width: 4),
                      Text('${product.rating}'),
                      const SizedBox(width: 8),
                      Text(
                        '${product.soldCount} Đã bán',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.seller,
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        Positioned(
          top: 8,
          right: 8,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.white, // Nền trắng
              shape: BoxShape.circle, // Hình tròn
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.3), // Đổ bóng nhẹ để nổi bật
                  spreadRadius: 1,
                  blurRadius: 2,
                  offset: const Offset(0, 1), // Độ lệch bóng
                ),
              ],
            ),
            child: IconButton(
              icon: Icon(
                product.isFav ? Icons.favorite : Icons.favorite_border,
                color: product.isFav ? Colors.red : Colors.grey,
              ),
              onPressed: onFavPressed, // Gọi callback khi nhấn
              padding: EdgeInsets.zero, // Loại bỏ padding mặc định để vừa với Container
              constraints: const BoxConstraints(), // Loại bỏ ràng buộc kích thước mặc định
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildListView() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: image(product.imageUrl),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  Formatter.formatCurrencyWithSymbol(product.price),
                  style: TextStyle(color: Colors.green.shade700, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.star, size: 16, color: Colors.amber.shade600),
                    const SizedBox(width: 4),
                    Text('${product.rating}'),
                    const SizedBox(width: 8),
                    Text(
                      '${product.soldCount} Đã bán',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  product.seller,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white, // Nền trắng
            shape: BoxShape.circle, // Hình tròn
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.3), // Đổ bóng nhẹ để nổi bật
                spreadRadius: 1,
                blurRadius: 2,
                offset: const Offset(0, 1), // Độ lệch bóng
              ),
            ],
          ),
          child: IconButton(
            icon: Icon(
              product.isFav ? Icons.favorite : Icons.favorite_border,
              color: product.isFav ? Colors.red : Colors.grey,
            ),
            onPressed: onFavPressed, // Gọi callback khi nhấn
            padding: EdgeInsets.zero, // Loại bỏ padding mặc định để vừa với Container
            constraints: const BoxConstraints(), // Loại bỏ ràng buộc kích thước mặc định
          ),
        ),
      ],
    );
  }
}