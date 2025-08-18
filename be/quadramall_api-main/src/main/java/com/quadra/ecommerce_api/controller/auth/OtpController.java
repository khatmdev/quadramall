package com.quadra.ecommerce_api.controller.auth;

import com.quadra.ecommerce_api.service.auth.OtpEmailService;
import com.quadra.ecommerce_api.service.auth.RedisOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/otp")
public class OtpController {

    private final RedisOtpService redisOtpService;
    private final OtpEmailService otpEmailService;
    private final RedisTemplate<String, String> redisTemplate;

    @Autowired
    public OtpController(RedisOtpService redisOtpService, OtpEmailService otpEmailService, RedisTemplate<String, String> redisTemplate) {
        this.redisOtpService = redisOtpService;
        this.otpEmailService = otpEmailService;
        this.redisTemplate = redisTemplate;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendOtp(@RequestParam String email, @RequestParam String type) {
        String otp = redisOtpService.generateOtp();
        redisOtpService.storeOtp(email, type, otp, 5);
        otpEmailService.sendOtp(email, otp, type);
        return ResponseEntity.ok("OTP đã được gửi tới email.");
    }

    @PostMapping("/resend")
    public ResponseEntity<String> resendOtp(@RequestParam String email, @RequestParam String type) {
            String key = "register:pending:" + email;
            String serializedRequest = redisTemplate.opsForValue().get(key);
            if (serializedRequest == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
            }

        String otp = redisOtpService.generateOtp();
        redisOtpService.storeOtp(email, type, otp, 5);
        otpEmailService.sendOtp(email, otp, type);
        return ResponseEntity.ok("OTP đã được gửi lại tới email.");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String type, @RequestParam String otp) {
        boolean valid = redisOtpService.validateOtp(email, type, otp);
        if (valid) {
            redisOtpService.clearOtp(email, type);
            return ResponseEntity.ok("Xác minh OTP thành công.");
        } else {
            return ResponseEntity.badRequest().body("OTP không đúng hoặc đã hết hạn.");
        }
    }
}
