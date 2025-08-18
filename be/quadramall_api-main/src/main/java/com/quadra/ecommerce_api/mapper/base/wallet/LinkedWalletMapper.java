package com.quadra.ecommerce_api.mapper.base.wallet;

import com.quadra.ecommerce_api.dto.base.wallet.LinkedWalletDTO;
import com.quadra.ecommerce_api.entity.wallet.LinkedWallet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LinkedWalletMapper {
    @Mapping(source = "user.id", target = "userId")
    LinkedWalletDTO toDto(LinkedWallet entity);

    @Mapping(source = "userId", target = "user.id")
    LinkedWallet toEntity(LinkedWalletDTO dto);
}