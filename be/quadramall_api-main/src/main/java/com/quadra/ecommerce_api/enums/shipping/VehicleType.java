package com.quadra.ecommerce_api.enums.shipping;

public enum VehicleType {
    MOTORBIKE("Xe máy"),
    CAR("Ô tô"),
    BICYCLE("Xe đạp");

    private final String displayName;

    VehicleType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
