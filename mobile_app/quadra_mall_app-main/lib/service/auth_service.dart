import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  static const String API_BASE_URL = 'http://10.0.2.2:8080/auth';

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    serverClientId: '1070252017723-0oratkop18uvjp94vbcr6emg9uooc56h.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
  );

  // Đăng nhập thông thường
  Future<AuthResult> loginWithEmailPassword(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$API_BASE_URL/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print(data);
        await _saveTokens(data);
        return AuthResult.success(data);
      } else {
        final error = jsonDecode(response.body);
        return AuthResult.failure(error['message'] ?? 'Đăng nhập thất bại');
      }
    } catch (e) {
      return AuthResult.failure('Lỗi kết nối: $e');
    }
  }

  // Đăng ký
  Future<AuthResult> register(String fullName, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$API_BASE_URL/register'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Register response from server: $data'); // Debug dữ liệu trả về
        return AuthResult.success(data);
      } else {
        final error = jsonDecode(response.body);
        return AuthResult.failure(error['message'] ?? 'Đăng ký thất bại');
      }
    } catch (e) {
      return AuthResult.failure('Lỗi kết nối: $e');
    }
  }

  // Đăng nhập với Google
  Future<AuthResult> loginWithGoogle() async {
    try {
      await _googleSignIn.signOut();
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        return AuthResult.failure('Đăng nhập bị hủy');
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final response = await http.post(
        Uri.parse('$API_BASE_URL/google'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'idToken': googleAuth.idToken,
          'accessToken': googleAuth.accessToken,
          'email': googleUser.email,
          'displayName': googleUser.displayName,
          'photoUrl': googleUser.photoUrl,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _saveTokens(data);
        print(getUserInfo());
        return AuthResult.success(data);
      } else {
        final error = jsonDecode(response.body);
        return AuthResult.failure(error['message'] ?? 'Đăng nhập Google thất bại');
      }
    } catch (e) {
      return AuthResult.failure('Lỗi đăng nhập Google: $e');
    }
  }

  // Đăng xuất
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refresh_token');
    await prefs.clear();
    await _googleSignIn.signOut();

    try {
      final response = await http.post(
        Uri.parse('$API_BASE_URL/logout'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'refreshToken': refreshToken ?? '',
        }),
      );

      if (response.statusCode == 200) {
        print("Logout successful");
      } else {
        print("Logout failed: ${response.body}");
      }
    } catch (e) {
      print("Logout error: $e");
    }
  }

  // Lưu tokens
  Future<void> _saveTokens(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    // Chỉ lưu token nếu dữ liệu có token (ví dụ: từ login hoặc Google login)
    if (data.containsKey('token') && data.containsKey('refreshToken')) {
      await prefs.setString('access_token', data['token'] ?? '');
      await prefs.setString('refresh_token', data['refreshToken'] ?? '');
      await prefs.setString('user_info', jsonEncode(data));
    }
  }

  // Lấy access token
  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  // Kiểm tra đã đăng nhập chưa
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  // Lấy thông tin user
  Future<Map<String, dynamic>?> getUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final userInfoString = prefs.getString('user_info');
    if (userInfoString != null) {
      return jsonDecode(userInfoString);
    }
    return null;
  }

  // Refresh token
  Future<bool> refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('refresh_token');

      if (refreshToken == null) return false;

      final response = await http.post(
        Uri.parse('$API_BASE_URL/auth/refresh'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'refreshToken': refreshToken,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _saveTokens(data);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

class AuthResult {
  final bool isSuccess;
  final String? errorMessage;
  final Map<String, dynamic>? data;

  AuthResult.success(this.data) : isSuccess = true, errorMessage = null;
  AuthResult.failure(this.errorMessage) : isSuccess = false, data = null;
}