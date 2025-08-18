import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/service/api_service.dart';
import 'package:quarda_mall_home_app/service/products_service.dart';
import 'package:quarda_mall_home_app/models/product_detail_model.dart';
import 'package:quarda_mall_home_app/models/mock_data.dart';
import 'package:quarda_mall_home_app/components/shared/product_bottom_bar.dart';
import 'package:quarda_mall_home_app/components/shared/product_top_bar.dart';
import 'package:quarda_mall_home_app/components/product_detail/product_info.dart';
import 'package:quarda_mall_home_app/components/product_detail/shop_info.dart';
import 'package:quarda_mall_home_app/components/product_detail/product_reviews.dart';
import 'package:quarda_mall_home_app/components/product_detail/related_products.dart';
import 'package:quarda_mall_home_app/components/product_detail/product_tab_navigation.dart';
import 'package:quarda_mall_home_app/components/product_detail/product_promotions_banner.dart';
import 'package:quarda_mall_home_app/components/product_detail/shop_other_products.dart';

class ProductDetailScreen extends StatefulWidget {
  final String slug;

  const ProductDetailScreen({super.key, required this.slug});

  @override
  _ProductDetailScreenState createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late ProductsService _productService;
  ProductDetail? _productDetail;
  String? _errorMessage;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _productService = ProductsService(ApiService());
    _fetchProductDetail();
  }

  Future<void> _fetchProductDetail() async {
    try {
      final productDetail = await _productService.getProductDetail(widget.slug);
      setState(() {
        _productDetail = productDetail;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        body: Center(child: Text('Lỗi: $_errorMessage')),
      );
    }

    if (_productDetail == null) {
      return const Scaffold(
        body: Center(child: Text('Không tìm thấy sản phẩm')),
      );
    }

    // Sử dụng MockData cho các thành phần chưa chuyển sang ProductDetail
    final store = MockData.stores.firstWhere(
          (s) => s['id'] == _productDetail!.storeId,
      orElse: () => {
        'id': _productDetail!.store.id,
        'name': _productDetail!.store.name,
        'slug': _productDetail!.store.slug,
        'address': _productDetail!.store.address,
        'description': _productDetail!.store.description,
        'logo_url': _productDetail!.store.logoUrl,
        'rating': _productDetail!.store.rating,
        'product_count': _productDetail!.store.productCount,
      },
    );
    final mockProduct = MockData.products.firstWhere(
          (p) => p['slug'] == widget.slug,
      orElse: () => {
        'id': _productDetail!.id,
        'slug': _productDetail!.slug,
        'name': _productDetail!.name,
        'description': _productDetail!.description,
        'thumbnail_url': _productDetail!.thumbnailUrl,
        'store_id': _productDetail!.storeId,
      },
    );

    return Scaffold(
      appBar: const PreferredSize(
        preferredSize: Size.fromHeight(80),
        child: Padding(
          padding: EdgeInsets.only(top: 10),
          child: TopBar(),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              children: [
                // ProductInfo
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 1,
                        blurRadius: 3,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  child: ProductInfo(
                    product: _productDetail!,
                  ),
                ),
                const SizedBox(height: 5),

                // Khuyến mãi & Ưu đãi
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 1,
                        blurRadius: 3,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  child: ProductPromotionsBanner(
                    discountCodes: _productDetail!.discountCodes,
                  ),
                ),
                const SizedBox(height: 5),
              ],
            ),
          ),

          // Tab Navigation
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    spreadRadius: 1,
                    blurRadius: 3,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              child: ProductTabNavigationSegmented(
                product: _productDetail!,
                primaryColor: Colors.orange,
              ),
            ),
          ),

          // ShopInfo
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    spreadRadius: 1,
                    blurRadius: 3,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              child: ShopInfo(store: _productDetail!.store),
            ),
          ),

          // Product Reviews
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    spreadRadius: 1,
                    blurRadius: 3,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              child: ProductReviews(
                reviews: _productDetail!.reviews,
                averageRating: _productDetail!.averageRating,
                reviewCount: _productDetail!.reviewCount,
              ),
            ),
          ),

          // Sản phẩm khác của shop
          // SliverToBoxAdapter(
          //   child: Container(
          //     margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          //     decoration: BoxDecoration(
          //       color: Colors.white,
          //       borderRadius: BorderRadius.circular(8),
          //       boxShadow: [
          //         BoxShadow(
          //           color: Colors.grey.withOpacity(0.2),
          //           spreadRadius: 1,
          //           blurRadius: 3,
          //           offset: Offset(0, 1),
          //         ),
          //       ],
          //     ),
          //     child: ShopOtherProducts(store: store),
          //   ),
          // ),

          // Related Products
          // SliverToBoxAdapter(
          //   child: Container(
          //     margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          //     decoration: BoxDecoration(
          //       color: Colors.white,
          //       borderRadius: BorderRadius.circular(8),
          //       boxShadow: [
          //         BoxShadow(
          //           color: Colors.grey.withOpacity(0.2),
          //           spreadRadius: 1,
          //           blurRadius: 3,
          //           offset: Offset(0, 1),
          //         ),
          //       ],
          //     ),
          //     child: const RelatedProducts(),
          //   ),
          // ),

          // Khoảng trống cho bottom navigation bar
          const SliverToBoxAdapter(
            child: SizedBox(height: 80),
          ),
        ],
      ),
      bottomNavigationBar: ProductBottomBar(
        product: _productDetail!,
        primaryColor: Colors.green,
      ),
    );
  }
}