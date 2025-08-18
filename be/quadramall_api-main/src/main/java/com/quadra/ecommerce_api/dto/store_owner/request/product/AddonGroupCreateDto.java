package com.quadra.ecommerce_api.dto.store_owner.request.product;

import lombok.Data;

import java.util.List;

@Data
public class AddonGroupCreateDto {
    private String name;              // Tên nhóm addon
    private int maxChoice;            // Số lượng tối đa có thể chọn
    private List<AddonCreateDto> addons; // Danh sách addon trong nhóm
}
