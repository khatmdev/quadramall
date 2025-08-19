package com.quadra.ecommerce_api.service.chat;


import com.quadra.ecommerce_api.dto.ChatMessageDTO;
import com.quadra.ecommerce_api.dto.ConversationDTO;
import com.quadra.ecommerce_api.dto.NotificationDTO;
import com.quadra.ecommerce_api.entity.NotificationChat;
import com.quadra.ecommerce_api.entity.conversation.Conversation;
import com.quadra.ecommerce_api.entity.conversation.Message;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.mapper.ChatMapper;
import com.quadra.ecommerce_api.repository.conversation.ConversationRepo;
import com.quadra.ecommerce_api.repository.conversation.MessageRepo;
import com.quadra.ecommerce_api.repository.conversation.NotificationChatRepo;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepo conversationRepo;
    private final MessageRepo messageRepo;
    private final NotificationChatRepo notificationRepo;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatService(ConversationRepo conversationRepo, MessageRepo messageRepo,
                       NotificationChatRepo notificationRepo, ChatMapper chatMapper,
                       SimpMessagingTemplate messagingTemplate) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.notificationRepo = notificationRepo;
        this.chatMapper = chatMapper;
        this.messagingTemplate = messagingTemplate;
    }


    @Transactional
    public ChatMessageDTO sendMessage(ChatMessageDTO chatMessageDTO) {
        // Tìm hoặc tạo Conversation
        Conversation conversation = null;
        if (chatMessageDTO.getConversationId() != null) {
            conversation = conversationRepo.findById(chatMessageDTO.getConversationId())
                    .orElseThrow(() -> new IllegalArgumentException("Cuộc trò chuyện không tồn tại"));
        } else {
            conversation = conversationRepo.findByCustomerIdAndStoreId(
                            chatMessageDTO.getSenderId(), chatMessageDTO.getReceiverId())
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .customer(User.builder().id(chatMessageDTO.getSenderId()).build())
                                .store(Store.builder().id(chatMessageDTO.getReceiverId()).build())
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        return conversationRepo.save(newConv);
                    });
            chatMessageDTO.setConversationId(conversation.getId());
        }

        // Lưu Message
        Message message = chatMapper.toMessage(chatMessageDTO);
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false); // Đảm bảo luôn set isRead = false khi tạo mới
        messageRepo.save(message);

        // Tạo Notification
        Long receiverId = chatMessageDTO.getReceiverId();
        NotificationChat notification = NotificationChat.builder()
                .user(receiverId.equals(conversation.getCustomer().getId()) ? null : User.builder().id(receiverId).build())
                .store(receiverId.equals(conversation.getStore().getId()) ? null : Store.builder().id(receiverId).build())
                .content("Tin nhắn mới từ user " + chatMessageDTO.getSenderId())
                .type("message")
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepo.save(notification);

        // Trả về ChatMessageDTO
        chatMessageDTO.setId(message.getId());
        chatMessageDTO.setCreatedAt(message.getCreatedAt());
        
        // Broadcast realtime qua WebSocket
        broadcastMessage(chatMessageDTO);
        
        return chatMessageDTO;
    }

    public List<ChatMessageDTO> getMessagesByConversation(Long conversationId) {
        List<Message> messages = messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(message -> chatMapper.toChatMessageDTO(message, message.getSender().getId()))
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId, Long storeId) {
        List<NotificationChat> notifications;
        if (userId != null) {
            notifications = notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        } else if (storeId != null) {
            notifications = notificationRepo.findByStoreIdAndIsReadFalseOrderByCreatedAtDesc(storeId);
        } else {
            throw new IllegalArgumentException("Phải cung cấp userId hoặc storeId");
        }
        return notifications.stream()
                .map(chatMapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    public ConversationDTO getOrCreateConversation(Long customerId, Long storeId) {
        Conversation conversation = conversationRepo.findByCustomerIdAndStoreId(customerId, storeId)
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .customer(User.builder().id(customerId).build())
                            .store(Store.builder().id(storeId).build())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return conversationRepo.save(newConv);
                });
        return chatMapper.toConversationDTO(conversation);
    }

    public List<ConversationDTO> getUserConversations(Long customerId) {
        List<Conversation> conversations = conversationRepo.findByCustomerIdOrderByUpdatedAtDesc(customerId);
        return conversations.stream()
                .map(chatMapper::toConversationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        NotificationChat notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại"));
        notification.setRead(true);
        notificationRepo.save(notification);
    }

    public List<ConversationDTO> getStoreConversations(Long storeId) {
        List<Conversation> conversations = conversationRepo.findByStoreIdOrderByUpdatedAtDesc(storeId);
        return conversations.stream()
                .map(chatMapper::toConversationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAllNotificationsAsRead(Long userId, Long storeId) {
        List<NotificationChat> notifications;
        if (userId != null) {
            notifications = notificationRepo.findByUserIdAndIsReadFalse(userId);
        } else if (storeId != null) {
            notifications = notificationRepo.findByStoreIdAndIsReadFalse(storeId);
        } else {
            throw new IllegalArgumentException("Phải cung cấp userId hoặc storeId");
        }
        
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepo.saveAll(notifications);
    }

    @Transactional
    public void deleteConversation(Long conversationId) {
        Conversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Cuộc trò chuyện không tồn tại"));
        
        // Xóa tất cả tin nhắn trong cuộc trò chuyện
        messageRepo.deleteByConversationId(conversationId);
        
        // Xóa cuộc trò chuyện
        conversationRepo.delete(conversation);
    }

    public Long getUnreadNotificationCount(Long userId, Long storeId) {
        if (userId != null) {
            return (long) notificationRepo.findByUserIdAndIsReadFalse(userId).size();
        } else if (storeId != null) {
            return (long) notificationRepo.findByStoreIdAndIsReadFalse(storeId).size();
        } else {
            throw new IllegalArgumentException("Phải cung cấp userId hoặc storeId");
        }
    }

    /**
     * Broadcast tin nhắn realtime qua WebSocket
     */
    private void broadcastMessage(ChatMessageDTO message) {
    // 1. Broadcast theo conversation (mọi client mở cùng cuộc trò chuyện đều nhận được – không phụ thuộc Principal)
    if (message.getConversationId() != null) {
        messagingTemplate.convertAndSend(
            "/topic/conversations/" + message.getConversationId(),
            message
        );
    }

    // 2. Gửi tin nhắn đến receiver (nếu frontend có subscribe user queue và Principal được gán)
    messagingTemplate.convertAndSendToUser(
        String.valueOf(message.getReceiverId()),
        "/queue/messages",
        message
    );

    // 3. Gửi tin nhắn đến sender (để sync multi-device)
    messagingTemplate.convertAndSendToUser(
        String.valueOf(message.getSenderId()),
        "/queue/messages",
        message
    );
    }



}
