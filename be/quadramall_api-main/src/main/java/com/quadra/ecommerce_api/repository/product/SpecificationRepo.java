package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecificationRepo extends JpaRepository<Specification, Long> {
    Optional<Specification> findByName(String name);
}
