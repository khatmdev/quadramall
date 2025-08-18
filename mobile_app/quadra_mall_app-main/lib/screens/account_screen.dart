
import 'package:flutter/material.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen ({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [Text("Account")],
          ),
        ],
      ),
    );
  }
}