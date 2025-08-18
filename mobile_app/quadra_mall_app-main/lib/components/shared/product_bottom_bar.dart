import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/product_detail/product_variants.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';

class ProductBottomBar extends StatelessWidget {
  final ProductDetail product;
  final Color? primaryColor;

  const ProductBottomBar({
    Key? key,
    required this.product,
    this.primaryColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final primaryColor = this.primaryColor ?? Theme.of(context).primaryColor;

    return Container(
      height: 70,
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.store, color: Colors.grey),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đi đến cửa hàng!')),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.chat_bubble_outline, color: Colors.grey),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Mở trò chuyện!')),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.star_border, color: Colors.grey),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Thêm vào danh sách yêu thích!')),
                  );
                },
              ),
            ],
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      _showVariantsBottomSheet(context, false);
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      minimumSize: const Size(0, 36),
                      side: BorderSide(color: primaryColor),
                      backgroundColor: primaryColor,
                    ),
                    child: Icon(
                      Icons.add_shopping_cart,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    child: OutlinedButton(
                      onPressed: () {
                        _showVariantsBottomSheet(context, true);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        minimumSize: const Size(0, 36),
                        side: BorderSide(color: primaryColor),
                      ),
                      child: Text(
                        'Mua ngay',
                        style: TextStyle(fontSize: 14, color: primaryColor),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Phương thức hiển thị bottom sheet chọn biến thể
  void _showVariantsBottomSheet(BuildContext context, bool isBuyNow) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.8,
          minChildSize: 0.8,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return ProductVariants(
              product: product,
              primaryColor: primaryColor,
              isBuyNow: isBuyNow,
              onVariantSelected: (selections, quantity) {
                if (isBuyNow) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Chuyển đến thanh toán với $quantity sản phẩm'),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Đã thêm $quantity sản phẩm vào giỏ hàng'),
                    ),
                  );
                }
              },
            );
          },
        );
      },
    );
  }
}