package com.quadra.ecommerce_api.service.auth;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class OtpEmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String toEmail, String otp, String type) {
        String subject = switch (type) {
            case "register" -> "Mã OTP xác minh đăng ký tài khoản";
            case "forgot" -> "Mã OTP khôi phục mật khẩu";
            case "payment" -> "Mã OTP xác thực thanh toán";
            default -> "Mã OTP";
        };

        String content = "Mã OTP của bạn là: " + otp + "\nMã này có hiệu lực trong 5 phút.";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);

            // 👇 Đây là dòng quan trọng — đổi tên người gửi:
            helper.setFrom(new InternetAddress("tavandat205@gmail.com", "QuadraMall"));

            helper.setSubject(subject);
            helper.setText(content, false);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Gửi email thất bại", e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo địa chỉ email", e);
        }
    }

    public void sendResetLink(String toEmail, String resetToken) {
        String subject = "Đặt lại mật khẩu tài khoản QuadraMall";
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;
        String content = "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:\n" +
                resetUrl + "\nLiên kết này có hiệu lực trong 5 phút.";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setFrom(new InternetAddress("tavandat205@gmail.com", "QuadraMall"));
            helper.setSubject(subject);
            helper.setText(content, false);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Gửi email đặt lại mật khẩu thất bại", e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo địa chỉ email", e);
        }
    }

    public void sendNotification(String toEmail, String content) {
        String subject = "QuadraMall - Bạn vừa thay đổi mật khẩu thành công.";
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setFrom(new InternetAddress("tavandat205@gmail.com", "QuadraMall"));
            helper.setSubject(subject);
            helper.setText(content, false);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Gửi email đặt lại mật khẩu thất bại", e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo địa chỉ email", e);
        }

    }
}
