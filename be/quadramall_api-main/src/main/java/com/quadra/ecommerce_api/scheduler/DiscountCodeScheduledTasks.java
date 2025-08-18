package com.quadra.ecommerce_api.scheduler;

import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DiscountCodeScheduledTasks {

    private final DiscountCodeRepository discountCodeRepository;

    /**
     * Tự động vô hiệu hóa các mã giảm giá hết hạn
     * Chạy mỗi giờ
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 ms
    public void deactivateExpiredDiscountCodes() {
        log.info("Starting scheduled task to deactivate expired discount codes");

        LocalDateTime now = LocalDateTime.now();
        List<DiscountCode> expiredCodes = discountCodeRepository
                .findDiscountCodesExpiringSoon(now.minusHours(1), now);

        int deactivatedCount = 0;
        for (DiscountCode discountCode : expiredCodes) {
            if (discountCode.getIsActive() && now.isAfter(discountCode.getEndDate())) {
                discountCode.setIsActive(false);
                discountCodeRepository.save(discountCode);
                deactivatedCount++;
                log.debug("Deactivated expired discount code: {}", discountCode.getCode());
            }
        }

        log.info("Completed scheduled task. Deactivated {} expired discount codes", deactivatedCount);
    }

    /**
     * Gửi thông báo về các mã giảm giá sắp hết hạn
     * Chạy mỗi ngày lúc 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void notifyExpiringSoonDiscountCodes() {
        log.info("Starting scheduled task to notify expiring soon discount codes");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);

        List<DiscountCode> expiringSoonCodes = discountCodeRepository
                .findDiscountCodesExpiringSoon(now, threeDaysLater);

        // TODO: Implement notification logic (email, push notification, etc.)
        log.info("Found {} discount codes expiring in the next 3 days", expiringSoonCodes.size());

        for (DiscountCode discountCode : expiringSoonCodes) {
            log.debug("Discount code '{}' expires at: {}",
                    discountCode.getCode(), discountCode.getEndDate());
            // TODO: Send notification to store owner
        }
    }
}