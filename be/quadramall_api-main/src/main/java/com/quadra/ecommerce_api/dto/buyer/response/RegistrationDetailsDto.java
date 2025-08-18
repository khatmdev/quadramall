package com.quadra.ecommerce_api.dto.buyer.response;

import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationDetailsDto {
    private Long id;

    // Thông tin cửa hàng
    private String storeName;
    private String description;

    // Thông tin liên hệ (từ address - cần parse)
    private String address; // Địa chỉ đầy đủ
    private String pickupContactName;
    private String pickupContactPhone;
    private String specificAddress; // Địa chỉ cụ thể
    private String ward;
    private String district;
    private String city;

    // Thông tin user
    private String email;
    private String phone;

    // Thông tin thuế và documents
    private String taxCode;
    private String logoUrl;
    private String businessLicenseUrl;
    private List<String> idCardUrl;

    // Trạng thái và metadata
    private RegistrationStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
