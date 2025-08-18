import 'package:flutter/material.dart';

class VoucherDialog extends StatefulWidget {
  @override
  _VoucherDialogState createState() => _VoucherDialogState();
}

class _VoucherDialogState extends State<VoucherDialog> {
  final TextEditingController _voucherController = TextEditingController();
  String? _selectedVoucher;

  final List<Map<String, dynamic>> availableVouchers = [
    {
      'code': 'QUADRA10',
      'description': '✨ Giảm 10% tối đa 50.000đ',
      'discount': 50000.0,
      'stock': 100,
      'shopLogo': 'https://example.com/images/shop1_logo.png',
    },
    {
      'code': 'QUADRA20',
      'description': '🔥 Giảm 20.000đ cho đơn từ 200.000đ',
      'discount': 20000.0,
      'stock': 23,
      'shopLogo': 'https://example.com/images/shop2_logo.png',
    },
  ];


  void _applyVoucher() {
    String enteredCode = _voucherController.text.trim();
    if (enteredCode.isNotEmpty) {
      bool isValid = availableVouchers.any((voucher) => voucher['code'] == enteredCode);
      if (isValid) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('🎉 Mã $enteredCode được áp dụng thành công!')),
        );
        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Mã giảm giá không hợp lệ!')),
        );
      }
    }
  }

  void _selectVoucher(String code) {
    setState(() {
      _selectedVoucher = code;
      _voucherController.text = code;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('✅ Đã chọn mã $code!')),
    );
    // Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: EdgeInsets.all(20),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: 12), // để tránh bị che bởi icon đóng
                Text(
                  '🎁 Mã giảm giá',
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 16),
                TextField(
                  controller: _voucherController,
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.card_giftcard),
                    labelText: 'Nhập mã giảm giá',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _applyVoucher,
                    icon: Icon(Icons.check_circle, color: Colors.green),
                    label: Text('Áp dụng mã'),
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.green,
                      padding: EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                SizedBox(height: 20),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '🧾 Mã có sẵn',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                SizedBox(height: 8),
                ...availableVouchers.map((voucher) {
                  final isSelected = _selectedVoucher == voucher['code'];
                  return Card(
                    color: isSelected ? Colors.green[50] : null,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 2,
                    margin: EdgeInsets.symmetric(vertical: 6),
                    child: ListTile(
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      leading: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          voucher['shopLogo'],
                          width: 40,
                          height: 40,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Icon(Icons.store, color: Colors.grey),
                        ),
                      ),
                      title: Text(
                        voucher['code'],
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(voucher['description']),
                          SizedBox(height: 4),
                          Text(
                            'Còn lại: ${voucher['stock']} lượt dùng.',
                            style: TextStyle(color: Colors.grey[600], fontSize: 13),
                          ),
                        ],
                      ),
                      trailing: isSelected ? Icon(Icons.check_circle, color: Colors.green) : null,
                      onTap: () => _selectVoucher(voucher['code']),
                    ),
                  );
                }).toList(),
                SizedBox(height: 10),
                Align(
                  alignment: Alignment.center,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    icon: Icon(Icons.check_circle, color: Colors.white),
                    label: Text('Đồng ý'),
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.green,
                      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Icon close ở góc phải
          Positioned(
            right: 4,
            top: 4,
            child: IconButton(
              icon: Icon(Icons.close, color: Colors.grey[700]),
              onPressed: () => Navigator.of(context).pop(),
              tooltip: 'Đóng',
            ),
          ),
        ],
      ),
    );

  }

  @override
  void dispose() {
    _voucherController.dispose();
    super.dispose();
  }
}
