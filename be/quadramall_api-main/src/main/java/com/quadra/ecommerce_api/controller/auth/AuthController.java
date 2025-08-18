package com.quadra.ecommerce_api.controller.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.quadra.ecommerce_api.dto.custom.auth.response.ChangePasswordResponse;
import com.quadra.ecommerce_api.dto.custom.auth.response.LoginResponse;
import com.quadra.ecommerce_api.dto.custom.auth.response.RegisterResponse;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.ChangePasswordRequest;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.LoginRequest;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.RegisterRequest;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.ResetPasswordRequest;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.service.auth.AuthService;
import com.quadra.ecommerce_api.service.base.UserService;
import com.quadra.ecommerce_api.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String webClientId;

    @Autowired
    public AuthController(AuthService authService,
                          UserService userService,
                          JwtUtil jwtUtil) {
        this.authService = authService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse loginResponse = authService.login(request);
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Đăng nhập thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/refreshMe")
    public ResponseEntity<?> refreshMe(@AuthenticationPrincipal User user) {
        System.out.println(user);
        LoginResponse loginResponse = authService.getUserAndResponseLoginResponse(user);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, Errors errors) {
        if(errors.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message",errors.getFieldError().getDefaultMessage(),"isOk",false));
        }
        try {
            RegisterResponse registerResponse = authService.initiateRegister(request);
            if (registerResponse.isOk()) {
                return ResponseEntity.ok(registerResponse);
            }
            return ResponseEntity.badRequest().body(registerResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Đăng ký thất bại, vui lòng thử lại"));
        }
    }

    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyRegister(@RequestParam String email, @RequestParam String otp) {
        try {
            RegisterResponse registerResponse = authService.verifyRegister(email, otp);
            if (registerResponse.isOk()) {
                System.out.println("Đăng kí thành công "+registerResponse);
                return ResponseEntity.ok(registerResponse);
            }
            return ResponseEntity.badRequest().body(registerResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Xác minh OTP thất bại, vui lòng thử lại"));
        }
    }

    /*
        * Đăng nhập bằng google thì Spring Security tự động làm sau đó sẽ redirect tới endpoint này để xử lí.
        * Endpoint này trả về token cho người dùng.
    */
    @GetMapping("/oauth2/success")
    public void oauth2LoginSuccess(@AuthenticationPrincipal OAuth2User principal,
                                   HttpServletResponse response) throws IOException {
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String providerId = principal.getAttribute("sub");
        Boolean emailVerified = principal.getAttribute("email_verified");
        String picture = principal.getAttribute("picture");
        System.out.println("email: " + email);

        if (emailVerified != null && !emailVerified) {
            response.sendRedirect("http://localhost:5173/auth/error?message=Email%20chưa%20được%20xác%20minh");
            return;
        }

        try {
            LoginResponse loginResponse = authService.handleOAuth2Login(email, name, "google", providerId, picture);
            String redirectUrl = "http://localhost:5173/auth/success?token=" + loginResponse.getToken();
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            response.sendRedirect("http://localhost:5173/auth/error?message=" + e.getMessage());
        }
    }

    /*
     * Khi token hết hạn hãy cho front end gọi tới Endpoint này để lấy token mới nhờ vào refreshToken
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");

        Optional<User> userOpt = authService.getUserByRefreshToken(refreshToken);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid refresh token"));
        }

        User user = userOpt.get();
        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles());

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }


    /*  Dùng cho đăng nhập ở App    */
    @PostMapping("/google")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, Object> payload) {
        try {
            String idToken = (String) payload.get("idToken");
            String email = (String) payload.get("email");
            String name = (String) payload.get("displayName");
            String avatarUrl = (String) payload.get("photoUrl");
            String accessToken = (String) payload.get("accessToken");


            // Sử dụng Web Client ID duy nhất
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(webClientId)) // Chỉ dùng Web Client ID
                    .build();
            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid idToken"));
            }

            String providerId = googleIdToken.getPayload().getSubject();
            LoginResponse response = authService.handleOAuth2Login(email, name, "google", providerId, avatarUrl);
            System.out.println("Login response: "+response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Google login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");

        Optional<User> userOpt = authService.getUserByRefreshToken(refreshToken);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid refresh token"));
        }

        User user = userOpt.get();
        user.setRefreshToken(null);
        userService.save(user);
        System.out.println("USER : "+user.getId() +"  Đã đăng xuất thành công");

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            Map<String, String> response = authService.initiatePasswordReset(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Yêu cầu đặt lại mật khẩu thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request, Errors errors) {
        if (errors.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", errors.getFieldError().getDefaultMessage()));
        }
        try {
            Map<String, String> response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Đặt lại mật khẩu thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, Errors errors, @AuthenticationPrincipal User user) {
        if(user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
        }
        if (errors.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", errors.getFieldError().getDefaultMessage()));
        }
        try{
            ChangePasswordResponse response = authService.changePassword(user,request);
            return ResponseEntity.ok(response);
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message","Thay đổi mật khẩu thất bại"));
        }

    }

    @GetMapping("/OAuth2-user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
        }
        System.out.println(user);
        LoginResponse response = authService.getUserAndResponseLoginResponse(user);
        if (response == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-token")
    public ResponseEntity<LoginResponse> verifyToken(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }

        String token = authorizationHeader.substring(7);
        LoginResponse response = authService.verifyToken(token);
        return ResponseEntity.ok(response);
    }

}
