package com.quadra.ecommerce_api.dto.base.flashsale;

import lombok.Data;
import java.util.List;

@Data
public class FlashSalePageResponseDTO {
    private List<BuyerFlashSaleProductDTO> content;
    private long total;
}
