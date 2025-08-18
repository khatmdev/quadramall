package com.quadra.ecommerce_api.controller.websocket;

import com.quadra.ecommerce_api.dto.custom.shipping.response.DeliveryTrackingDTO;
import com.quadra.ecommerce_api.service.shiping.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class DeliveryWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DeliveryService deliveryService;

    /**
     * Subscribe to delivery updates for a specific order
     */
    @MessageMapping("/delivery/subscribe")
    public void subscribeToDeliveryUpdates(@Payload Long orderId) {
        try {
            DeliveryTrackingDTO tracking = deliveryService.getDeliveryTracking(orderId);

            // Send current status to subscriber
            messagingTemplate.convertAndSend(
                    "/topic/delivery/" + orderId,
                    tracking
            );

            log.info("User subscribed to delivery updates for order {}", orderId);
        } catch (Exception e) {
            log.error("Error subscribing to delivery updates for order {}: {}", orderId, e.getMessage());
        }
    }

    /**
     * Send delivery update to all subscribers of an order
     */
    public void sendDeliveryUpdate(Long orderId, String message, Object data) {
        messagingTemplate.convertAndSend("/topic/delivery/" + orderId, data);
        log.info("Sent delivery update for order {}: {}", orderId, message);
    }

    /**
     * Send notification to shipper about new available orders
     */
    public void notifyShippersNewOrder(Long orderId) {
        messagingTemplate.convertAndSend("/topic/shipper/new-orders", orderId);
        log.info("Notified shippers about new order {}", orderId);
    }
}