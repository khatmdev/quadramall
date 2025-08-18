package com.quadra.ecommerce_api.service.shiping;

import com.quadra.ecommerce_api.controller.websocket.DeliveryWebSocketController;
import com.quadra.ecommerce_api.dto.custom.shipping.response.DeliveryTrackingDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryNotificationService {

    private final DeliveryWebSocketController webSocketController;
    private final DeliveryService deliveryService;

    public void notifyDeliveryStatusUpdate(Long orderId, String status, String message) {
        try {
            DeliveryTrackingDTO tracking = deliveryService.getDeliveryTracking(orderId);
            webSocketController.sendDeliveryUpdate(orderId, message, tracking);
        } catch (Exception e) {
            log.error("Error sending delivery notification for order {}: {}", orderId, e.getMessage());
        }
    }

    public void notifyNewOrderAvailable(Long orderId) {
        webSocketController.notifyShippersNewOrder(orderId);
    }
}