import 'package:flutter/material.dart';
import 'cart_item.dart';
import 'cart_data.dart';

class CartShopSection extends StatelessWidget {
  final CartShop shop;
  final Function(CartShop) onSelectShop;
  final Function(CartProduct) onSelectProduct;
  final Function(CartProduct) onIncrease;
  final Function(CartProduct) onDecrease;
  final Function(CartProduct) onDelete;

  const CartShopSection({
    super.key,
    required this.shop,
    required this.onSelectShop,
    required this.onSelectProduct,
    required this.onIncrease,
    required this.onDecrease,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(bottom: 16),
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          color: Color.fromRGBO(244, 246, 248, 1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Checkbox(
                  value: shop.isSelected,
                  onChanged: (value) => onSelectShop(shop),
                ),
                const SizedBox(width: 8),
                Icon(Icons.home_work_outlined),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('${shop.name} - ${shop.location}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...shop.products.asMap().entries.map((entry) {
              final index = entry.key;
              final product = entry.value;
              final isLast = index == shop.products.length - 1;

              return CartItem(
                productName: product.name,
                storeLocation: shop.location,
                price: product.price,
                quantity: product.quantity,
                isSelected: product.isSelected,
                isLast: isLast,
                onSelect: () => onSelectProduct(product),
                onIncrease: () => onIncrease(product),
                onDecrease: () => onDecrease(product),
                onDelete: () => onDelete(product),
              );
            })
          ],
        ),
      ),
    );
  }
}