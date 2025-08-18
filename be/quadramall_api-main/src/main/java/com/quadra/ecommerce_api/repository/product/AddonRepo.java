package com.quadra.ecommerce_api.repository.product;

import com.quadra.ecommerce_api.entity.product.Addon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddonRepo extends JpaRepository<Addon, Long> {
    @Query("SELECT a FROM Addon a WHERE a.addonGroup.id = :addonGroupId AND a.active = true")
    List<Addon> findByAddonGroupIdAndIsActiveTrue(@Param("addonGroupId") Long addonGroupId);

    List<Addon> findByAddonGroupId(Long addonGroupId);

    @Modifying
    @Query("DELETE FROM Addon a WHERE a.addonGroup.id = :addonGroupId")
    void deleteByAddonGroupId(Long addonGroupId);
}
