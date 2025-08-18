package com.quadra.ecommerce_api.repository.shipping;

import com.quadra.ecommerce_api.entity.shipping.ShippingPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingPartnerRepo extends JpaRepository<ShippingPartner, Long> {
}
