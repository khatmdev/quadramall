package com.quadra.ecommerce_api.service.auth;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.dto.base.user.RoleDTO;
import com.quadra.ecommerce_api.dto.custom.auth.response.ChangePasswordResponse;
import com.quadra.ecommerce_api.dto.custom.auth.response.LoginResponse;
import com.quadra.ecommerce_api.dto.custom.auth.response.RegisterResponse;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.ChangePasswordRequest;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.LoginRequest;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.RegisterRequest;
import com.quadra.ecommerce_api.dto.custom.auth.resquest.ResetPasswordRequest;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.Role;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import com.quadra.ecommerce_api.enums.user.UserStatus;
import com.quadra.ecommerce_api.mapper.base.user.RoleMapper;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.repository.user.RoleRepo;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import com.quadra.ecommerce_api.service.wallet.WalletService;
import com.quadra.ecommerce_api.utils.JwtUtil;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final StoreRepo storeRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final Cloudinary cloudinary;
    private final RoleMapper roleMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final OtpEmailService otpEmailService;
    private final RedisOtpService redisOtpService;
    private final ObjectMapper objectMapper;
    private final ResetTokenService resetTokenService;
    private final RateLimitService rateLimitService;
    private final JavaMailSenderImpl mailSender;
    private final WalletService walletService;



    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepo.findByEmail(loginRequest.getEmail());
        if (userOpt.isEmpty()) throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng.");
        User user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng.");
        }

        List<Long> storeIds = getStoreIds(user.getId());
        return getLoginResponse(user);
    }

    public LoginResponse handleOAuth2Login(String email, String name, String provider, String providerId, String avatarUrl) {
        Optional<User> existingLocalUser = userRepo.findByEmail(email);
        if (existingLocalUser.isPresent() && "local".equals(existingLocalUser.get().getProvider())) {
            String message = "Email này đã được sử dụng cho tài khoản local. Vui lòng đăng nhập bằng email và mật khẩu.";
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            throw new RuntimeException(encodedMessage);
        }
        Optional<User> userOpt = userRepo.findByProviderAndProviderId(provider, providerId);

        User user;
        if (userOpt.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setStatus(UserStatus.ACTIVE);

            if (!avatarUrl.isEmpty()) {
                try {
                    byte[] imageBytes = new URL(avatarUrl).openStream().readAllBytes();
                    Map uploadResult = cloudinary.uploader().upload(imageBytes, ObjectUtils.asMap(
                            "folder", "quadra_mall_profiles",
                            "public_id", providerId,
                            "overwrite", true
                    ));
                    user.setAvatarUrl(uploadResult.get("secure_url").toString());
                } catch (IOException e) {
                    user.setAvatarUrl("https://res.cloudinary.com/dy5ic99dp/image/upload/v1750503435/download_1_hutkln.png");
                    System.err.println("Failed to upload image to Cloudinary: " + e.getMessage());
                }
            }
            Set<Role> roles = new HashSet<>();
            Optional<Role> userRole = roleRepo.findByName("BUYER");
            userRole.ifPresent(roles::add);
            user.setRoles(roles);

            userRepo.save(user);
        } else {
            user = userOpt.get();
            if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
                try {
                    byte[] imageBytes = new URL(avatarUrl).openStream().readAllBytes();
                    Map uploadResult = cloudinary.uploader().upload(imageBytes, ObjectUtils.asMap(
                            "folder", "quadra_mall_profiles",
                            "public_id", providerId,
                            "overwrite", true
                    ));
                    user.setAvatarUrl(uploadResult.get("secure_url").toString());
                    userRepo.save(user);
                } catch (IOException e) {
                    System.err.println("Failed to update image on Cloudinary: " + e.getMessage());
                }
            }
        }

        List<Long> storeIds = getStoreIds(user.getId());
        return getLoginResponse(user);
    }

    public RegisterResponse initiateRegister(RegisterRequest request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            return new RegisterResponse("Email đã tồn tại trong hệ thống", false);
        }

        try {
            String key = "register:pending:" + request.getEmail();
            String serializedRequest = objectMapper.writeValueAsString(request);
            redisTemplate.opsForValue().set(key, serializedRequest, 10, TimeUnit.MINUTES);

            String otp = redisOtpService.generateOtp();
            redisOtpService.storeOtp(request.getEmail(), "register", otp, 5);
            otpEmailService.sendOtp(request.getEmail(), otp, "register");
            return new RegisterResponse("OTP đã được gửi tới email của bạn", true);
        } catch (Exception e) {
            return new RegisterResponse("Không thể gửi OTP, vui lòng thử lại", false);
        }
    }

    @Transactional
    public RegisterResponse verifyRegister(String email, String otp) {
        boolean isValidOtp = redisOtpService.validateOtp(email, "register", otp);
        if (!isValidOtp) {
            return new RegisterResponse("OTP không đúng hoặc đã hết hạn", false);
        }

        String key = "register:pending:" + email;
        String serializedRequest = redisTemplate.opsForValue().get(key);
        if (serializedRequest == null) {
            return new RegisterResponse("Phiên đăng ký đã hết hạn, vui lòng đăng ký lại", false);
        }

        try {
            RegisterRequest request = objectMapper.readValue(serializedRequest, RegisterRequest.class);

            User user = new User();
            user.setEmail(request.getEmail());
            user.setFullName(request.getFullName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setProvider("local");
            user.setProviderId(request.getEmail());
            user.setStatus(UserStatus.ACTIVE);
            user.setAvatarUrl("https://res.cloudinary.com/dy5ic99dp/image/upload/v1750503435/download_1_hutkln.png");

            Set<Role> roles = new HashSet<>();
            Optional<Role> userRole = roleRepo.findByName("ROLE_BUYER");
            userRole.ifPresent(roles::add);
            user.setRoles(roles);

            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setCurrency("VND");
            wallet.setCreatedAt(LocalDateTime.now());


            String refreshToken = UUID.randomUUID().toString();
            user.setRefreshToken(refreshToken);

            userRepo.save(user);

            walletService.save(wallet);

            redisTemplate.delete(key);
            redisOtpService.clearOtp(email, "register");

            return new RegisterResponse("Đăng ký thành công", true);
        } catch (Exception e) {
            return new RegisterResponse("Đăng ký thất bại, vui lòng thử lại", false);
        }
    }

    @Transactional
    public Map<String, String> initiatePasswordReset(String email) {
        if (!rateLimitService.isAllowed(email)) {
            return Map.of("message", "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
        }
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("message", "Liên kết đặt lại mật khẩu đã được gửi tới email " + email);
        }

        User user = userOpt.get();
        if (user.getProvider().equals("google")) {
            return Map.of("message", "Tài khoản này sử dụng đăng nhập bằng Google Account, không thể đặt lại mật khẩu. Vui lòng chọn đăng nhập bằng Google");
        }

        String resetToken = resetTokenService.generateResetToken();
        resetTokenService.storeResetToken(resetToken, email, 5);
        otpEmailService.sendResetLink(email, resetToken);

        return Map.of("message", "Liên kết đặt lại mật khẩu đã được gửi tới email " + email);
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        Optional<String> emailOpt = resetTokenService.getEmailByToken(request.getToken());
        if (emailOpt.isEmpty()) {
            return Map.of("message", "Token không hợp lệ hoặc đã hết hạn");
        }

        String email = emailOpt.get();
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("message", "Người dùng không tồn tại");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);

        resetTokenService.clearResetToken(request.getToken());
        otpEmailService.sendNotification(email, "Bạn vừa thay đổi mật khẩu thành công. Chúc bạn trải nghiệm mua sắm vui vẻ nhé!");

        return Map.of("message", "Đặt lại mật khẩu thành công");
    }

    @Transactional
    public ChangePasswordResponse changePassword(User user, ChangePasswordRequest request) {
        ChangePasswordResponse response;
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            response = new ChangePasswordResponse("Mật khẩu cũ không đúng", 400);
            return response;
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            response = new ChangePasswordResponse("Mật khẩu mới không được giống mật khẩu cũ", 400);
            return response;
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
        response = new ChangePasswordResponse("Thay đổi mật khẩu thành công", 200);
        return response;
    }

    public LoginResponse verifyToken(String token) {
        String userId = jwtUtil.validateTokenForUserId(token);
        if (userId == null) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
        }

        Optional<User> userOpt = userRepo.findById(Long.parseLong(userId));
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }

        User user = userOpt.get();
        List<Long> storeIds = getStoreIds(user.getId());
        return getLoginResponse(user);
    }

    private LoginResponse getLoginResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles());
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshToken(refreshToken);
        userRepo.save(user);
        Set<RoleDTO> roleDTOs = user.getRoles().stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toSet());

        List<Long> storeIds = getStoreIds(user.getId());
        return new LoginResponse(
                token,
                refreshToken,
                user.getProvider(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAvatarUrl(),
                roleDTOs,
                storeIds,
                user.getId() // Truyền userId vào response
        );
    }

    private List<Long> getStoreIds(Long userId) {
        List<Store> stores = storeRepo.findByOwnerId(userId);
        return stores.stream().map(Store::getId).collect(Collectors.toList());
    }

    public Optional<User> getUserByRefreshToken(String token) {
        return userRepo.findByRefreshToken(token);
    }

    public LoginResponse getUserAndResponseLoginResponse(User user) {
        Optional<User> checkUser = userRepo.findByEmail(user.getEmail());
        return checkUser.map(this::getLoginResponse).orElse(null);
    }
}