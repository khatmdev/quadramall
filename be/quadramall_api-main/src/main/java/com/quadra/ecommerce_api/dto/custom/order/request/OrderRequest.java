package com.quadra.ecommerce_api.dto.custom.order.request;

import lombok.Data;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class OrderRequest {
    private List<Long> orderIds;
    private Long addressId;
    private String shippingMethod;
    private String paymentMethod;
    private Map<Long,Long> voucherIds;
    private Map<Long,String> notes;

}
