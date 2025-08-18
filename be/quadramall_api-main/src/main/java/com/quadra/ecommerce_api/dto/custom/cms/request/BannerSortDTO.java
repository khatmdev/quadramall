package com.quadra.ecommerce_api.dto.custom.cms.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BannerSortDTO {
    @NotNull(message = "ID không được để trống")
    private Long id;

    @NotNull(message = "Số thứ tự không được để trống")
    @Min(value = 0, message = "Số thứ tự phải là số không âm")
    private Integer displayOrder;
}
