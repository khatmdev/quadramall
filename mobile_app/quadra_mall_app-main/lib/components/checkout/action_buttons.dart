import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:quarda_mall_home_app/components/checkout/payment/payment_success.dart';
import 'package:quarda_mall_home_app/main.dart';

class ActionButtons extends StatelessWidget {
  const ActionButtons({Key? key}) : super(key: key);

  Future<void> showDelayedNotification() async {
    await Future.delayed(const Duration(seconds: 10));

    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'payment_channel',
      'Thông báo thanh toán',
      channelDescription: 'Thông báo khi thanh toán hoàn tất',
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const NotificationDetails notificationDetails =
    NotificationDetails(android: androidDetails);

    await flutterLocalNotificationsPlugin.show(
      0,
      'Thanh toán thành công!',
      'Đơn hàng của bạn đã được xử lý thành công và đang chờ đóng gói.',
      notificationDetails,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: Text('Hủy'),
            style: OutlinedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
        SizedBox(width: 10),
        Expanded(
          child: ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const PaymentSuccessScreen()),
              );
              // Future.delayed(Duration(seconds: 10), () {
              //   showNotification();
              // });
              showDelayedNotification();



            },
            child: Text('Thanh toán'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }
}