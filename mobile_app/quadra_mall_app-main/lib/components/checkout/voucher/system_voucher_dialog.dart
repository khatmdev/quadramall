import 'package:flutter/material.dart';

class SystemVoucherDialog extends StatelessWidget {
  final List<Map<String, dynamic>> productVouchers = [
    {
      'code': 'SANDAY30K',
      'description': '🎁 Giảm 30K cho đơn từ 300K',
      'stock': 999,
    },
    {
      'code': 'SALE50K',
      'description': '🎉 Giảm 50K cho đơn từ 500K',
      'stock': 200,
    },
  ];

  final List<Map<String, dynamic>> shippingVouchers = [
    {
      'code': 'FREESHIP50',
      'description': '🚚 Miễn phí ship toàn quốc',
      'stock': 1500,
    },
    {
      'code': 'SHIP20K',
      'description': '📦 Giảm 20K phí vận chuyển',
      'stock': 400,
    },
  ];


  void _applyVoucher(BuildContext context, String code) {
    Navigator.of(context).pop(code); // Trả mã voucher về
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('🎉 Đã áp dụng mã $code!')),
    );
  }

  Widget _buildVoucherGroup({
    required String title,
    required List<Map<String, dynamic>> vouchers,
    required IconData icon,
    required Color iconColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: iconColor),
            SizedBox(width: 6),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: iconColor,
              ),
            ),
          ],
        ),
        SizedBox(height: 8),
        ...vouchers.map((voucher) {
          return Container(
            margin: EdgeInsets.symmetric(vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.05),
                  blurRadius: 5,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: ListTile(
              leading: Icon(Icons.local_offer, size: 36, color: iconColor),
              title: Text(voucher['code'],
                  style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(voucher['description']),
                  SizedBox(height: 4),
                  Text('Còn ${voucher['stock']} lượt',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                ],
              ),
              trailing: Builder(builder: (context) {
                return ElevatedButton(
                  onPressed: () => _applyVoucher(context, voucher['code']),
                  child: Text('Dùng'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: iconColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                );
              },

              ),
            ),
          );
        }).toList(),
        SizedBox(height: 16),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      insetPadding: EdgeInsets.all(16),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'QUADRA VOUCHER',
                    style: Theme
                        .of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.green[800],
                    ),
                  ),
                  SizedBox(height: 20),
                  _buildVoucherGroup(
                    title: 'Giảm giá sản phẩm',
                    vouchers: productVouchers,
                    icon: Icons.shopping_bag,
                    iconColor: Colors.green,
                  ),
                  _buildVoucherGroup(
                    title: 'Giảm giá vận chuyển',
                    vouchers: shippingVouchers,
                    icon: Icons.local_shipping,
                    iconColor: Colors.blue,
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: TextButton.icon(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close),
                      label: Text("Đóng"),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            right: 4,
            top: 4,
            child: IconButton(
              icon: Icon(Icons.close, color: Colors.grey[600]),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ],
      ),
    );
  }
}
