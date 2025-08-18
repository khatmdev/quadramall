package com.quadra.ecommerce_api.service.shiping;

import com.quadra.ecommerce_api.entity.notification.Notification;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.shipping.DeliveryAssignment;
import com.quadra.ecommerce_api.enums.notification.NotificationType;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.shipping.DeliveryAssignmentRepository;
import com.quadra.ecommerce_api.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliverySchedulerService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepo orderRepository;
    private final NotificationService notificationService;
    private final DeliveryNotificationService deliveryNotificationService;

    /**
     * Kiểm tra và xử lý các đơn hàng quá hạn giao hàng
     * Chạy mỗi 30 phút
     */
    @Scheduled(cron = "0 */30 * * * *")
    @Transactional
    public void checkOverdueDeliveries() {
        log.info("Checking for overdue deliveries...");

        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(2); // Quá hạn 2 tiếng

        List<DeliveryAssignment> overdueDeliveries = deliveryAssignmentRepository
                .findOverdueDeliveries(DeliveryStatus.IN_TRANSIT, cutoffTime);

        for (DeliveryAssignment assignment : overdueDeliveries) {
            // Gửi thông báo cảnh báo cho shipper
            if (assignment.getShipper() != null) {
                notificationService.sendNotification(
                        assignment.getShipper().getUser(),
                        NotificationType.ORDER_UPDATE,
                        "Đơn hàng quá hạn",
                        "Đơn hàng #" + assignment.getOrder().getId() + " đã quá thời gian giao hàng dự kiến",
                        assignment.getOrder().getId(),
                        Notification.Priority.HIGH,
                        Notification.Category.ORDER,
                        "⚠️"
                );
            }

            // Gửi thông báo cho khách hàng
            notificationService.sendNotification(
                    assignment.getOrder().getCustomer(),
                    NotificationType.ORDER_UPDATE,
                    "Đơn hàng chậm trễ",
                    "Đơn hàng #" + assignment.getOrder().getId() + " có thể sẽ giao muộn hơn dự kiến",
                    assignment.getOrder().getId(),
                    Notification.Priority.MEDIUM,
                    Notification.Category.ORDER,
                    "🕐"
            );
        }

        log.info("Found {} overdue deliveries", overdueDeliveries.size());
    }

    /**
     * Tự động hủy các đơn hàng không có shipper nhận sau 24 giờ
     * Chạy mỗi giờ
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoChancelUnassignedOrders() {
        log.info("Checking for unassigned orders to auto-cancel...");

        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);

        List<DeliveryAssignment> unassignedOrders = deliveryAssignmentRepository
                .findOverdueDeliveries(DeliveryStatus.AVAILABLE, cutoffTime);

        for (DeliveryAssignment assignment : unassignedOrders) {
            // Hủy assignment
            assignment.setStatus(DeliveryStatus.CANCELLED);
            assignment.setCancelledAt(LocalDateTime.now());
            assignment.setCancellationReason("Tự động hủy do không có shipper nhận trong 24 giờ");
            deliveryAssignmentRepository.save(assignment);

            // Hủy order
            Order order = assignment.getOrder();
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Gửi thông báo cho khách hàng
            notificationService.sendNotification(
                    order.getCustomer(),
                    NotificationType.ORDER_UPDATE,
                    "Đơn hàng bị hủy",
                    "Đơn hàng #" + order.getId() + " đã bị hủy do không có shipper nhận. Chúng tôi sẽ hoàn tiền cho bạn.",
                    order.getId(),
                    Notification.Priority.HIGH,
                    Notification.Category.ORDER,
                    "❌"
            );
        }

        log.info("Auto-cancelled {} unassigned orders", unassignedOrders.size());
    }

    /**
     * Gửi nhắc nhở cho shipper về các đơn hàng chưa lấy
     * Chạy mỗi 2 giờ trong giờ làm việc (8h-20h)
     */
    @Scheduled(cron = "0 0 8-20/2 * * *")
    public void remindShippersPickupOrders() {
        log.info("Sending pickup reminders to shippers...");

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);

        List<DeliveryAssignment> assignedOrders = deliveryAssignmentRepository
                .findOverdueDeliveries(DeliveryStatus.ASSIGNED, oneHourAgo);

        for (DeliveryAssignment assignment : assignedOrders) {
            if (assignment.getShipper() != null) {
                notificationService.sendNotification(
                        assignment.getShipper().getUser(),
                        NotificationType.ORDER_UPDATE,
                        "Nhắc nhở lấy hàng",
                        "Đơn hàng #" + assignment.getOrder().getId() + " đã được bạn nhận từ 1 giờ trước. Vui lòng đến lấy hàng.",
                        assignment.getOrder().getId(),
                        Notification.Priority.MEDIUM,
                        Notification.Category.ORDER,
                        "📦"
                );
            }
        }

        log.info("Sent pickup reminders for {} orders", assignedOrders.size());
    }

    /**
     * Thống kê hàng ngày và gửi report
     * Chạy vào 23:00 hàng ngày
     */
    @Scheduled(cron = "0 0 23 * * *")
    public void generateDailyReport() {
        log.info("Generating daily delivery report...");

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        // Thống kê số liệu trong ngày
        long totalOrders = deliveryAssignmentRepository.count();
        long completedToday = deliveryAssignmentRepository
                .findOverdueDeliveries(DeliveryStatus.CONFIRMED, startOfDay).size();
        long availableOrders = deliveryAssignmentRepository.countAvailableDeliveries();

        log.info("Daily Report - Total: {}, Completed Today: {}, Available: {}",
                totalOrders, completedToday, availableOrders);

        // Có thể gửi email report cho admin hoặc lưu vào database
    }

    /**
     * Tự động xác nhận giao hàng sau 7 ngày nếu khách hàng không xác nhận
     * Chạy mỗi ngày vào 2:00 sáng
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void autoConfirmDeliveries() {
        log.info("Auto-confirming old deliveries...");

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        List<DeliveryAssignment> deliveredOrders = deliveryAssignmentRepository
                .findOverdueDeliveries(DeliveryStatus.DELIVERED, sevenDaysAgo);

        for (DeliveryAssignment assignment : deliveredOrders) {
            // Tự động xác nhận
            assignment.setStatus(DeliveryStatus.CONFIRMED);
            assignment.setActualDelivery(assignment.getDeliveredAt());
            deliveryAssignmentRepository.save(assignment);

            // Cập nhật order status
            Order order = assignment.getOrder();
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Gửi thông báo
            notificationService.sendNotification(
                    order.getCustomer(),
                    NotificationType.ORDER_UPDATE,
                    "Đơn hàng tự động xác nhận",
                    "Đơn hàng #" + order.getId() + " đã được tự động xác nhận sau 7 ngày giao hàng.",
                    order.getId(),
                    Notification.Priority.LOW,
                    Notification.Category.ORDER,
                    "✅"
            );
        }

        log.info("Auto-confirmed {} deliveries", deliveredOrders.size());
    }
}