package com.quadra.ecommerce_api.enums.discount;

public enum DiscountType {
    PERCENTAGE("Giảm theo phần trăm"),
    FIXED("Giảm số tiền cố định");

    private final String description;

    DiscountType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}