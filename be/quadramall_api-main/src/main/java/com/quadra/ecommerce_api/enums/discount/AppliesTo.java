package com.quadra.ecommerce_api.enums.discount;

public enum AppliesTo {
    SHOP("Áp dụng cho toàn shop"),
    PRODUCTS("Áp dụng cho sản phẩm cụ thể");

    private final String description;

    AppliesTo(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}