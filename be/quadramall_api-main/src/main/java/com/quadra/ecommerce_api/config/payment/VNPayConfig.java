package com.quadra.ecommerce_api.config.payment;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Data
public class VNPayConfig {
    private String tmnCode;
    private String hashSecret;     // Khóa bí mật để tạo checksum
    private String url;
    private String returnUrl;      // URL mà VNPay trả về sau khi thanh toán
    private String ipnUrl;         // URL nhận thông báo server-to-server từ VNPay
}