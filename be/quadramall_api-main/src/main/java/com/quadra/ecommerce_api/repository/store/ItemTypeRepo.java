package com.quadra.ecommerce_api.repository.store;

import com.quadra.ecommerce_api.entity.store.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemTypeRepo extends JpaRepository<ItemType, Long> {
    Optional<ItemType> findBySlug(String slug);

    @Query("SELECT it FROM ItemType it WHERE it.isActive = true")
    List<ItemType> findAllActive();

    @Query("SELECT it FROM ItemType it WHERE it.parent.id = :parentId AND it.isActive = true")
    List<ItemType> findByParentId(Long parentId);

    boolean existsBySlug(String slug);

    @Query("SELECT it FROM ItemType it LEFT JOIN FETCH it.parent WHERE it.isActive = true")
    List<ItemType> findAllActiveWithParent();

    List<ItemType> findByParentIsNullAndIsActiveTrue();
}
