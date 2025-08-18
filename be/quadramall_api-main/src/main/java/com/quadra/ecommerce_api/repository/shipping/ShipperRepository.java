package com.quadra.ecommerce_api.repository.shipping;

import com.quadra.ecommerce_api.entity.shipping.Shipper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipperRepository extends JpaRepository<Shipper, Long> {

    Optional<Shipper> findByUserId(Long userId);

    Optional<Shipper> findByShipperCode(String shipperCode);

    boolean existsByShipperCode(String shipperCode);

    List<Shipper> findByIsActiveTrue();

    @Query(
            value = "SELECT * FROM shippers s WHERE s.is_active = true AND JSON_CONTAINS(s.working_areas, :provinceCode, '$') = 1",
            nativeQuery = true
    )
    List<Shipper> findActiveShippersByProvince(@Param("provinceCode") String provinceCode);


    @Query("SELECT s FROM Shipper s WHERE s.isActive = true ORDER BY s.rating DESC, s.totalDeliveries DESC")
    Page<Shipper> findActiveShippersOrderByPerformance(Pageable pageable);

    @Query("SELECT COUNT(s) FROM Shipper s WHERE s.isActive = true")
    Long countActiveShippers();
}