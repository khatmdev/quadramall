package com.quadra.ecommerce_api.mapper.base.wallet;

import com.quadra.ecommerce_api.dto.base.wallet.WalletDTO;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface WalletMapper {
    WalletDTO toDto(Wallet entity);
    Wallet toEntity(WalletDTO dto);
}