// com.quadra.ecommerce_api.controller.notification.NotificationController.java
package com.quadra.ecommerce_api.controller.notification;

import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.notification.NotificationRepo;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepo repo;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<Notification>> getByUser(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(repo.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable));
    }

    @PostMapping("/read/{notificationId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal User user
    ) {
        Notification noti = repo.findById(notificationId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
        if (!noti.getUser().getId().equals(user.getId())) {
            throw new ExCustom(HttpStatus.FORBIDDEN, "Không có quyền truy cập thông báo");
        }
        notificationService.markAsRead(notificationId);
        System.out.println("Đã đọc: " + notificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        System.out.println("Đã đọc tất cả ");
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteNotifications(
            @RequestBody List<Long> notificationIds,
            @AuthenticationPrincipal User user
    ) {
        List<Notification> notifications = repo.findAllById(notificationIds);
        if (notifications.stream().anyMatch(noti -> !noti.getUser().getId().equals(user.getId()))) {
            throw new ExCustom(HttpStatus.FORBIDDEN, "Không có quyền xóa thông báo");
        }
        notificationService.deleteNotifications(notificationIds);
        return ResponseEntity.ok().build();
    }
}