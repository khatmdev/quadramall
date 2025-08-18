package com.quadra.ecommerce_api.mapper.base.wallet;

import com.quadra.ecommerce_api.dto.base.wallet.WalletTransactionLogDTO;
import com.quadra.ecommerce_api.entity.wallet.WalletTransactionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WalletTransactionLogMapper {
    @Mapping(source = "walletTransaction.id", target = "walletTransactionId")
    WalletTransactionLogDTO toDto(WalletTransactionLog entity);

    @Mapping(source = "walletTransactionId", target = "walletTransaction.id")
    WalletTransactionLog toEntity(WalletTransactionLogDTO dto);
}