import 'package:flutter/material.dart';
import 'package:introduction_screen/introduction_screen.dart';
import 'package:lottie/lottie.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:quarda_mall_home_app/screens/login_screen.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  Future<void> _onIntroEnd(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isFirstLaunch', false);
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  PageDecoration _pageDecoration() => const PageDecoration(
    titleTextStyle: TextStyle(
      fontSize: 26,
      fontWeight: FontWeight.bold,
    ),
    bodyTextStyle: TextStyle(fontSize: 16),
    imagePadding: EdgeInsets.only(top: 20),
    contentMargin: EdgeInsets.all(16),
  );

  PageViewModel _buildPage({
    required String title,
    required String body,
    required String lottieAsset,
    Widget? footer,
  }) {
    return PageViewModel(
      title: title,
      body: body,
      image: Lottie.asset(lottieAsset, width: 250),
      decoration: _pageDecoration(),
      footer: footer,
    );
  }

  @override
  Widget build(BuildContext context) {
    return IntroductionScreen(
      pages: [
        _buildPage(
          title: "Chào mừng đến với Quadra Mall!",
          body: "Trải nghiệm mua sắm hiện đại và tiện lợi.",
          lottieAsset: 'assets/lottie/intro1.json',
        ),
        _buildPage(
          title: "Tiện ích mọi lúc",
          body: "Mua sắm, thanh toán, nhận hàng chỉ trong vài bước.",
          lottieAsset: 'assets/lottie/intro2.json',
        ),
        _buildPage(
          title: "Bắt đầu ngay!",
          body: "Đăng nhập để khám phá hàng ngàn sản phẩm.",
          lottieAsset: 'assets/lottie/intro3.json',
          footer: ElevatedButton(
            onPressed: () => _onIntroEnd(context),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text("Bắt đầu"),
          ),
        ),
      ],
      onDone: () => _onIntroEnd(context),
      onSkip: () => _onIntroEnd(context),
      showSkipButton: true,
      skip: const Text("Bỏ qua"),
      next: const Icon(Icons.arrow_forward),
      done: const Text("Hoàn tất"),
      dotsDecorator: const DotsDecorator(
        size: Size.square(10),
        activeSize: Size(22, 10),
        activeColor: Colors.green,
        color: Colors.black26,
        spacing: EdgeInsets.symmetric(horizontal: 4),
        activeShape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(25)),
        ),
      ),
    );
  }
}
