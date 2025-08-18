package com.quadra.ecommerce_api.repository.cart;

import com.quadra.ecommerce_api.entity.cart.CartItemAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemAddonRepo extends JpaRepository<CartItemAddon, Long> {
    void deleteByCartItemId(Long cartItemId);
    List<CartItemAddon> findByCartItemId(Long cartItemId);
    Optional<CartItemAddon> findByCartItemIdAndAddonId(Long cartItemId, Long addonId);
}
