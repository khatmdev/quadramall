package com.quadra.ecommerce_api.service.cms;

import com.quadra.ecommerce_api.dto.base.cms.BannerDTO;
import com.quadra.ecommerce_api.dto.custom.cms.request.BannerSortDTO;
import com.quadra.ecommerce_api.entity.cms.Banner;
import com.quadra.ecommerce_api.enums.redis.RedisCacheKey;
import com.quadra.ecommerce_api.exception.ResourceNotFound;
import com.quadra.ecommerce_api.mapper.base.cms.BannerMapper;
import com.quadra.ecommerce_api.repository.cms.BannerRepo;
import com.quadra.ecommerce_api.service.home.HomeService;
import com.quadra.ecommerce_api.utils.RedisCacheUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepo bannerRepo;
    private final BannerMapper bannerMapper;
    private final RedisCacheUtil redisCacheUtil;
    private final HomeService homeService;

    public List<BannerDTO> findAll() {
        Sort sort = Sort.by(
                Sort.Order.desc("active"),
                Sort.Order.asc("displayOrder"),
                Sort.Order.desc("updatedAt")
        );
        return bannerRepo.findAll(sort)
                .stream()
                .map(bannerMapper::toDto)
                .toList();
    }

    public BannerDTO findById(Long id) {
        Banner banner = bannerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Banner not found with id: " + id));
        return bannerMapper.toDto(banner);
    }

    @Transactional
    public BannerDTO create(BannerDTO dto) {
        if (Boolean.TRUE.equals(dto.getIsIntro())) {
            bannerRepo.findByIsIntroTrue().ifPresent(banner -> {
                banner.setIsIntro(false);
                bannerRepo.save(banner);
            });
        }

        Banner banner = bannerMapper.toEntity(dto);
        Banner savedBanner = bannerRepo.save(banner);

        // Xóa cache nếu cần
        if (Boolean.TRUE.equals(dto.getIsIntro())) {
            redisCacheUtil.delete(RedisCacheKey.HOME_INTRO.key());
        }
        redisCacheUtil.delete(RedisCacheKey.BANNERS_ACTIVE.key());

        return bannerMapper.toDto(savedBanner);
    }

    @Transactional
    public BannerDTO update(Long id, BannerDTO dto) {
        Banner existing = bannerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Banner not found with id: " + id));

        boolean wasIntro = Boolean.TRUE.equals(existing.getIsIntro());

        if (Boolean.TRUE.equals(dto.getIsIntro()) && !wasIntro) {
            bannerRepo.findByIsIntroTrue().ifPresent(banner -> {
                if (!banner.getId().equals(id)) {
                    banner.setIsIntro(false);
                    bannerRepo.save(banner);
                }
            });
        }

        bannerMapper.updateEntityFromDTO(dto, existing);
        Banner updatedBanner = bannerRepo.save(existing);

        // Xóa cache nếu ảnh hưởng đến intro
        if (wasIntro || Boolean.TRUE.equals(dto.getIsIntro())) {
            redisCacheUtil.delete(RedisCacheKey.HOME_INTRO.key());
        }
        redisCacheUtil.delete(RedisCacheKey.BANNERS_ACTIVE.key());

        return bannerMapper.toDto(updatedBanner);
    }

    @Transactional
    public void delete(Long id) {
        Banner banner = bannerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Banner not found with id: " + id));

        boolean wasIntro = Boolean.TRUE.equals(banner.getIsIntro());

        bannerRepo.delete(banner);

        redisCacheUtil.delete(RedisCacheKey.BANNERS_ACTIVE.key());
        if (wasIntro) {
            redisCacheUtil.delete(RedisCacheKey.HOME_INTRO.key());
        }
    }

    @Transactional
    public BannerDTO toggleActive(Long id) {
        Banner banner = bannerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Banner not found with id: " + id));

        banner.setActive(!Boolean.TRUE.equals(banner.getActive()));
        Banner updatedBanner = bannerRepo.save(banner);

        redisCacheUtil.delete(RedisCacheKey.BANNERS_ACTIVE.key());
        if (Boolean.TRUE.equals(banner.getIsIntro())) {
            redisCacheUtil.delete(RedisCacheKey.HOME_INTRO.key());
        }

        return bannerMapper.toDto(updatedBanner);
    }

    @Transactional
    public void reorder(List<BannerSortDTO> orders) {
        Map<Long, Integer> idToOrder = orders.stream()
                .collect(Collectors.toMap(BannerSortDTO::getId, BannerSortDTO::getDisplayOrder));

        List<Banner> banners = bannerRepo.findAllById(idToOrder.keySet());

        for (Banner banner : banners) {
            Integer newOrder = idToOrder.get(banner.getId());
            if (newOrder != null) {
                banner.setDisplayOrder(newOrder);
            }
        }

        bannerRepo.saveAll(banners);
        redisCacheUtil.delete(RedisCacheKey.BANNERS_ACTIVE.key());
    }

    @Transactional
    public BannerDTO makeIntro(Long id) {
        Banner banner = bannerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Banner not found with id: " + id));

        if (!Boolean.TRUE.equals(banner.getIsIntro())) {
            bannerRepo.findByIsIntroTrue().ifPresent(currentIntro -> {
                if (!currentIntro.getId().equals(id)) {
                    bannerRepo.clearIntroById(currentIntro.getId());
                }
            });
            banner.setIsIntro(true);
            bannerRepo.save(banner);
        }

        redisCacheUtil.delete(RedisCacheKey.HOME_INTRO.key());
        redisCacheUtil.delete(RedisCacheKey.BANNERS_ACTIVE.key());

        return bannerMapper.toDto(banner);
    }
}
