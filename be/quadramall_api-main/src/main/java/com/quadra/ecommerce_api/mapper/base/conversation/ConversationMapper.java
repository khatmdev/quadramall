package com.quadra.ecommerce_api.mapper.base.conversation;

import com.quadra.ecommerce_api.dto.base.conversation.ConversationDTO;
import com.quadra.ecommerce_api.entity.conversation.Conversation;
import com.quadra.ecommerce_api.mapper.base.store.StoreMapper;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, StoreMapper.class})
public interface ConversationMapper {
    ConversationDTO toDto(Conversation entity);
    Conversation toEntity(ConversationDTO dto);
}
