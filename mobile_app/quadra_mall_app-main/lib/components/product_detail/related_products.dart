import 'package:intl/intl.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../models/mock_data.dart';
import '../../utils/currency_formatter.dart';

class RelatedProducts extends StatefulWidget {
  const RelatedProducts({Key? key}) : super(key: key);

  @override
  State<RelatedProducts> createState() => _RelatedProductsState();
}

class _RelatedProductsState extends State<RelatedProducts> {
  // Danh sách ID sản phẩm đã được đánh dấu yêu thích
  final List<int> _favoriteProductIds = [];

  @override
  Widget build(BuildContext context) {
    // Lấy dữ liệu sản phẩm liên quan từ MockData
    final relatedProducts = MockData.relatedProducts;

    return Container(
      color: const Color(0xFFF5F7FA), // Màu nền xám nhạt
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min, // THÊM: Giới hạn kích thước Column
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Related Product',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                OutlinedButton(
                  onPressed: () {
                    // Xử lý khi người dùng bấm vào View Detail
                    debugPrint('View Detail pressed');
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.green),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: const Text(
                    'View Detail',
                    style: TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.68, // GIẢM từ 0.75 xuống 0.68 để tạo thêm không gian
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: relatedProducts.length,
            itemBuilder: (context, index) {
              final product = relatedProducts[index];
              final isFavorite = _favoriteProductIds.contains(product['id']);

              // Lấy thông tin cửa hàng từ store_id
              final store = MockData.stores.firstWhere(
                    (store) => store['id'] == product['store_id'],
                orElse: () => {'name': 'North Purwokerto'},
              );

              return _buildProductItem(
                product: product,
                storeName: store['name'] ?? 'North Purwokerto',
                isFavorite: isFavorite,
                onTap: () {
                  // Xử lý khi người dùng bấm vào sản phẩm
                  debugPrint('Tapped on product: ${product['name']}');
                },
                onFavoriteTap: () {
                  setState(() {
                    if (isFavorite) {
                      _favoriteProductIds.remove(product['id']);
                    } else {
                      _favoriteProductIds.add(product['id']);
                    }
                  });
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProductItem({
    required Map<String, dynamic> product,
    required String storeName,
    required bool isFavorite,
    required VoidCallback onTap,
    required VoidCallback onFavoriteTap,
  }) {
    // Lựa chọn hình ảnh mặc định dựa trên ID sản phẩm để tạo ảnh demo
    String imageUrl = product['thumbnail_url'];

    // Định dạng số lượng bán từ con số sang chuỗi có dấu phân cách
    String soldCount = NumberFormat('#,###', 'vi_VN')
        .format(product['sold_count'])
        .replaceAll(',', '.');

    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min, // THÊM: Giới hạn kích thước Column
        children: [
          // Image with favorite button
          Flexible( // THAY Stack bằng Flexible
            child: Stack(
              children: [
                // Product image
                Container(
                  height: 120, // GIẢM từ 140 xuống 120
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        // Fallback khi không tải được hình ảnh
                        // Tạo placeholder với màu phù hợp với ID sản phẩm
                        Color placeholderColor;
                        Widget placeholderIcon;

                        switch (product['id']) {
                          case 101: // Spy × Family T-shirt
                            placeholderColor = Colors.amber[100]!;
                            placeholderIcon = const Icon(Icons.person, size: 40, color: Colors.amber); // GIẢM size
                            break;
                          case 102: // Green Man Jacket
                            placeholderColor = Colors.green[100]!;
                            placeholderIcon = const Icon(Icons.travel_explore, size: 40, color: Colors.green);
                            break;
                          case 103: // Iphone 14 Pro Max
                            placeholderColor = Colors.grey[900]!;
                            placeholderIcon = const Icon(Icons.phone_iphone, size: 40, color: Colors.white);
                            break;
                          case 104: // Oversized Tshirt
                            placeholderColor = Colors.red[100]!;
                            placeholderIcon = const Icon(Icons.checkroom, size: 40, color: Colors.red);
                            break;
                          default:
                            placeholderColor = Colors.grey[300]!;
                            placeholderIcon = const Icon(Icons.image, size: 40, color: Colors.grey);
                        }

                        return Container(
                          color: placeholderColor,
                          child: Center(child: placeholderIcon),
                        );
                      },
                    ),
                  ),
                ),
                // Favorite button
                Positioned(
                  top: 6, // GIẢM từ 8 xuống 6
                  right: 6,
                  child: GestureDetector(
                    onTap: onFavoriteTap,
                    child: Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      padding: const EdgeInsets.all(4), // GIẢM từ 5 xuống 4
                      child: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: isFavorite ? Colors.red : Colors.black,
                        size: 18, // GIẢM từ 20 xuống 18
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6), // GIẢM từ 8 xuống 6

          // Product name - 2 dòng với ...
          Text(
            product['name'],
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 13, // GIẢM từ 14 xuống 13
            ),
          ),
          const SizedBox(height: 3), // GIẢM từ 4 xuống 3

          // Price
          CurrencyFormatter.buildRichText(
            product['price'],
            valueStyle: const TextStyle(
              fontSize: 15, // GIẢM từ 16 xuống 15
              color: Colors.green,
              fontWeight: FontWeight.bold,
            ),
            symbolStyle: const TextStyle(
              fontSize: 11, // GIẢM từ 12 xuống 11
              color: Colors.green,
              fontWeight: FontWeight.bold,
              decoration: TextDecoration.underline,
            ),
          ),
          const SizedBox(height: 3), // GIẢM từ 4 xuống 3

          // Store name
          Text(
            storeName,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 11, // GIẢM từ 12 xuống 11
            ),
            maxLines: 1, // THÊM: Giới hạn 1 dòng
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3), // GIẢM từ 4 xuống 3

          // Rating and sold count
          Row(
            children: [
              const Icon(Icons.star, color: Colors.red, size: 14), // GIẢM từ 16 xuống 14
              const SizedBox(width: 3), // GIẢM từ 4 xuống 3
              Text(
                product['rating'].toString(),
                style: const TextStyle(
                  fontSize: 11, // GIẢM từ 12 xuống 11
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 6), // GIẢM từ 8 xuống 6
              Expanded( // THÊM: Wrap với Expanded để tránh overflow
                child: Text(
                  '$soldCount Sold',
                  style: TextStyle(
                    fontSize: 11, // GIẢM từ 12 xuống 11
                    color: Colors.grey[600],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}