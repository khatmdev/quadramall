// com.quadra.ecommerce_api.service.conversation.MessageService.java
package com.quadra.ecommerce_api.service.conversation;

import com.quadra.ecommerce_api.entity.conversation.Message;
import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.repository.conversation.MessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepo repo;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    public Message sendMessage(Message message) {
        Message saved = repo.save(message);
        // Push realtime đến conversation
        messagingTemplate.convertAndSend("/chat/conversation/" + message.getConversation().getId(), saved);
        // Gửi thông báo cho user nếu cần
        messagingTemplate.convertAndSendToUser(
                message.getConversation().getCustomer().getEmail(),
                "/queue/notifications",
                buildNotification(message)
        );
        messagingTemplate.convertAndSendToUser(
                message.getConversation().getStore().getOwner().getEmail(),
                "/queue/notifications",
                buildNotification(message)
        );
        return saved;
    }

    public void markAsRead(Long messageId) {
        Message msg = repo.findById(messageId).orElseThrow();
        msg.setIsRead(true);
        repo.save(msg);
        // Push update read status nếu cần
    }

    private Notification buildNotification(Message message) {
        return Notification.builder()
                .user(message.getSender())
                .type(NotificationType.MESSAGE)
                .title("Tin nhắn mới")
                .message("Bạn có tin nhắn mới từ " + message.getSender().getFullName())
                .referenceId(message.getConversation().getId())
                .priority(Notification.Priority.HIGH)
                .category(Notification.Category.MESSAGE)
                .icon("💬")
                .build();
    }
}