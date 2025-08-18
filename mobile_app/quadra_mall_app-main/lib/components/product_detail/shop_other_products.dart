import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/mock_data.dart';
import '../../utils/currency_formatter.dart';

class ShopOtherProducts extends StatefulWidget {
  final Map<String, dynamic> store;

  const ShopOtherProducts({
    Key? key,
    required this.store,
  }) : super(key: key);

  @override
  State<ShopOtherProducts> createState() => _ShopOtherProductsState();
}

class _ShopOtherProductsState extends State<ShopOtherProducts> {
  final ScrollController _scrollController = ScrollController();
  final List<String> _favoriteProductIds = [];

  @override
  void initState() {
    super.initState();
    // Thêm listener để cập nhật khi ScrollController thay đổi
    _scrollController.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Lấy sản phẩm của shop (filter theo store_id)
    final shopProducts = (MockData.products ?? [])
        .where((product) => product['store_id'] == widget.store['id'])
        .toList();

    // Thêm sản phẩm liên quan (relatedProducts) nhưng chỉ lấy những sản phẩm có store_id khớp
    final relatedShopProducts = (MockData.relatedProducts ?? [])
        .where((product) => product['store_id'] == widget.store['id'])
        .toList();
    final allShopProducts = [...shopProducts, ...relatedShopProducts.take(6)];

    if (allShopProducts.isEmpty) {
      return Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: const Center(
          child: Text(
            'Không có sản phẩm nào từ shop này.',
            style: TextStyle(fontSize: 14, color: Colors.grey),
          ),
        ),
      );
    }

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.orange.withOpacity(0.3)),
                  ),
                  child: const Icon(
                    Icons.store,
                    color: Colors.orange,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Sản phẩm khác của ${widget.store['name'] ?? 'Shop'}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${allShopProducts.length} sản phẩm',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: () {
                    debugPrint('Xem tất cả sản phẩm của shop');
                  },
                  icon: const Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: Colors.orange,
                  ),
                  label: const Text(
                    'Xem tất cả',
                    style: TextStyle(
                      color: Colors.orange,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 300,
            child: ListView.builder(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(left: 16.0),
              physics: const BouncingScrollPhysics(),
              itemCount: allShopProducts.length,
              itemBuilder: (context, index) {
                final product = allShopProducts[index];
                final productId = product['id']?.toString() ?? '0';
                final isFavorite = _favoriteProductIds.contains(productId);

                return _buildProductCard(
                  product: product,
                  isFavorite: isFavorite,
                  onTap: () {
                    debugPrint('Tapped on product: ${product['name']}');
                  },
                  onFavoriteTap: () {
                    setState(() {
                      if (isFavorite) {
                        _favoriteProductIds.remove(productId);
                      } else {
                        _favoriteProductIds.add(productId);
                      }
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          _buildScrollIndicator(allShopProducts.length),
        ],
      ),
    );
  }

  Widget _buildProductCard({
    required Map<String, dynamic> product,
    required bool isFavorite,
    required VoidCallback onTap,
    required VoidCallback onFavoriteTap,
  }) {
    String imageUrl = product['thumbnail_url']?.toString() ?? '';
    int soldCountRaw = int.tryParse(product['sold_count']?.toString() ?? '0') ?? 0;
    String soldCount = NumberFormat('#,###', 'vi_VN')
        .format(soldCountRaw)
        .replaceAll(',', '.');

    final discountRaw = product['discount'];
    double? discount = (discountRaw is num)
        ? discountRaw.toDouble()
        : (discountRaw is String ? double.tryParse(discountRaw) : null);
    bool hasDiscount = discount != null && discount > 0;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Container(
                  height: 130,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(12),
                      topRight: Radius.circular(12),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12),
                      topRight: Radius.circular(12),
                    ),
                    child: imageUrl.isNotEmpty
                        ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: _getPlaceholderColor(product['id']?.toString() ?? '0'),
                          child: Center(
                            child: _getPlaceholderIcon(product['id']?.toString() ?? '0'),
                          ),
                        );
                      },
                    )
                        : Container(
                      color: _getPlaceholderColor(product['id']?.toString() ?? '0'),
                      child: Center(
                        child: _getPlaceholderIcon(product['id']?.toString() ?? '0'),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: onFavoriteTap,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            spreadRadius: 1,
                            blurRadius: 3,
                          ),
                        ],
                      ),
                      child: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: isFavorite ? Colors.red : Colors.grey.shade600,
                        size: 18,
                      ),
                    ),
                  ),
                ),
                if (hasDiscount)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '-${discount!.round()}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name']?.toString() ?? 'Sản phẩm',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  _buildPrice(product['price']),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        color: Colors.amber,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        (product['rating']?.toString() ?? '0.0'),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '$soldCount đã bán',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrice(dynamic price) {
    if (price == null) {
      return const Text(
        'Liên hệ',
        style: TextStyle(
          fontSize: 16,
          color: Colors.red,
          fontWeight: FontWeight.bold,
        ),
      );
    }

    try {
      final priceValue = (price is num)
          ? price
          : (price is String ? num.tryParse(price) : null);
      if (priceValue == null) {
        return const Text(
          'Liên hệ',
          style: TextStyle(
            fontSize: 16,
            color: Colors.red,
            fontWeight: FontWeight.bold,
          ),
        );
      }
      return CurrencyFormatter.buildRichText(
        priceValue,
        valueStyle: const TextStyle(
          fontSize: 16,
          color: Colors.red,
          fontWeight: FontWeight.bold,
        ),
        symbolStyle: const TextStyle(
          fontSize: 12,
          color: Colors.red,
          fontWeight: FontWeight.bold,
          decoration: TextDecoration.underline,
        ),
      );
    } catch (e) {
      return Text(
        price.toString(),
        style: const TextStyle(
          fontSize: 16,
          color: Colors.red,
          fontWeight: FontWeight.bold,
        ),
      );
    }
  }

  Widget _buildScrollIndicator(int itemCount) {
    return Center(
      child: AnimatedBuilder(
        animation: _scrollController,
        builder: (context, child) {
          // Return a default gray bar if the controller isn't attached or the list can't scroll
          if (!_scrollController.hasClients || itemCount <= 1 || !_scrollController.position.hasContentDimensions) {
            return Container(
              width: 100,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            );
          }

          // Safe to access scroll metrics
          final maxScroll = _scrollController.position.maxScrollExtent;
          final currentScroll = _scrollController.offset;

          // Avoid division by zero and ensure progress is between 0 and 1
          double progress = 0.0;
          if (maxScroll > 0) {
            progress = (currentScroll / maxScroll).clamp(0.0, 1.0);
          }

          // Ensure a minimum width for the yellow bar (e.g., 10% of the total width)
          double minWidthFactor = 0.1;
          double widthFactor = progress == 0.0 ? minWidthFactor : progress.clamp(minWidthFactor, 1.0);

          return Container(
            width: 100,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: widthFactor,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Color _getPlaceholderColor(String productId) {
    int idValue = int.tryParse(productId) ?? 0;
    switch (idValue % 5) {
      case 0:
        return Colors.blue.shade100;
      case 1:
        return Colors.green.shade100;
      case 2:
        return Colors.orange.shade100;
      case 3:
        return Colors.purple.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  Widget _getPlaceholderIcon(String productId) {
    int idValue = int.tryParse(productId) ?? 0;
    IconData iconData;
    Color iconColor;

    switch (idValue % 5) {
      case 0:
        iconData = Icons.phone_iphone;
        iconColor = Colors.blue;
        break;
      case 1:
        iconData = Icons.checkroom;
        iconColor = Colors.green;
        break;
      case 2:
        iconData = Icons.headphones;
        iconColor = Colors.orange;
        break;
      case 3:
        iconData = Icons.watch;
        iconColor = Colors.purple;
        break;
      default:
        iconData = Icons.shopping_bag;
        iconColor = Colors.grey;
    }

    return Icon(iconData, size: 40, color: iconColor);
  }
}