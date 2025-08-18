package com.quadra.ecommerce_api.enums.shipping;

public enum DeliveryStatus {
    AVAILABLE("Có thể nhận"),
    ASSIGNED("Đã phân công"),
    PICKED_UP("Đã lấy hàng"),
    IN_TRANSIT("Đang vận chuyển"),
    DELIVERED("Đã giao hàng"),
    CONFIRMED("Đã xác nhận"),
    CANCELLED("Đã hủy"),
    RETURNED("Đã trả lại");

    private final String displayName;

    DeliveryStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
