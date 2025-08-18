import 'package:flutter/material.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  bool _orderUpdates = true;
  bool _promotions = true;
  bool _news = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Cài đặt thông báo',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              SwitchListTile(
                title: const Text(
                  'Cập nhật đơn hàng',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                subtitle: const Text(
                  'Nhận thông báo về trạng thái đơn hàng',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                value: _orderUpdates,
                activeColor: Colors.green,
                onChanged: (value) {
                  setState(() {
                    _orderUpdates = value;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(value
                          ? 'Đã bật thông báo đơn hàng'
                          : 'Đã tắt thông báo đơn hàng'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
              ),
              Divider(height: 1, color: Colors.grey[200]),
              SwitchListTile(
                title: const Text(
                  'Khuyến mãi',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                subtitle: const Text(
                  'Nhận thông báo về ưu đãi và khuyến mãi',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                value: _promotions,
                activeColor: Colors.green,
                onChanged: (value) {
                  setState(() {
                    _promotions = value;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(value
                          ? 'Đã bật thông báo khuyến mãi'
                          : 'Đã tắt thông báo khuyến mãi'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
              ),
              Divider(height: 1, color: Colors.grey[200]),
              SwitchListTile(
                title: const Text(
                  'Tin tức',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
                subtitle: const Text(
                  'Nhận thông báo về tin tức và sự kiện',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                value: _news,
                activeColor: Colors.green,
                onChanged: (value) {
                  setState(() {
                    _news = value;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(value
                          ? 'Đã bật thông báo tin tức'
                          : 'Đã tắt thông báo tin tức'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}