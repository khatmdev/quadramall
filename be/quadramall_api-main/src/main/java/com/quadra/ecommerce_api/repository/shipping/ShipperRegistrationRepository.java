package com.quadra.ecommerce_api.repository.shipping;


import com.quadra.ecommerce_api.entity.shipping.ShipperRegistration;
import com.quadra.ecommerce_api.enums.shipping.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipperRegistrationRepository extends JpaRepository<ShipperRegistration, Long> {

    Optional<ShipperRegistration> findByUserId(Long userId);

    boolean existsByUserIdAndStatus(Long userId, RegistrationStatus status);

    Page<ShipperRegistration> findByStatus(RegistrationStatus status, Pageable pageable);

    @Query("SELECT sr FROM ShipperRegistration sr WHERE sr.status = :status ORDER BY sr.createdAt ASC")
    Page<ShipperRegistration> findByStatusOrderByCreatedAtAsc(@Param("status") RegistrationStatus status, Pageable pageable);

    @Query("SELECT COUNT(sr) FROM ShipperRegistration sr WHERE sr.status = :status")
    Long countByStatus(@Param("status") RegistrationStatus status);
}