import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:overlay_support/overlay_support.dart';
import 'package:provider/provider.dart';
import 'package:quarda_mall_home_app/components/main_layout.dart';
import 'package:quarda_mall_home_app/components/shared/onboarding_screen.dart';
import 'package:quarda_mall_home_app/screens/login_screen.dart';
import 'package:quarda_mall_home_app/utils/tab_provider.dart';
import 'package:quarda_mall_home_app/utils/user_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
FlutterLocalNotificationsPlugin();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Cấu hình khởi tạo thông báo
  const AndroidInitializationSettings initializationSettingsAndroid =
  AndroidInitializationSettings('@mipmap/ic_launcher');

  const InitializationSettings initializationSettings =
  InitializationSettings(android: initializationSettingsAndroid);

  await flutterLocalNotificationsPlugin.initialize(initializationSettings);

  // Kiểm tra nếu lần đầu thì hiển thị Introduction
  final prefs = await SharedPreferences.getInstance();
  final bool isFirstLaunch = prefs.getBool('isFirstLaunch') ?? true;

  // Tạm thời bỏ qua OnboardingScreen để debug
  runApp(
    OverlaySupport.global(
      child: MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => UserProvider()),
          ChangeNotifierProvider(create: (_) => TabProvider()),
        ],
        child: MyApp(isFirstLaunch: false), // Bỏ qua OnboardingScreen
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  final bool isFirstLaunch;
  const MyApp({super.key, required this.isFirstLaunch});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quadra Mall',
      home: isFirstLaunch ? const OnboardingScreen() : const MainLayout(),
    );
  }
}