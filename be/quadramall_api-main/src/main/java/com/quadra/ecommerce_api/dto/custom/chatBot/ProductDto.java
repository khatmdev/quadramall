package com.quadra.ecommerce_api.dto.custom.chatBot;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.math.BigDecimal;

/**
 * Product Data Transfer Object
 * Represents product information returned from AI chat service
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProductDto(
        Long id,
        String name,
        String description,
        String category,
        String store,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer totalStock,
        String thumbnailUrl,
        String url,
        Double similarityScore,  // Score từ AI search
        Integer rank            // Thứ hạng trong kết quả search
) {
    // Builder pattern cho record (Java 14+)
    @Builder
    public ProductDto {}

    // Helper methods
    public boolean hasPrice() {
        return minPrice != null && minPrice.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean inStock() {
        return totalStock != null && totalStock > 0;
    }

    public String getFormattedPrice() {
        if (!hasPrice()) return "Liên hệ";

        if (maxPrice != null && !minPrice.equals(maxPrice)) {
            return String.format("%,.0f₫ - %,.0f₫",
                    minPrice.doubleValue(),
                    maxPrice.doubleValue());
        }
        return String.format("%,.0f₫", minPrice.doubleValue());
    }
}