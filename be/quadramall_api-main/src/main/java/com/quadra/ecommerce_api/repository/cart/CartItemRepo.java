package com.quadra.ecommerce_api.repository.cart;

import com.quadra.ecommerce_api.entity.cart.CartItem;
import com.quadra.ecommerce_api.entity.cart.CartItemAddon;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    @Query("SELECT c FROM CartItem c WHERE c.user.id = :userId AND c.variant.id = :variantId")
    Optional<CartItem> findByUserIdAndVariantId(@Param("userId") Long userId, @Param("variantId") Long variantId);

    @Query("SELECT c FROM CartItem c WHERE c.user.id = :userId")
    List<CartItem> findByUserId(@Param("userId") Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    /*
    *    Kiểm tra Có tồn tại cartItem không và trả về Đầy đủ CartItem để tiến hành tạo đơn hàng
    */
    List<CartItem> findByIdInAndUserId(List<Long> cartItemIds, Long userId);

    // Query tối ưu: Tìm cart_items của user với variant_id trong list từ order_items của orderIds
    @Query("SELECT ci FROM CartItem ci " +
            "WHERE ci.user.id = :userId " +
            "AND ci.variant.id IN (SELECT oi.variant.id FROM OrderItem oi " +
            "WHERE oi.order.id IN :orderIds AND oi.order.customer.id = :userId)")
    List<CartItem> findCartItemsByUserAndOrderIds(@Param("userId") Long userId, @Param("orderIds") List<Long> orderIds);



}
