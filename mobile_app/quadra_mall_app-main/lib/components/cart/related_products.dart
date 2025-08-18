import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/shared/product_listing_view.dart';
import 'package:quarda_mall_home_app/models/product_data.dart';

class RelatedProducts extends StatefulWidget {
  const RelatedProducts({super.key});

  @override
  State<RelatedProducts> createState() => _RelatedProductsState();
}
class _RelatedProductsState extends State<RelatedProducts>{

  // Hàm thay đổi trạng thái yêu thích
  void _toggleFavorite(int index) {
    setState(() {
      products[index].isFav = !products[index].isFav;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Related Product', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            TextButton(
              onPressed: () {},
              child: const Text('View Detail', style: TextStyle(color: Colors.green)),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ProductListingView(
            products: products,
            onFavPressed: _toggleFavorite, // Truyền callback
            isGridView: true
        ),
      ],
    );
  }
}