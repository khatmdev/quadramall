import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:quarda_mall_home_app/components/cart/cart_app_bar.dart';
import 'package:quarda_mall_home_app/components/cart/cart_shop_section.dart';
import 'package:quarda_mall_home_app/components/cart/related_products.dart';
import 'package:quarda_mall_home_app/components/cart/cart_summary.dart';
import 'package:quarda_mall_home_app/components/cart/cart_data.dart';
import 'package:quarda_mall_home_app/components/shared/confirm_delete_dialog.dart';
import 'package:quarda_mall_home_app/screens/checkout_screen.dart';
import 'package:quarda_mall_home_app/utils/tab_provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  _CartScreenState createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartShop> cartDataState = cartData;

  bool get isAllSelected {
    return cartDataState.every((shop) => shop.isSelected);
  }

  bool get isAnySelected {
    return cartDataState.any((shop) => shop.isSelected || shop.products.any((product) => product.isSelected));
  }

  int get totalItems {
    return cartDataState.fold(0, (sum, shop) => sum + shop.products.length);
  }

  void _selectAll() {
    setState(() {
      final newValue = !isAllSelected;
      for (var shop in cartDataState) {
        shop.isSelected = newValue;
        for (var product in shop.products) {
          product.isSelected = newValue;
        }
      }
    });
  }

  void _selectShop(CartShop shop) {
    setState(() {
      shop.isSelected = !shop.isSelected;
      for (var product in shop.products) {
        product.isSelected = shop.isSelected;
      }
    });
  }

  void _selectProduct(CartProduct product) {
    setState(() {
      product.isSelected = !product.isSelected;
      // Cập nhật trạng thái chọn của shop
      final shop = cartDataState.firstWhere((s) => s.products.contains(product));
      shop.isSelected = shop.products.every((p) => p.isSelected);
    });
  }

  void _increaseQuantity(CartProduct product) {
    setState(() {
      product.quantity++;
    });
  }

  void _decreaseQuantity(CartProduct product) {
    setState(() {
      if (product.quantity > 1) {
        product.quantity--;
      }
    });
  }

  void _deleteProduct(CartProduct product) {
    showDialog(
      context: context,
      builder: (context) => ConfirmDeleteDialog(
        title: 'Xác nhận xóa',
        content: 'Bạn có chắc muốn xóa sản phẩm "${product.name}" khỏi giỏ hàng?',
        onConfirm: () {
          setState(() {
            final shop = cartDataState.firstWhere((s) => s.products.contains(product));
            shop.products.remove(product);
            if (shop.products.isEmpty) {
              cartDataState.remove(shop);
            }
          });
        },
      ),
    );
  }

  void _deleteAll() {
    showDialog(
      context: context,
      builder: (context) => ConfirmDeleteDialog(
        title: 'Xác nhận xóa',
        content: 'Bạn có chắc muốn xóa các sản phẩm đã chọn trong giỏ hàng?',
        onConfirm: () {
          setState(() {
            for (var shop in cartDataState.toList()) {
              shop.products.removeWhere((product) => product.isSelected);
              if (shop.isSelected || shop.products.isEmpty) {
                cartDataState.remove(shop);
              }
            }
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabProvider = Provider.of<TabProvider>(context, listen: false);
    return Scaffold(
      appBar: CartAppBar(
        isAllSelected: isAllSelected,
        isAnySelected: isAnySelected,
        onSelectAll: _selectAll,
        onDeleteAll: _deleteAll,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 24,),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ...cartDataState.map((shop) => CartShopSection(
                    shop: shop,
                    onSelectShop: _selectShop,
                    onSelectProduct: _selectProduct,
                    onIncrease: _increaseQuantity,
                    onDecrease: _decreaseQuantity,
                    onDelete: _deleteProduct,
                  )),
                ],
              ),
            ),
            const SizedBox(height: 24,),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const RelatedProducts(),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 4,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: CartSummary(
          cartData: cartDataState,
          onCheckout: () async {
            final int? returnedIndex = await Navigator.push<int>(
              context,
              MaterialPageRoute(builder: (_) => const CheckoutScreen()),
            );

            if (returnedIndex != null) {
              tabProvider.setIndex(returnedIndex);
            }
          },
        ),
      ),
    );
  }
}