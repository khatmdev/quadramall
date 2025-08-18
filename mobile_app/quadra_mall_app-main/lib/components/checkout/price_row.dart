import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/utils/formater.dart';

class PriceRow extends StatelessWidget {
  final String label;
  final double value;
  final bool isDiscount;
  final bool isBold;

  const PriceRow({
    required this.label,
    required this.value ,
    this.isDiscount = false,
    this.isBold = false,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            fontSize: 12,
          ),
        ),
        Text(
          Formatter.formatCurrencyWithSymbol(value),
          style: TextStyle(
            color: isDiscount ? Colors.red : Colors.black,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}