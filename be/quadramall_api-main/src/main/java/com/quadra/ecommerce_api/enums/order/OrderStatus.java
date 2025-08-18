package com.quadra.ecommerce_api.enums.order;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("Chờ xử lý"),
    PROCESSING("Đang xử lý"),
    CONFIRMED_PREPARING("Đã xác nhận và đang chuẩn bị hàng"),
    ASSIGNED_TO_SHIPPER("Đã giao cho shipper"),
    PICKED_UP("Đã lấy hàng"),
    IN_TRANSIT("Đang vận chuyển"),
    DELIVERED("Đã giao hàng"),
    CONFIRMED("Đã xác nhận"),
    CANCELLED("Đã hủy"),
    RETURNED("Đã trả lại");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
