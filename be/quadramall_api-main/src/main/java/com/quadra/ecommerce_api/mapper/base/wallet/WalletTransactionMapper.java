package com.quadra.ecommerce_api.mapper.base.wallet;

import com.quadra.ecommerce_api.dto.base.wallet.WalletTransactionDTO;
import com.quadra.ecommerce_api.entity.wallet.WalletTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {WalletMapper.class})
public interface WalletTransactionMapper {
    @Mapping(source = "wallet", target = "walletDto")
    WalletTransactionDTO toDto(WalletTransaction entity);

    @Mapping(source = "walletDto", target = "wallet")
    WalletTransaction toEntity(WalletTransactionDTO dto);
}