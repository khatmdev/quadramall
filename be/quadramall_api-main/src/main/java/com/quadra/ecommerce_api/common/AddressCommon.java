package com.quadra.ecommerce_api.common;

public class AddressCommon {
    public static String extractProvince(String address) {
        if (address == null || !address.contains(",")) {
            return null;
        }
        String[] parts = address.split(",");
        return parts[parts.length - 1].trim();
    }
}
