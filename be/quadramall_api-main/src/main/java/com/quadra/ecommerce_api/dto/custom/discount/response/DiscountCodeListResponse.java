package com.quadra.ecommerce_api.dto.custom.discount.response;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCodeListResponse {
    private List<DiscountCodeDTO> discountCodes;
    private Integer totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;

    // ✅ Thêm thông tin pagination hữu ích
    private Boolean hasNext;
    private Boolean hasPrevious;
    private Boolean isFirst;
    private Boolean isLast;

    // ✅ Builder pattern với default values
    public static class DiscountCodeListResponseBuilder {
        public DiscountCodeListResponseBuilder() {
            this.hasNext = false;
            this.hasPrevious = false;
            this.isFirst = true;
            this.isLast = true;
        }

        public DiscountCodeListResponseBuilder fromPage(org.springframework.data.domain.Page<?> page) {
            this.totalElements = (int) page.getTotalElements();
            this.totalPages = page.getTotalPages();
            this.currentPage = page.getNumber();
            this.pageSize = page.getSize();
            this.hasNext = page.hasNext();
            this.hasPrevious = page.hasPrevious();
            this.isFirst = page.isFirst();
            this.isLast = page.isLast();
            return this;
        }
    }
}