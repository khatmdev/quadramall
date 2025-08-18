package com.quadra.ecommerce_api.controller.chat;


import com.quadra.ecommerce_api.dto.ChatMessageDTO;
import com.quadra.ecommerce_api.dto.NotificationDTO;
import com.quadra.ecommerce_api.service.chat.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Tag(name = "Chat API", description = "API xử lý nhắn tin thời gian thực qua WebSocket")
@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO) {
        logger.info("Nhận tin nhắn từ user {} đến receiver {}",
                chatMessageDTO.getSenderId(), chatMessageDTO.getReceiverId());

        // Lưu tin nhắn và tạo notification qua ChatService
        ChatMessageDTO savedMessage = chatService.sendMessage(chatMessageDTO);

        // Broadcast tin nhắn đến receiver
        messagingTemplate.convertAndSendToUser(
                String.valueOf(savedMessage.getReceiverId()),
                "/queue/messages",
                savedMessage
        );

        // Tạo NotificationDTO
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setUserId(savedMessage.getReceiverId().equals(savedMessage.getSenderId()) ? null : savedMessage.getReceiverId());
        notificationDTO.setStoreId(savedMessage.getReceiverId().equals(savedMessage.getSenderId()) ? savedMessage.getReceiverId() : null);
        notificationDTO.setContent("Tin nhắn mới từ user " + savedMessage.getSenderId());
        notificationDTO.setType("message");
        notificationDTO.setCreatedAt(savedMessage.getCreatedAt());
        notificationDTO.setRead(false);

        // Broadcast thông báo
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + savedMessage.getReceiverId(),
                notificationDTO
        );

        logger.info("Đã gửi tin nhắn và thông báo đến receiver {}", savedMessage.getReceiverId());
    }
}
