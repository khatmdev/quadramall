import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/shared/product_card.dart';
import 'package:quarda_mall_home_app/models/product.dart';

class ProductListingView extends StatelessWidget {
  final List<Product> products;
  final bool isGridView;
  final bool shrinkWrap;
  final ScrollPhysics physics;
  final int crossAxisCount;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double childAspectRatio;
  final Function(int) onFavPressed;

  const ProductListingView({
    super.key,
    required this.products,
    required this.isGridView,
    this.shrinkWrap = true, // Giá trị mặc định
    this.physics = const NeverScrollableScrollPhysics(), // Giá trị mặc định
    this.crossAxisCount = 2, // Giá trị mặc định
    this.mainAxisSpacing = 16, // Giá trị mặc định
    this.crossAxisSpacing = 16, // Giá trị mặc định
    this.childAspectRatio = 0.6, // Giá trị mặc định
    required this.onFavPressed,
  });

  @override
  Widget build(BuildContext context) {
    if (isGridView) {
      return GridView.builder(
        shrinkWrap: shrinkWrap,
        physics: physics,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          mainAxisSpacing: mainAxisSpacing,
          crossAxisSpacing: crossAxisSpacing,
          childAspectRatio: childAspectRatio,
        ),
        itemCount: products.length,
        itemBuilder: (context, index) {
          return ProductCard(
              product: products[index],
              isGrid: true,
              onFavPressed: () => onFavPressed(index), // Truyền callback với index
          );
        },
      );
    } else {
      return ListView.builder(
        shrinkWrap: shrinkWrap,
        physics: physics,
        itemCount: products.length,
        itemBuilder: (context, index) {
          return ProductCard(
              product: products[index],
              isGrid: false,
              onFavPressed: () => onFavPressed(index), // Truyền callback với index
          );
        },
      );
    }
  }
}