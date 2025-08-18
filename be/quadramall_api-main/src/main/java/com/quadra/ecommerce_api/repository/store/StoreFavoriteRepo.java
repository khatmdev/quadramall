package com.quadra.ecommerce_api.repository.store;


import com.quadra.ecommerce_api.entity.store.StoreFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreFavoriteRepo extends JpaRepository<StoreFavorite, Long> {

    boolean existsByUserIdAndStoreId(Long userId, Long storeId);

    Optional<StoreFavorite> findByUserIdAndStoreId(Long userId, Long storeId);

    @Query("SELECT COUNT(DISTINCT sf.user.id) FROM StoreFavorite sf WHERE sf.store.id = :storeId")
    long countDistinctUsersByStoreId(Long storeId);
}