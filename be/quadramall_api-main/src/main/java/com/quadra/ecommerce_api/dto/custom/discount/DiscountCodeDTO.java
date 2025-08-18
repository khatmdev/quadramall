package com.quadra.ecommerce_api.dto.custom.discount;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.quadra.ecommerce_api.enums.discount.AppliesTo;
import com.quadra.ecommerce_api.enums.discount.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCodeDTO {
    private Long id;
    private Long storeId;
    private String storeName;
    private Integer quantity;
    private Integer maxUses;
    private Integer usedCount;
    private Integer usagePerCustomer;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountValue;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;
    private AppliesTo appliesTo;
    private Boolean autoApply;
    private Integer priority;
    private Long createdBy;
    private String createdByName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Danh sách product IDs mà voucher áp dụng
    private List<Long> productIds;

    // Danh sách tên sản phẩm (optional, để hiển thị)
    private List<String> productNames;

    // Thêm field để frontend biết voucher áp dụng cho sản phẩm nào trong order
    private List<Long> applicableProductIds; // Chỉ những product trong order được áp dụng
}