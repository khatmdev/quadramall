import 'package:flutter/material.dart';
import 'chat_screen.dart'; // Import the existing ChatScreen

class Shop {
  final String name;
  final String logoUrl;
  final String lastMessage;
  final DateTime lastMessageTime;

  Shop({
    required this.name,
    required this.logoUrl,
    required this.lastMessage,
    required this.lastMessageTime,
  });
}

class ShopListScreen extends StatelessWidget {
  final List<Shop> shops = [
    Shop(
      name: "Lenovo ThinkPad",
      logoUrl: "https://example.com/lenovo_logo.png",
      lastMessage: "Knock! Knock! Có ưu đãi dành cho bạn nè, ghé gian hàng của tui mình xem nha!",
      lastMessageTime: DateTime.now().subtract(Duration(minutes: 1)),
    ),
    Shop(
      name: "XiaoZHUBANGCHU",
      logoUrl: "https://example.com/xiaozhubangchu_logo.png",
      lastMessage: "",
      lastMessageTime: DateTime.now().subtract(Duration(minutes: 5)),
    ),
    Shop(
      name: "HANGDIAN Shopping Mall",
      logoUrl: "https://example.com/hangdian_logo.png",
      lastMessage: "Knock! Knock! Có ưu đãi dành cho bạn nè, ghé gian hàng của tui mình xem nh...",
      lastMessageTime: DateTime.now().subtract(Duration(hours: 1)),
    ),
    Shop(
      name: "MiSunderstood40Jfty0ftyft",
      logoUrl: "https://example.com/misunderstood_logo.png",
      lastMessage: "",
      lastMessageTime: DateTime.parse("2025-05-31 14:30"),
    ),
    Shop(
      name: "Xiaomi undefined",
      logoUrl: "https://example.com/xiaomi_logo.png",
      lastMessage: "Gửi bạn đó! Sản phẩm này cũng là món dđược yêu thích và đánh giá cao bởi nhiều người mua...",
      lastMessageTime: DateTime.parse("2025-05-31 14:30"),
    ),
    Shop(
      name: "Hanoi Bookstore",
      logoUrl: "https://example.com/hanoi_bookstore_logo.png",
      lastMessage: "Gửi bạn đó! Sản phẩm này được người mua đánh giá 5.0★ Xem chi tiết hoạt động khuyến mãi thêm ...",
      lastMessageTime: DateTime.parse("2025-05-30 14:30"),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.white,
        title: Text("Trò chuyện"),
        backgroundColor: Colors.black,
      ),
      body: ListView.builder(
        itemCount: shops.length,
        itemBuilder: (context, index) {
          final shop = shops[index];
          return ListTile(
            leading: CircleAvatar(
              backgroundImage: NetworkImage(shop.logoUrl),
              onBackgroundImageError: (e, s) => Icon(Icons.store),
            ),
            title: Text(
              shop.name,
              style: TextStyle(color: Colors.black),
            ),
            subtitle: Text(
              shop.lastMessage.isNotEmpty
                  ? shop.lastMessage
                  : "[Gian hàng chính hãng]",
              style: TextStyle(color: Colors.grey),
              overflow: TextOverflow.ellipsis,
            ),
            trailing: Text(
              shop.lastMessageTime.day == DateTime.now().day
                  ? "${shop.lastMessageTime.hour}:${shop.lastMessageTime.minute}"
                  : "${shop.lastMessageTime.day}/${shop.lastMessageTime.month}/${shop.lastMessageTime.year}",
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChatScreen(shopName: shop.name),
                ),
              );
            },
          );
        },
      ),
    );
  }
}