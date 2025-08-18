package com.quadra.ecommerce_api.mapper.base.payment;

import com.quadra.ecommerce_api.dto.base.payment.PaymentTransactionDTO;
import com.quadra.ecommerce_api.entity.payment.PaymentTransaction;
import com.quadra.ecommerce_api.mapper.base.order.OrderMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {OrderMapper.class})
public interface PaymentTransactionMapper {
    PaymentTransactionDTO toDto(PaymentTransaction entity);
    PaymentTransaction toEntity(PaymentTransactionDTO dto);
}

