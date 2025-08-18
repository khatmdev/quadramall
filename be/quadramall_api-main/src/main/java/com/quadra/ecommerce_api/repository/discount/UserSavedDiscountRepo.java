package com.quadra.ecommerce_api.repository.discount;

import com.quadra.ecommerce_api.entity.discount.UserSavedDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserSavedDiscountRepo extends JpaRepository<UserSavedDiscount, Long> {
    boolean existsByUserIdAndDiscountCodeId(Long userId, Long discountCodeId);
}
