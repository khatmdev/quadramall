import 'package:flutter/material.dart';

class PaymentOption extends StatelessWidget {
  final String value;
  final String? groupValue;
  final ValueChanged<String?> onChanged;
  final String title;
  final String imageUrl;

  const PaymentOption({
    required this.value,
    required this.groupValue,
    required this.onChanged,
    required this.title,
    required this.imageUrl,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return Card(
      elevation: isSelected ? 4 : 2, // Bóng cao hơn khi được chọn
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isSelected ? Colors.green : Colors.grey[300]!, // Viền xanh khi chọn
          width: isSelected ? 2 : 1,
        ),
      ),
      margin: EdgeInsets.symmetric(vertical: 4),
      child: RadioListTile(
        value: value,
        groupValue: groupValue,
        onChanged: onChanged,
        controlAffinity: ListTileControlAffinity.leading,
        activeColor: Colors.green, // Màu của radio khi được chọn
        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 1),
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(4.0),
              child: Image.asset(
                imageUrl,
                width: 40, // Giảm kích thước logo để cân đối
                height: 40,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 40,
                    height: 40,
                    color: Colors.grey[300],
                    child: Icon(
                      Icons.broken_image,
                      color: Colors.grey,
                      size: 20,
                    ),
                  );
                },
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: isSelected ? Colors.green : Colors.black87,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}