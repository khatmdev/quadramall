import 'package:flutter/material.dart';
import 'cart_data.dart';

class CartSummary extends StatelessWidget {
  final List<CartShop> cartData;
  final VoidCallback onCheckout;

  const CartSummary({
    super.key,
    required this.cartData,
    required this.onCheckout,
  });

  double _calculateTotalPrice() {
    double total = 0;
    for (var shop in cartData) {
      for (var product in shop.products) {
        if (product.isSelected) {
          total += product.price * product.quantity;
        }
      }
    }
    return total;
  }

  double _calculateDiscount() {
    return _calculateTotalPrice() * 0.1; // 10% discount
  }

  double _calculateTaxFee() {
    return _calculateTotalPrice() * 0.05; // 5% tax
  }

  @override
  Widget build(BuildContext context) {
    final totalPrice = _calculateTotalPrice();
    final discount = _calculateDiscount();
    final taxFee = _calculateTaxFee();
    final finalPrice = totalPrice - discount + taxFee;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'US \$${finalPrice.toStringAsFixed(2)}',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          ElevatedButton(
            onPressed: onCheckout,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'THANH TOÁN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(width: 8),
                Icon(
                  Icons.arrow_forward,
                  color: Colors.white,
                  size: 20,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}