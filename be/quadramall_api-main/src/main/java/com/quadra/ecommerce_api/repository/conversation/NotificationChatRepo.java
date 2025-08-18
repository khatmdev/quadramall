package com.quadra.ecommerce_api.repository.conversation;

import com.quadra.ecommerce_api.entity.NotificationChat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationChatRepo extends JpaRepository<NotificationChat, Long> {
    List<NotificationChat> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    List<NotificationChat> findByStoreIdAndIsReadFalseOrderByCreatedAtDesc(Long storeId);
    
    List<NotificationChat> findByUserIdAndIsReadFalse(Long userId);
    List<NotificationChat> findByStoreIdAndIsReadFalse(Long storeId);
}

