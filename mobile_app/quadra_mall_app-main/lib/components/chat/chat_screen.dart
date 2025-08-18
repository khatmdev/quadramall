import 'package:flutter/material.dart';

class Message {
  final String sender;
  final String content;
  final DateTime timestamp;
  final bool isCustomer;

  Message({
    required this.sender,
    required this.content,
    required this.timestamp,
    required this.isCustomer,
  });
}

class ChatScreen extends StatefulWidget {
  final String shopName;

  const ChatScreen({Key? key, required this.shopName}) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Message> _messages = [
    Message(
      sender: "Lenovo ThinkPad",
      content: "Knock! Knock! Có ưu đãi dành cho bạn nè, ghé gian hàng của tui mình xem nha!",
      timestamp: DateTime.now().subtract(Duration(minutes: 1)),
      isCustomer: false,
    ),
  ];

  void _sendMessage() {
    if (_messageController.text.isNotEmpty) {
      setState(() {
        _messages.add(
          Message(
            sender: "Customer",
            content: _messageController.text,
            timestamp: DateTime.now(),
            isCustomer: true,
          ),
        );
        _messageController.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.shopName),
        foregroundColor: Colors.white,
        backgroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(Icons.storefront),
            onPressed: () {
              // Navigator.push(context, MaterialPageRoute(builder: (_) => const ShopScreen()))
            },
          ),
          IconButton(
            icon: Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(8.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return Align(
                  alignment: message.isCustomer
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: EdgeInsets.symmetric(vertical: 4.0),
                    padding: EdgeInsets.all(10.0),
                    decoration: BoxDecoration(
                      color: message.isCustomer ? Colors.blue : Colors.grey[300],
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: Column(
                      crossAxisAlignment: message.isCustomer
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
                      children: [
                        Text(
                          message.sender,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: message.isCustomer ? Colors.white : Colors.black,
                          ),
                        ),
                        SizedBox(height: 4.0),
                        Text(
                          message.content,
                          style: TextStyle(
                            color: message.isCustomer ? Colors.white : Colors.black,
                          ),
                        ),
                        SizedBox(height: 4.0),
                        Text(
                          "${message.timestamp.hour}:${message.timestamp.minute}",
                          style: TextStyle(
                            fontSize: 10.0,
                            color: message.isCustomer ? Colors.white70 : Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: "Nhập tin nhắn của bạn...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20.0),
                      ),
                      filled: true,
                      fillColor: Colors.grey[200],
                    ),
                  ),
                ),
                SizedBox(width: 8.0),
                IconButton(
                  icon: Icon(Icons.send, color: Colors.blue, size: 30,),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}