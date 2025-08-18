package com.quadra.ecommerce_api.dto.admin.response;


import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "DTO để admin xem chi tiết yêu cầu đăng ký cửa hàng")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSellerRegistrationResponseDto {

    @Schema(description = "ID của yêu cầu đăng ký", example = "1")
    private Long id;

    @Schema(description = "ID của người dùng gửi yêu cầu", example = "1")
    private Long userId;

    @Schema(description = "Email của người dùng gửi yêu cầu", example = "user@example.com")
    private String userEmail;

    @Schema(description = "Họ tên của người dùng gửi yêu cầu", example = "Nguyễn Văn A")
    private String userFullName;

    @Schema(description = "Số điện thoại người dùng gửi yêu cầu", example = "0829497199")
    private String userPhone;

    @Schema(description = "Tên cửa hàng", example = "Cửa hàng tuyệt vời")
    private String storeName;

    @Schema(description = "Thông tin lấy hàng", example = "Nguyễn Thanh Nhã , 0392459036 , 35/DD2 , Phường Tân Hưng Thuận , Quận 12 , Thành phố Hồ Chí Minh")
    private String address;

    @Schema(description = "Mô tả cửa hàng", example = "Cửa hàng bán đồ điện tử cao cấp")
    private String description;

    @Schema(description = "URL logo cửa hàng", example = "https://cloud.example.com/logo.png")
    private String logoUrl;

    @Schema(description = "URL giấy phép kinh doanh", example = "https://cloud.example.com/license.pdf")
    private String businessLicenseUrl;

    @Schema(description = "Danh sách URL ảnh CMND/CCCD (mặt trước và mặt sau)", example = "[\"https://cloud.example.com/idcard_front.png\", \"https://cloud.example.com/idcard_back.png\"]")
    private List<String> idCardUrl;

    @Schema(description = "Mã số thuế của cửa hàng", example = "1234567890")
    private String taxCode;

    @Schema(description = "Trạng thái yêu cầu đăng ký", example = "PENDING")
    private RegistrationStatus status;

    @Schema(description = "Lý do từ chối (nếu có)", example = "Giấy phép kinh doanh không hợp lệ")
    private String rejectionReason;

    @Schema(description = "Thời gian tạo yêu cầu", example = "2025-07-14T18:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Thời gian cập nhật yêu cầu", example = "2025-07-14T18:30:00")
    private LocalDateTime updatedAt;
}

