package com.quadra.ecommerce_api.mapper;

import com.quadra.ecommerce_api.dto.ChatMessageDTO;
import com.quadra.ecommerce_api.dto.ConversationDTO;
import com.quadra.ecommerce_api.dto.NotificationDTO;
import com.quadra.ecommerce_api.entity.conversation.Conversation;
import com.quadra.ecommerce_api.entity.conversation.Message;
import com.quadra.ecommerce_api.entity.NotificationChat;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    ChatMapper INSTANCE = Mappers.getMapper(ChatMapper.class);

    // Conversation ↔ ConversationDTO
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "store.id", target = "storeId")
    ConversationDTO toConversationDTO(Conversation conversation);

    @Mapping(source = "customerId", target = "customer.id")
    @Mapping(source = "storeId", target = "store.id")
    Conversation toConversation(ConversationDTO conversationDTO);

    // Message ↔ ChatMessageDTO
    @Mapping(source = "conversation.id", target = "conversationId")
    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "messageText", target = "messageText")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "videoUrl", target = "videoUrl")
    @Mapping(target = "receiverId", source = "conversation", qualifiedByName = "mapReceiverId")
    ChatMessageDTO toChatMessageDTO(Message message, @Context Long senderId);

    @Mapping(source = "conversationId", target = "conversation.id")
    @Mapping(source = "senderId", target = "sender.id")
    @Mapping(source = "messageText", target = "messageText")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "videoUrl", target = "videoUrl")
    Message toMessage(ChatMessageDTO chatMessageDTO);

    // Notification ↔ NotificationDTO
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "store.id", target = "storeId")
    NotificationDTO toNotificationDTO(NotificationChat notification);

    @Mapping(source = "userId", target = "user.id")
    @Mapping(source = "storeId", target = "store.id")
    NotificationChat toNotification(NotificationDTO notificationDTO);

    // Helper để suy ra receiverId từ Conversation
    @Named("mapReceiverId")
    default Long mapReceiverId(Conversation conversation, @Context Long senderId) {
        if (conversation == null || senderId == null) {
            return null;
        }
        return senderId.equals(conversation.getCustomer().getId())
                ? conversation.getStore().getId()
                : conversation.getCustomer().getId();
    }
}