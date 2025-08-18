package com.quadra.ecommerce_api.repository.shipping;

import com.quadra.ecommerce_api.entity.shipping.DeliveryAssignment;
import com.quadra.ecommerce_api.enums.shipping.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByOrderId(Long orderId);

    List<DeliveryAssignment> findByShipperIdAndStatus(Long shipperId, DeliveryStatus status);

    Page<DeliveryAssignment> findByShipperIdOrderByCreatedAtDesc(Long shipperId, Pageable pageable);

    @Query("SELECT da FROM DeliveryAssignment da WHERE da.status = 'AVAILABLE' " +
            "AND da.order.store.address LIKE %:province% " +
            "ORDER BY da.createdAt ASC")
    Page<DeliveryAssignment> findAvailableOrdersByProvince(@Param("province") String province, Pageable pageable);

    @Query("SELECT da FROM DeliveryAssignment da WHERE da.status = 'AVAILABLE' " +
            "ORDER BY da.createdAt ASC")
    Page<DeliveryAssignment> findAvailableOrders(Pageable pageable);

    @Query("SELECT COUNT(da) FROM DeliveryAssignment da WHERE da.shipper.id = :shipperId " +
            "AND da.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT')")
    Long countActiveDeliveriesByShipper(@Param("shipperId") Long shipperId);

    @Query("SELECT COUNT(da) FROM DeliveryAssignment da WHERE da.shipper.id = :shipperId " +
            "AND DATE(da.deliveredAt) = DATE(:date)")
    Long countDeliveriesByShipperAndDate(@Param("shipperId") Long shipperId, @Param("date") LocalDateTime date);

    @Query("SELECT COUNT(da) FROM DeliveryAssignment da WHERE da.status = 'AVAILABLE'")
    Long countAvailableDeliveries();

    @Query("SELECT da FROM DeliveryAssignment da WHERE da.status = :status " +
            "AND da.estimatedDelivery < :cutoffTime")
    List<DeliveryAssignment> findOverdueDeliveries(@Param("status") DeliveryStatus status,
                                                   @Param("cutoffTime") LocalDateTime cutoffTime);
}