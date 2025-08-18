import 'package:flutter/material.dart';
import 'product_item.dart';
import 'price_row.dart';

class ProductSummarySection extends StatelessWidget {
  const ProductSummarySection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Chi tiết thanh toán ',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 6),
            PriceRow(label: 'Tổng tiền sản phẩm ', value: 13719000),
            SizedBox(height: 6),
            PriceRow(label: 'Tổng phí vận chuyển', value: 40000),
            SizedBox(height: 6),
            PriceRow(label: 'Tổng giá (Giảm giá vận chuyển)', value: 40000, isDiscount: true),
            SizedBox(height: 6),
            PriceRow(label: 'Tổng giá (Voucher sử dụng)', value: 5000, isDiscount: true),
            Divider(),
            PriceRow(label: 'Tổng giá cuối cùng', value: 13724000, isBold: true),
            SizedBox(height: 10),

          ],
        ),
      ),
    );
  }
}