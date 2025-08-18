package com.quadra.ecommerce_api.mapper.base.conversation;

import com.quadra.ecommerce_api.dto.base.conversation.MessageDTO;
import com.quadra.ecommerce_api.entity.conversation.Message;
import com.quadra.ecommerce_api.mapper.base.user.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ConversationMapper.class, UserMapper.class})
public interface MessageMapper {
    MessageDTO toDto(Message entity);
    Message toEntity(MessageDTO dto);
}
