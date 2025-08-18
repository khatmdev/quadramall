package com.quadra.ecommerce_api.service.admin.response;

import com.quadra.ecommerce_api.controller.admin.RejectSellerRegistrationRequestDto;
import com.quadra.ecommerce_api.dto.admin.response.AdminSellerRegistrationResponseDto;
import com.quadra.ecommerce_api.entity.store.SellerRegistration;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.Role;
import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import com.quadra.ecommerce_api.enums.store.StoreStatus;
import com.quadra.ecommerce_api.repository.store.SellerRegistrationRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.repository.user.RoleRepo;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSellerRegistrationService {

    private final SellerRegistrationRepo sellerRegistrationRepository;
    private final StoreRepo storeRepository;
    private final RoleRepo roleRepository;
    private final JavaMailSender mailSender;

    /**
     * Lấy danh sách yêu cầu đăng ký cửa hàng, có thể lọc theo trạng thái.
     * @param status Trạng thái để lọc (PENDING, APPROVED, REJECTED), có thể null để lấy tất cả.
     * @return Danh sách DTO chứa thông tin các yêu cầu đăng ký.
     * @throws IllegalArgumentException nếu trạng thái không hợp lệ.
     */
    public List<AdminSellerRegistrationResponseDto> getAllRegistrations(String status) {
        List<SellerRegistration> registrations;
        if (status != null && !status.isEmpty()) {
            try {
                RegistrationStatus registrationStatus = RegistrationStatus.valueOf(status.toUpperCase());
                registrations = sellerRegistrationRepository.findByStatus(registrationStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
            }
        } else {
            registrations = sellerRegistrationRepository.findAll();
        }
        return registrations.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Duyệt yêu cầu đăng ký cửa hàng, chuyển trạng thái sang APPROVED, gán role SELLER cho user,
     * tạo bản ghi cửa hàng mới trong bảng stores, và gửi email thông báo đến userEmail.
     * @param id ID của yêu cầu đăng ký.
     * @return DTO chứa thông tin yêu cầu đã được duyệt.
     * @throws IllegalArgumentException nếu yêu cầu không tồn tại, không ở trạng thái PENDING,
     * hoặc vai trò SELLER không tồn tại.
     */
    @Transactional
    public AdminSellerRegistrationResponseDto approveRegistration(Long id) {
        SellerRegistration registration = sellerRegistrationRepository.findByIdAndStatus(id, RegistrationStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu đăng ký không tồn tại hoặc không ở trạng thái PENDING"));

        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setRejectionReason(null);
        SellerRegistration updatedRegistration = sellerRegistrationRepository.save(registration);

        // Gán role SELLER cho user
        Role sellerRole = roleRepository.findByName("ROLE_SELLER")
                .orElseThrow(() -> new IllegalArgumentException("Vai trò SELLER không tồn tại"));
        registration.getUser().getRoles().add(sellerRole);
        sellerRegistrationRepository.save(registration); // Lưu lại để cập nhật mối quan hệ @ManyToMany

        // Tạo bản ghi trong bảng stores
        String slug = generateUniqueSlug(registration.getStoreName(), id);
        Store store = Store.builder()
                .owner(registration.getUser())
                .name(registration.getStoreName())
                .slug(slug)
                .address(registration.getAddress())
                .description(registration.getDescription())
                .logoUrl(registration.getLogoUrl())
                .status(StoreStatus.ACTIVE)
                .build();
        storeRepository.save(store);

        // Gửi email thông báo duyệt thành công đến userEmail
        sendEmail(
                registration.getUser().getEmail(),
                "Yêu cầu đăng ký cửa hàng được duyệt thành công",
                buildApprovalEmailContent(toDto(registration))
        );

        return toDto(updatedRegistration);
    }

    /**
     * Từ chối yêu cầu đăng ký cửa hàng, chuyển trạng thái sang REJECTED, lưu lý do từ chối,
     * và gửi email thông báo đến userEmail.
     * @param id ID của yêu cầu đăng ký.
     * @param requestDto DTO chứa lý do từ chối.
     * @return DTO chứa thông tin yêu cầu đã bị từ chối.
     * @throws IllegalArgumentException nếu yêu cầu không tồn tại hoặc không ở trạng thái PENDING.
     */
    @Transactional
    public AdminSellerRegistrationResponseDto rejectRegistration(Long id, RejectSellerRegistrationRequestDto requestDto) {
        SellerRegistration registration = sellerRegistrationRepository.findByIdAndStatus(id, RegistrationStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu đăng ký không tồn tại hoặc không ở trạng thái PENDING"));

        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setRejectionReason(requestDto.getRejectionReason());
        SellerRegistration updatedRegistration = sellerRegistrationRepository.save(registration);

        // Gửi email thông báo từ chối đến userEmail
        sendEmail(
                registration.getUser().getEmail(),
                "Yêu cầu đăng ký cửa hàng bị từ chối",
                buildRejectionEmailContent(toDto(registration), requestDto.getRejectionReason())
        );

        return toDto(updatedRegistration);
    }

    /**
     * Gửi email thông báo.
     * @param to Địa chỉ email người nhận (userEmail từ người đăng ký).
     * @param subject Tiêu đề email.
     * @param text Nội dung email.
     */
    private void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setRecipient(MimeMessage.RecipientType.TO, new InternetAddress(to));
            message.setSubject(subject);
            message.setText(text);
            message.setFrom(new InternetAddress("tavandat205@gmail.com", "QuadraMall"));
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo nội dung email thông báo duyệt thành công.
     * @param dto Thông tin yêu cầu đăng ký.
     * @return Nội dung email.
     */
    private String buildApprovalEmailContent(AdminSellerRegistrationResponseDto dto) {
        return String.format(
                "Chúc mừng! Yêu cầu đăng ký cửa hàng của bạn đã được duyệt thành công.\n\n" +
                        "Thông tin đăng ký:\n" +
                        "- Tên cửa hàng: %s\n" +
                        "- Tên chủ shop: %s\n" +
                        "- Email: %s\n" +
                        "- Số điện thoại: %s\n" +
                        "- Địa chỉ: %s\n" +
                        "- Mã số thuế: %s\n" +
                        "- Mô tả: %s\n" +
                        "- Ngày đăng ký: %s\n\n" +
                        "Bạn có thể bắt đầu quản lý cửa hàng trên hệ thống. Vui lòng đăng nhập để kiểm tra chi tiết.",
                dto.getStoreName(),
                dto.getUserFullName(),
                dto.getUserEmail(),
                dto.getUserPhone() != null ? dto.getUserPhone() : "Không có số điện thoại",
                dto.getAddress(),
                dto.getTaxCode(),
                dto.getDescription() != null ? dto.getDescription() : "Không có mô tả",
                formatDate(dto.getCreatedAt())
        );
    }

    /**
     * Tạo nội dung email thông báo từ chối.
     * @param dto Thông tin yêu cầu đăng ký.
     * @param rejectionReason Lý do từ chối.
     * @return Nội dung email.
     */
    private String buildRejectionEmailContent(AdminSellerRegistrationResponseDto dto, String rejectionReason) {
        return String.format(
                "Rất tiếc, yêu cầu đăng ký cửa hàng của bạn đã bị từ chối.\n\n" +
                        "Thông tin đăng ký:\n" +
                        "- Tên cửa hàng: %s\n" +
                        "- Tên chủ shop: %s\n" +
                        "- Email: %s\n" +
                        "- Số điện thoại: %s\n" +
                        "- Địa chỉ: %s\n" +
                        "- Mã số thuế: %s\n" +
                        "- Mô tả: %s\n" +
                        "- Ngày đăng ký: %s\n\n" +
                        "Lý do từ chối: %s\n\n" +
                        "Vui lòng kiểm tra và gửi lại yêu cầu nếu cần.",
                dto.getStoreName(),
                dto.getUserFullName(),
                dto.getUserEmail(),
                dto.getUserPhone() != null ? dto.getUserPhone() : "Không có số điện thoại",
                dto.getAddress(),
                dto.getTaxCode(),
                dto.getDescription() != null ? dto.getDescription() : "Không có mô tả",
                formatDate(dto.getCreatedAt()),
                rejectionReason
        );
    }

    /**
     * Định dạng LocalDateTime thành chuỗi.
     * @param dateTime Đối tượng LocalDateTime.
     * @return Chuỗi ngày giờ (dd/MM/yyyy HH:mm:ss).
     */
    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "Không xác định";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }

    /**
     * Chuyển đổi entity SellerRegistration sang DTO để trả về cho admin.
     * @param entity Entity SellerRegistration cần chuyển đổi.
     * @return DTO chứa thông tin yêu cầu đăng ký.
     */
    private AdminSellerRegistrationResponseDto toDto(SellerRegistration entity) {
        return AdminSellerRegistrationResponseDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .userEmail(entity.getUser().getEmail())
                .userFullName(entity.getUser().getFullName())
                .userPhone(entity.getUser().getPhone())
                .storeName(entity.getStoreName())
                .address(entity.getAddress())
                .description(entity.getDescription())
                .logoUrl(entity.getLogoUrl())
                .businessLicenseUrl(entity.getBusinessLicenseUrl())
                .idCardUrl(entity.getIdCardUrl())
                .taxCode(entity.getTaxCode())
                .status(entity.getStatus())
                .rejectionReason(entity.getRejectionReason())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Tạo slug duy nhất từ tên cửa hàng và ID yêu cầu đăng ký để sử dụng trong bảng stores.
     * @param name Tên cửa hàng.
     * @param id ID của yêu cầu đăng ký.
     * @return Slug duy nhất theo định dạng tên cửa hàng + ID (ví dụ: cua-hang-tuyet-voi-1).
     * @throws IllegalArgumentException nếu slug đã tồn tại trong bảng stores.
     */
    private String generateUniqueSlug(String name, Long id) {
        String baseSlug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("-+", "-").trim();
        String slug = baseSlug + "-" + id;
        if (storeRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Slug đã tồn tại: " + slug);
        }
        return slug;
    }

}