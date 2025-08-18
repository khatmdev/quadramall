import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:quarda_mall_home_app/components/profile/profile_screen.dart';
import 'package:quarda_mall_home_app/components/shared/custom_bottom_navigation.dart';
import 'package:quarda_mall_home_app/screens/cart_screen.dart';
import 'package:quarda_mall_home_app/screens/favorite_screen.dart';
import 'package:quarda_mall_home_app/screens/home_screen.dart';
import 'package:quarda_mall_home_app/screens/notification_screen.dart';
import 'package:quarda_mall_home_app/screens/order_tracking_screen.dart';
import 'package:quarda_mall_home_app/screens/product_detail_screen.dart';
import 'package:quarda_mall_home_app/utils/tab_provider.dart';

class MainLayout extends StatelessWidget {
  const MainLayout({super.key});

  @override
  Widget build(BuildContext context) {
    final tabProvider = Provider.of<TabProvider>(context);

    return Scaffold(
      body: Stack(
        children: [
          _getBodyByIndex(tabProvider.selectedIndex),
          Positioned(
            bottom: 20,
            right: 20,
            child: FloatingActionButton(
              onPressed: () {
                tabProvider.setIndex(6); // Chuyển đến tab ProductDetailScreen
              },
              child: const Icon(Icons.shop),
              backgroundColor: Colors.green,
            ),
          ),
        ],
      ),
      bottomNavigationBar: CustomBottomNavigation(
        currentIndex: tabProvider.selectedIndex,
        onTap: (index) => tabProvider.setIndex(index),
      ),
    );
  }

  Widget _getBodyByIndex(int index) {
    switch (index) {
      case 0:
        return HomeScreen();
      case 1:
        return OrderTrackingScreen();
      case 2:
        return const CartScreen();
      case 3:
        return FavoritesScreen();
      case 4:
        return const ProfileScreen();
      case 5:
        return const NotificationScreen();
      case 6:
        return const ProductDetailScreen(slug: 'test-lan-cuoi-14');
      default:
        return HomeScreen();
    }
  }
}