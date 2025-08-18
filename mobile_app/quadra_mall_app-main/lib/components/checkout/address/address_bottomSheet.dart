import 'package:flutter/material.dart';

Future<void> showAddressFormBottomSheet({
  required BuildContext context,
  Map<String, dynamic>? existingAddress, // null = thêm mới
  required Function(Map<String, dynamic>) onSave,
}) async {
  final nameController = TextEditingController(text: existingAddress?['name'] ?? '');
  final phoneController = TextEditingController(text: existingAddress?['phone'] ?? '');
  final addressController = TextEditingController(text: existingAddress?['address'] ?? '');
  bool isDefault = existingAddress?['isMain'] ?? false;

  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) {
      return Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          top: 20,
          left: 20,
          right: 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                existingAddress == null ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 20),
              TextField(
                controller: nameController,
                decoration: InputDecoration(labelText: 'Họ tên người nhận'),
              ),
              SizedBox(height: 10),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(labelText: 'Số điện thoại'),
              ),
              SizedBox(height: 10),
              TextField(
                controller: addressController,
                maxLines: 2,
                decoration: InputDecoration(labelText: 'Địa chỉ nhận hàng'),
              ),
              SizedBox(height: 10),
              Row(
                children: [
                  Checkbox(
                    value: isDefault,
                    onChanged: (value) {
                      isDefault = value!;
                      // rebuild sheet to reflect UI change
                      Navigator.pop(context);
                      showAddressFormBottomSheet(
                        context: context,
                        existingAddress: {
                          'name': nameController.text,
                          'phone': phoneController.text,
                          'address': addressController.text,
                          'isMain': isDefault,
                        },
                        onSave: onSave,
                      );
                    },
                  ),
                  Text('Đặt làm mặc định'),
                ],
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  onSave({
                    'name': nameController.text,
                    'phone': phoneController.text,
                    'address': addressController.text,
                    'isMain': isDefault,
                  });
                  Navigator.pop(context);
                },
                child: Text('Lưu địa chỉ'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  minimumSize: Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              SizedBox(height: 20),
            ],
          ),
        ),
      );
    },
  );
}
