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

    // Việc broadcast tin nhắn đã được ChatService xử lý (topic + user queues)
    // Nếu cần gửi thêm custom channel khác có thể bổ sung ở đây.

        // Tạo NotificationDTO đúng logic
        NotificationDTO notificationDTO = new NotificationDTO();
        // Logic: nếu receiverId > 1000 thì là store, ngược lại là user
        if (savedMessage.getReceiverId() > 1000) {
            notificationDTO.setStoreId(savedMessage.getReceiverId());
            notificationDTO.setUserId(null);
        } else {
            notificationDTO.setUserId(savedMessage.getReceiverId());
            notificationDTO.setStoreId(null);
        }
        notificationDTO.setContent("Tin nhắn mới từ user " + savedMessage.getSenderId());
        notificationDTO.setType("message");
        notificationDTO.setCreatedAt(savedMessage.getCreatedAt());
        notificationDTO.setRead(false);

        // Broadcast thông báo với path chuẩn
        messagingTemplate.convertAndSendToUser(
                String.valueOf(savedMessage.getReceiverId()),
                "/queue/notifications",
                notificationDTO
        );

        logger.info("Đã gửi tin nhắn và thông báo đến receiver {}", savedMessage.getReceiverId());
    }
}
