package com.quadra.ecommerce_api.repository.shipping;

import com.quadra.ecommerce_api.entity.shipping.DeliveryConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryConfirmationRepository extends JpaRepository<DeliveryConfirmation, Long> {

    Optional<DeliveryConfirmation> findByDeliveryAssignmentId(Long deliveryAssignmentId);

    Optional<DeliveryConfirmation> findByConfirmationCode(String confirmationCode);

    @Query("SELECT dc FROM DeliveryConfirmation dc " +
            "WHERE dc.deliveryAssignment.order.id = :orderId")
    Optional<DeliveryConfirmation> findByOrderId(@Param("orderId") Long orderId);

    boolean existsByConfirmationCode(String confirmationCode);
}
