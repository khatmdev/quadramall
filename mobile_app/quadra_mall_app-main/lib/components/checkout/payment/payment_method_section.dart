import 'package:flutter/material.dart';
import 'payment_option.dart';

class PaymentMethodSection extends StatefulWidget {
  const PaymentMethodSection({Key? key}) : super(key: key);

  @override
  _PaymentMethodSectionState createState() => _PaymentMethodSectionState();
}

class _PaymentMethodSectionState extends State<PaymentMethodSection> {
  String? _selectedPaymentMethod;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Phương thức thanh toán',
          style: TextStyle(
            fontSize: 16.5,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.2),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              PaymentOption(
                value: 'paypal',
                groupValue: _selectedPaymentMethod,
                onChanged: (value) {
                  setState(() {
                    _selectedPaymentMethod = value;
                  });
                },
                title: 'VNPAY',
                imageUrl: 'assets/images/vnpaywebp', // Sửa tên file đúng
              ),
              Divider(height: 1, color: Colors.grey[300]), // Phân cách
              PaymentOption(
                value: 'momo',
                groupValue: _selectedPaymentMethod,
                onChanged: (value) {
                  setState(() {
                    _selectedPaymentMethod = value;
                  });
                },
                title: 'MoMo',
                imageUrl: 'assets/images/momo.png',
              ),
              Divider(height: 1, color: Colors.grey[300]), // Phân cách
              PaymentOption(
                value: 'cod',
                groupValue: _selectedPaymentMethod,
                onChanged: (value) {
                  setState(() {
                    _selectedPaymentMethod = value;
                  });
                },
                title: 'Thanh toán khi nhận hàng',
                imageUrl: 'assets/images/cod.png',
              ),
            ],
          ),
        ),
      ],
    );
  }
}