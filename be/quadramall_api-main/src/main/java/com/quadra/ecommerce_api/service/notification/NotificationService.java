// com.quadra.ecommerce_api.service.notification.NotificationService.java
package com.quadra.ecommerce_api.service.notification;

import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.notification.NotificationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepo repo;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    public void sendNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            Long refId,
            Notification.Priority priority,
            Notification.Category category,
            String icon
    ) {
        Notification noti = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(refId)
                .priority(priority)
                .category(category)
                .icon(icon)
                .build();
        repo.save(noti);
        messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", noti);
    }

    public void markAsRead(Long notificationId) {
        Notification noti = repo.findById(notificationId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
        if (!noti.isRead()) {
            noti.setRead(true);
            repo.save(noti);
            messagingTemplate.convertAndSendToUser(noti.getUser().getEmail(), "/queue/notifications", noti);
        }
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = repo.findByUserIdAndIsReadFalse(userId);
        notifications.forEach(noti -> {
            noti.setRead(true);
            messagingTemplate.convertAndSendToUser(noti.getUser().getEmail(), "/queue/notifications", noti);
        });
        repo.saveAll(notifications);
    }

    public void deleteNotifications(List<Long> notificationIds) {
        List<Notification> notifications = repo.findAllById(notificationIds);
        repo.deleteAll(notifications);
        // Gửi cập nhật qua WebSocket để frontend cập nhật danh sách
        notifications.forEach(noti ->
                messagingTemplate.convertAndSendToUser(noti.getUser().getEmail(), "/queue/notifications", noti));
    }
}