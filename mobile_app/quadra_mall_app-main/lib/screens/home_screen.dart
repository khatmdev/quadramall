import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/favorite/toast_fav.dart';
import 'package:quarda_mall_home_app/components/home/home_app_bar.dart';
import 'package:quarda_mall_home_app/components/home/banner_widget.dart';
import 'package:quarda_mall_home_app/components/home/category_card.dart';
import 'package:quarda_mall_home_app/components/home/feature_shop.dart';
import 'package:quarda_mall_home_app/components/home/secondary_banner.dart';
import 'package:quarda_mall_home_app/components/shared/product_listing_view.dart';
import 'package:quarda_mall_home_app/models/product_data.dart';
import 'package:quarda_mall_home_app/screens/gaming_gear_screen.dart';


class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const HomeAppBar(),
          // Banner Section
          const SliverToBoxAdapter(child: BannerWidget()),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
          // Danh Mục Section
          SliverToBoxAdapter(child: DanhMucSection()),
          // Shop Yêu Thích Section
          SliverToBoxAdapter(child: ShopYeuThichSection()),
          // Secondary Banner
          const SliverToBoxAdapter(child: SecondaryBanner()),
          // Sản Phẩm Nổi Bật Section
          SliverToBoxAdapter(child: SanPhamNoiBatSection()),
          const SliverToBoxAdapter(child: SizedBox(height: 32)),
        ],
      ),
    );
  }
}

// Danh Mục Section
class DanhMucSection extends StatelessWidget {
  const DanhMucSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Danh mục',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  side: const BorderSide(
                      width: 1.0, color: Colors.green, style: BorderStyle.solid),
                ),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => GamingGearScreen()),
                  );
                },
                child: const Text(
                  'Tất cả',
                  style: TextStyle(color: Colors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: const [
                CategoryCard(icon: Icons.devices, title: 'Điện tử'),
                CategoryCard(icon: Icons.shopify, title: 'Thời trang'),
                CategoryCard(icon: Icons.restaurant, title: 'Đồ ăn'),
                CategoryCard(icon: Icons.liquor, title: 'Đồ uống'),
                CategoryCard(icon: Icons.celebration, title: 'Trang trí'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Shop Yêu Thích Section
class ShopYeuThichSection extends StatelessWidget {
  const ShopYeuThichSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Shop được yêu thích',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 240,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: const [
                FeatureShop(
                  name: 'Vối Cafe',
                  rating: 5.0,
                  imageUrl: 'assets/images/shop_voi_cf.jpg',
                ),
                FeatureShop(
                  name: 'Van Fashion VNXK',
                  rating: 4.9,
                  imageUrl: 'assets/images/shop_van_fashion.jpg',
                ),
                FeatureShop(
                  name: 'Điện tử Nshop',
                  rating: 4.7,
                  imageUrl: 'assets/images/shop_Nshop.jpg',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Sản Phẩm Nổi Bật Section
class SanPhamNoiBatSection extends StatefulWidget {
  const SanPhamNoiBatSection({super.key});

  @override
  State<SanPhamNoiBatSection> createState() => _FavoriteState();
}
class _FavoriteState extends State<SanPhamNoiBatSection>{

  // Hàm thay đổi trạng thái yêu thích
  void _toggleFavorite(int index) {
    setState(() {
      products[index].isFav = !products[index].isFav;
      showFavToast(isFav: products[index].isFav);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Sản phẩm nổi bật',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  side: const BorderSide(
                      width: 1.0, color: Colors.green, style: BorderStyle.solid),
                ),
                onPressed: () {},
                child: const Text(
                  'Xem chi tiết',
                  style: TextStyle(color: Colors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ProductListingView(
            products: products,
            onFavPressed: _toggleFavorite,
            isGridView: true,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 0.6,
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  side: const BorderSide(
                      width: 1.0, color: Colors.green, style: BorderStyle.solid),
                ),
                onPressed: () {},
                child: const Text(
                  'Xem thêm',
                  style: TextStyle(color: Colors.green),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}