package com.quadra.ecommerce_api.controller.chat;


import com.quadra.ecommerce_api.dto.ChatMessageDTO;
import com.quadra.ecommerce_api.dto.ConversationDTO;
import com.quadra.ecommerce_api.dto.NotificationDTO;
import com.quadra.ecommerce_api.service.chat.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Chat REST API", description = "API REST để quản lý tin nhắn và thông báo cho ứng dụng React")
@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    private static final Logger logger = LoggerFactory.getLogger(ChatRestController.class);

    private final ChatService chatService;

    public ChatRestController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Operation(summary = "Lấy danh sách tin nhắn theo cuộc trò chuyện",
            description = "Trả về danh sách tin nhắn trong một cuộc trò chuyện dựa trên ID cuộc trò chuyện")
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessagesByConversation(
            @Parameter(description = "ID của cuộc trò chuyện", example = "1")
            @PathVariable Long conversationId) {
        logger.info("Lấy danh sách tin nhắn cho cuộc trò chuyện {}", conversationId);
        List<ChatMessageDTO> messages = chatService.getMessagesByConversation(conversationId);
        return ResponseEntity.ok(messages);
    }

    @Operation(summary = "Lấy danh sách thông báo chưa đọc",
            description = "Trả về danh sách thông báo chưa đọc của user hoặc store")
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(
            @Parameter(description = "ID của người dùng, nếu có", example = "123", required = false)
            @RequestParam(required = false) Long userId,
            @Parameter(description = "ID của cửa hàng, nếu có", example = "456", required = false)
            @RequestParam(required = false) Long storeId) {
        logger.info("Lấy thông báo chưa đọc cho userId={} hoặc storeId={}", userId, storeId);
        List<NotificationDTO> notifications = chatService.getUnreadNotifications(userId, storeId);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Lấy hoặc tạo cuộc trò chuyện",
            description = "Tìm hoặc tạo mới một cuộc trò chuyện giữa khách hàng và cửa hàng")
    @GetMapping("/conversations")
    public ResponseEntity<ConversationDTO> getOrCreateConversation(
            @Parameter(description = "ID của khách hàng", example = "123")
            @RequestParam Long customerId,
            @Parameter(description = "ID của cửa hàng", example = "456")
            @RequestParam Long storeId) {
        logger.info("Tìm hoặc tạo cuộc trò chuyện giữa customerId={} và storeId={}", customerId, storeId);
        ConversationDTO conversation = chatService.getOrCreateConversation(customerId, storeId);
        return ResponseEntity.ok(conversation);
    }

    @Operation(summary = "Lấy danh sách cuộc trò chuyện của user",
            description = "Trả về danh sách tất cả cuộc trò chuyện mà user tham gia")
    @GetMapping("/user-conversations/{customerId}")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(
            @Parameter(description = "ID của khách hàng", example = "123")
            @PathVariable Long customerId) {
        logger.info("Lấy danh sách cuộc trò chuyện của customerId={}", customerId);
        List<ConversationDTO> conversations = chatService.getUserConversations(customerId);
        return ResponseEntity.ok(conversations);
    }

    @Operation(summary = "Đánh dấu thông báo đã đọc",
            description = "Đánh dấu một thông báo cụ thể đã được đọc")
    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @Parameter(description = "ID của thông báo", example = "1")
            @PathVariable Long notificationId) {
        logger.info("Đánh dấu thông báo {} đã đọc", notificationId);
        chatService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Gửi tin nhắn qua REST API",
            description = "Gửi tin nhắn mới qua REST API thay vì WebSocket")
    @PostMapping("/send-message")
    public ResponseEntity<ChatMessageDTO> sendMessageRest(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Thông tin tin nhắn cần gửi")
            @RequestBody ChatMessageDTO chatMessageDTO) {
        logger.info("Gửi tin nhắn REST từ user {} đến receiver {}",
                chatMessageDTO.getSenderId(), chatMessageDTO.getReceiverId());
        ChatMessageDTO savedMessage = chatService.sendMessage(chatMessageDTO);
        return ResponseEntity.ok(savedMessage);
    }

    @Operation(summary = "Lấy danh sách cuộc trò chuyện của cửa hàng",
            description = "Trả về danh sách tất cả cuộc trò chuyện của một cửa hàng")
    @GetMapping("/store-conversations/{storeId}")
    public ResponseEntity<List<ConversationDTO>> getStoreConversations(
            @Parameter(description = "ID của cửa hàng", example = "456")
            @PathVariable Long storeId) {
        logger.info("Lấy danh sách cuộc trò chuyện của storeId={}", storeId);
        List<ConversationDTO> conversations = chatService.getStoreConversations(storeId);
        return ResponseEntity.ok(conversations);
    }

    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc",
            description = "Đánh dấu tất cả thông báo của user/store đã được đọc")
    @PutMapping("/notifications/mark-all-read")
    public ResponseEntity<Void> markAllNotificationsAsRead(
            @Parameter(description = "ID của người dùng", required = false)
            @RequestParam(required = false) Long userId,
            @Parameter(description = "ID của cửa hàng", required = false)
            @RequestParam(required = false) Long storeId) {
        logger.info("Đánh dấu tất cả thông báo đã đọc cho userId={} hoặc storeId={}", userId, storeId);
        chatService.markAllNotificationsAsRead(userId, storeId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Xóa cuộc trò chuyện",
            description = "Xóa một cuộc trò chuyện và tất cả tin nhắn liên quan")
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @Parameter(description = "ID của cuộc trò chuyện", example = "1")
            @PathVariable Long conversationId) {
        logger.info("Xóa cuộc trò chuyện {}", conversationId);
        chatService.deleteConversation(conversationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Đếm số thông báo chưa đọc",
            description = "Đếm số lượng thông báo chưa đọc của user hoặc store")
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount(
            @Parameter(description = "ID của người dùng", required = false)
            @RequestParam(required = false) Long userId,
            @Parameter(description = "ID của cửa hàng", required = false)
            @RequestParam(required = false) Long storeId) {
        logger.info("Đếm thông báo chưa đọc cho userId={} hoặc storeId={}", userId, storeId);
        Long count = chatService.getUnreadNotificationCount(userId, storeId);
        return ResponseEntity.ok(count);
    }
}