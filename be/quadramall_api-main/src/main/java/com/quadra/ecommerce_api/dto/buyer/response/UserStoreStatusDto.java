package com.quadra.ecommerce_api.dto.buyer.response;

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
public class UserStoreStatusDto {

    // Thông tin registration
    private Long registrationId;
    private String registrationStatus; // PENDING, APPROVED, REJECTED
    private String rejectionReason;
    private LocalDateTime registrationCreatedAt;

    // Thông tin stores (sau khi approve)
    private List<StoreInfo> stores;

    // Có đăng ký hay không
    private boolean hasRegistration;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreInfo {
        private Long storeId;
        private String storeName;
        private String storeStatus; // ACTIVE, INACTIVE, SUSPENDED
        private LocalDateTime createdAt;
    }
}