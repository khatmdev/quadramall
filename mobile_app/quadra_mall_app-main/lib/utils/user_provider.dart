import 'package:flutter/material.dart';

class UserProvider with ChangeNotifier {
  Map<String, dynamic>? _userInfo;

  Map<String, dynamic>? get userInfo => _userInfo;

  void setUserInfo(Map<String, dynamic> userInfo) {
    _userInfo = userInfo;
    notifyListeners();
  }

  void clearUserInfo() {
    _userInfo = null;
    notifyListeners();
  }
}