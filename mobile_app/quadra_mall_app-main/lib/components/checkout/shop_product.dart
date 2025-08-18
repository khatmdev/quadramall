import 'package:flutter/material.dart';
import 'package:quarda_mall_home_app/components/checkout/note/note.dart';
import 'package:quarda_mall_home_app/components/checkout/product_item.dart';
import 'package:quarda_mall_home_app/utils/formater.dart';
import 'voucher/voucher_shop_dialog.dart'; // Import the VoucherDialog widget

class ShopProductSession extends StatefulWidget {
  const ShopProductSession({Key? key}) : super(key: key);

  @override
  State<ShopProductSession> createState() => _ShopProductSessionState();
}

class _ShopProductSessionState extends State<ShopProductSession> {
  String? note; // ✅ Ghi chú lưu tại đây

  void _showVoucherDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return VoucherDialog();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final products = [
      {
        'name': 'Logitech G435 Gaming Headsets',
        'price': 320000.0,
        'quantity': 1,
        'imageUrl': 'assets/images/tainghe1.webp',
      },
      {
        'name': 'Logitech G502 Hero',
        'price': 199000.0,
        'quantity': 1,
        'imageUrl': 'assets/images/chuot1.webp',
      },
    ];

    final totalPrice = products.fold(0.0, (sum, product) =>
    sum + (product['price'] as double) * (product['quantity'] as int));

    return Card(
      elevation: 3,
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shop name
            Row(
              children: [
                Icon(Icons.house_siding_outlined),
                SizedBox(width: 10),
                Text('QuadraSmall',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 10.0),

            ...products.map((product) => ProductItem(
              name: product['name'] as String,
              price: product['price'] as double,
              quantity: product['quantity'] as int,
              imageUrl: product['imageUrl'] as String,
            )),

            SizedBox(height: 10),
            Divider(),

            Column(
              children: [
                // Voucher
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Voucher từ shop', style: TextStyle(fontSize: 13)),
                    Row(
                      children: [
                        Icon(Icons.local_offer, size: 15, color: Colors.green),
                        Text("- 0đ"),
                        IconButton(
                          onPressed: () => _showVoucherDialog(context),
                          icon: Icon(Icons.arrow_forward_ios, size: 14),
                        ),
                      ],
                    ),
                  ],
                ),

                // Ghi chú
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Ghi chú cho shop', style: TextStyle(fontSize: 13)),
                    IconButton(
                      onPressed: () {
                        Note.showNoteBottomSheet(context, note, (newNote) {
                          setState(() {
                            note = newNote;
                          });
                        });
                      },
                      icon: Icon(Icons.edit, size: 16),
                      constraints: BoxConstraints(),
                    ),
                  ],
                ),

                if (note != null && note!.isNotEmpty)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: const EdgeInsets.only(left: 4, top: 4),
                      child: Text(
                        '📝 "$note"',
                        style: TextStyle(fontSize: 12, color: Colors.black87),
                      ),
                    ),
                  ),

                SizedBox(height: 10),
                // Tổng tiền
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Tổng tiền hàng',
                        style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w600)),
                    Text(
                      Formatter.formatCurrencyWithSymbol(totalPrice),
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.red),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
