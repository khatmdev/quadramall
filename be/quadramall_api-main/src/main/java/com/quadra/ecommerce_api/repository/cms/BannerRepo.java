package com.quadra.ecommerce_api.repository.cms;

import com.quadra.ecommerce_api.entity.cms.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BannerRepo extends JpaRepository<Banner, Long> {
    // Tìm banner có isIntro = true
    Optional<Banner> findByIsIntroTrue();

    // Xóa isIntro cho banner cụ thể
    @Modifying
    @Query("UPDATE Banner b SET b.isIntro = false WHERE b.id = :id")
    void clearIntroById(Long id);

    List<Banner> findByActiveTrueOrderByDisplayOrderAsc();
}
