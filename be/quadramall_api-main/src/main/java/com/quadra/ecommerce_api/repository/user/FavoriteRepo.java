package com.quadra.ecommerce_api.repository.user;

import com.quadra.ecommerce_api.entity.user.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepo extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);
    Boolean existsByUserIdAndProductId(Long userId, Long productId);


    @Query("SELECT COUNT(DISTINCT f.user.id) FROM Favorite f WHERE f.product.store.id = :storeId")
    long countDistinctUsersByStoreId(Long storeId);
}
