package com.quadra.ecommerce_api.repository.order;
import com.quadra.ecommerce_api.enums.order.OrderStatus;

import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {
    List<Order> findByStatusAndCustomer_Id(OrderStatus status, Long userId);
    List<Order> findByCustomer_Id(Long userId);
    Optional<Order> findById(Long orderId);

    List<Order> findByIdInAndCustomer_Id(List<Long> orderIds, Long id);
    List<Order> findByIdIn(List<Long> orderIds);

    // Add these new methods for order management
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    Page<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.store.id = :storeId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByStoreIdAndStatusOrderByCreatedAtDesc(
            @Param("storeId") Long storeId,
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    @Query("SELECT o FROM Order o WHERE o.store.id = :storeId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByStoreIdAndCreatedAtBetween(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(o) FROM Order o WHERE o.store.id = :storeId AND o.status = :status")
    long countByStoreIdAndStatus(@Param("storeId") Long storeId, @Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.store.id = :storeId AND o.status NOT IN ('CANCELLED', 'RETURNED')")
    Double getTotalRevenueByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.store.id = :storeId AND o.status NOT IN ('CANCELLED', 'RETURNED') AND o.createdAt >= :fromDate")
    Double getRevenueByStoreIdFromDate(@Param("storeId") Long storeId, @Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.store.owner.id = :userId")
    Optional<Order> findByIdAndStoreOwnerId(@Param("orderId") Long orderId, @Param("userId") Long userId);

    @Query("SELECT o FROM Order o WHERE o.id IN :orderIds AND o.store.id = :storeId")
    List<Order> findByIdsAndStoreId(@Param("orderIds") List<Long> orderIds, @Param("storeId") Long storeId);

    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    List<Order> findByStatusAndUpdatedAtBefore(OrderStatus orderStatus, LocalDateTime threshold);
}
