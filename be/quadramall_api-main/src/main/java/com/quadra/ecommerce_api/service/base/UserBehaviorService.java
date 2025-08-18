package com.quadra.ecommerce_api.service.base;

import com.quadra.ecommerce_api.dto.custom.user.request.BehaviorRequest;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.user.UserBehaviorLog;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.user.UserBehaviorLogRepo;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;

@Service
@RequiredArgsConstructor
public class UserBehaviorService {
    private final UserBehaviorLogRepo behaviorRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;
    private final KafkaTemplate<String, BehaviorRequest> kafkaTemplate;

    public void logBehavior(Long userId, Long productId, String behaviorType) {
        // Tìm User và Product
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFound("Product not found"));
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFound("User not found"));

        // Ghi vào user_behavior_log
        UserBehaviorLog log = UserBehaviorLog.builder()
                .user(user)
                .product(product)
                .behaviorType(behaviorType.toUpperCase())
                .build();
        behaviorRepo.save(log);

        // Gửi đến Kafka topic
        BehaviorRequest kafkaMessage = new BehaviorRequest();
        kafkaMessage.setProductId(productId);
        kafkaMessage.setBehaviorType(behaviorType.toUpperCase());
        kafkaTemplate.send("user_behaviors", String.valueOf(userId), kafkaMessage);
    }
}
