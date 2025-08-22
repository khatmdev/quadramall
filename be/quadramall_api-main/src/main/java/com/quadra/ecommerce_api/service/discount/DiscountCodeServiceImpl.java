package com.quadra.ecommerce_api.service.discount;

import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.custom.discount.request.ApplyDiscountRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.CreateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.request.UpdateDiscountCodeRequest;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCalculationResponse;
import com.quadra.ecommerce_api.dto.custom.discount.response.DiscountCodeListResponse;
import com.quadra.ecommerce_api.entity.discount.DiscountCode;
import com.quadra.ecommerce_api.entity.discount.DiscountUsageHistory;
import com.quadra.ecommerce_api.entity.discount.UserDiscount;
import com.quadra.ecommerce_api.entity.discount.UserDiscountId;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.discount.AppliesTo;
import com.quadra.ecommerce_api.enums.discount.DiscountType;
import com.quadra.ecommerce_api.exception.voucher.BusinessException;
import com.quadra.ecommerce_api.exception.voucher.ResourceNotFoundException;
import com.quadra.ecommerce_api.mapper.base.discount.DiscountCodeMapper;
import com.quadra.ecommerce_api.repository.discount.DiscountCodeRepository;
import com.quadra.ecommerce_api.repository.discount.DiscountUsageHistoryRepository;
import com.quadra.ecommerce_api.repository.discount.UserDiscountRepository;
import com.quadra.ecommerce_api.repository.order.OrderRepo;
import com.quadra.ecommerce_api.repository.product.ProductRepo;
import com.quadra.ecommerce_api.repository.store.StoreRepo;
import com.quadra.ecommerce_api.repository.user.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DiscountCodeServiceImpl implements DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;
    private final UserDiscountRepository userDiscountRepository;
    private final DiscountUsageHistoryRepository discountUsageHistoryRepository;
    private final StoreRepo storeRepository;
    private final UserRepo userRepository;
    private final ProductRepo productRepository;
    private final OrderRepo orderRepository;
    private final DiscountCodeMapper discountCodeMapper;

    @Override
    public DiscountCodeDTO createDiscountCode(CreateDiscountCodeRequest request, Long createdBy) {
        log.info("Creating discount code with code: {} for store: {}", request.getCode(), request.getStoreId());

        // Validation
        validateCreateDiscountCodeRequest(request);

        // Check if store exists
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cửa hàng"));

        // Check if created by user exists
        User creator = userRepository.findById(createdBy)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người tạo"));

        // Check Store có phải của USER đó không
        if (!storeRepository.existsByIdAndOwnerId(store.getId(), createdBy))
            throw new ResourceNotFoundException("Không phải cửa hàng của bạn");

        // Check duplicate code
        if (discountCodeRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Mã giảm giá đã tồn tại");
        }

        // Build discount code entity
        DiscountCode discountCode = DiscountCode.builder()
                .store(store)
                .quantity(request.getQuantity())
                .maxUses(request.getMaxUses())
                .usagePerCustomer(request.getUsagePerCustomer())
                .code(request.getCode())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountValue(request.getMaxDiscountValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .appliesTo(request.getAppliesTo())
                .autoApply(request.getAutoApply())
                .priority(request.getPriority())
                .createdBy(creator)
                .isActive(true)
                .usedCount(0)
                .build();

        // Set products if applies to specific products
        if (request.getAppliesTo() == AppliesTo.PRODUCTS && request.getProductIds() != null) {
            List<Product> products = productRepository.findAllById(request.getProductIds());
            if (products.size() != request.getProductIds().size()) {
                throw new BusinessException("Một số sản phẩm không tồn tại");
            }

            // Check if all products belong to the same store
            boolean allProductsBelongToStore = products.stream()
                    .allMatch(product -> product.getStore().getId().equals(request.getStoreId()));
            if (!allProductsBelongToStore) {
                throw new BusinessException("Tất cả sản phẩm phải thuộc cùng một cửa hàng");
            }

            discountCode.setProducts(products);
        }

        DiscountCode savedDiscountCode = discountCodeRepository.save(discountCode);
        log.info("Discount code created successfully with ID: {}", savedDiscountCode.getId());

        return discountCodeMapper.toDto(savedDiscountCode);
    }

    @Override
    public DiscountCodeDTO updateDiscountCode(Long discountCodeId, UpdateDiscountCodeRequest request, Long updatedBy) {
        log.info("Updating discount code with ID: {}", discountCodeId);

        DiscountCode discountCode = discountCodeRepository.findById(discountCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá"));

        // Kiểm tra quyền sở hữu store
        if (!storeRepository.existsByIdAndOwnerId(discountCode.getStore().getId(), updatedBy)) {
            throw new BusinessException("Bạn không có quyền sửa mã giảm giá này");
        }

        // Update fields if provided
        if (request.getDescription() != null) {
            discountCode.setDescription(request.getDescription());
        }
        if (request.getDiscountValue() != null) {
            discountCode.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinOrderAmount() != null) {
            discountCode.setMinOrderAmount(request.getMinOrderAmount());
        }
        if (request.getMaxDiscountValue() != null) {
            discountCode.setMaxDiscountValue(request.getMaxDiscountValue());
        }
        if (request.getStartDate() != null) {
            discountCode.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            discountCode.setEndDate(request.getEndDate());
        }
        if (request.getAutoApply() != null) {
            discountCode.setAutoApply(request.getAutoApply());
        }
        if (request.getPriority() != null) {
            discountCode.setPriority(request.getPriority());
        }
        if (request.getIsActive() != null) {
            discountCode.setIsActive(request.getIsActive());
        }

        // Update products if provided and applies to products
        if (request.getProductIds() != null && discountCode.getAppliesTo() == AppliesTo.PRODUCTS) {
            List<Product> products = productRepository.findAllById(request.getProductIds());
            // Validate products belong to same store
            boolean allProductsBelongToStore = products.stream()
                    .allMatch(product -> product.getStore().getId().equals(discountCode.getStore().getId()));
            if (!allProductsBelongToStore) {
                throw new BusinessException("Tất cả sản phẩm phải thuộc cùng một cửa hàng");
            }
            discountCode.setProducts(products);
        }

        DiscountCode updatedDiscountCode = discountCodeRepository.save(discountCode);
        log.info("Discount code updated successfully with ID: {}", updatedDiscountCode.getId());

        return discountCodeMapper.toDto(updatedDiscountCode);
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCodeDTO getDiscountCodeById(Long discountCodeId) {
        log.info("Getting discount code by ID: {}", discountCodeId);

        DiscountCode discountCode = discountCodeRepository.findById(discountCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá"));

        return discountCodeMapper.toDto(discountCode);
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCodeListResponse getDiscountCodesByStore(Long storeId, Pageable pageable) {
        log.info("Getting discount codes for store: {} with page: {}, size: {}",
                storeId, pageable.getPageNumber(), pageable.getPageSize());

        // ✅ ĐÚNG: Sử dụng Page<DiscountCode> từ repository
        Page<DiscountCode> discountCodesPage = discountCodeRepository
                .findByStoreIdOrderByCreatedAtDesc(storeId, pageable);

        log.debug("Found {} discount codes for store {}", discountCodesPage.getTotalElements(), storeId);

        // ✅ Map Entity sang DTO
        List<DiscountCodeDTO> discountCodeDTOs = discountCodesPage.getContent().stream()
                .map(discountCodeMapper::toDto)
                .collect(Collectors.toList());

        // ✅ Tạo response với pagination info chính xác
        return DiscountCodeListResponse.builder()
                .discountCodes(discountCodeDTOs)
                .totalElements((int) discountCodesPage.getTotalElements())
                .totalPages(discountCodesPage.getTotalPages())
                .currentPage(discountCodesPage.getNumber())
                .pageSize(discountCodesPage.getSize())
                .hasNext(discountCodesPage.hasNext())
                .hasPrevious(discountCodesPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCodeListResponse searchDiscountCodes(Long storeId, String keyword, Pageable pageable) {
        log.info("Searching discount codes for store: {} with keyword: {}", storeId, keyword);

        // ✅ ĐÚNG: Sử dụng Page<DiscountCode> từ repository
        Page<DiscountCode> discountCodesPage = discountCodeRepository
                .searchDiscountCodes(storeId, keyword, pageable);

        // ✅ Map Entity sang DTO
        List<DiscountCodeDTO> discountCodeDTOs = discountCodesPage.getContent().stream()
                .map(discountCodeMapper::toDto)
                .collect(Collectors.toList());

        // ✅ Tạo response với pagination info chính xác
        return DiscountCodeListResponse.builder()
                .discountCodes(discountCodeDTOs)
                .totalElements((int) discountCodesPage.getTotalElements())
                .totalPages(discountCodesPage.getTotalPages())
                .currentPage(discountCodesPage.getNumber())
                .pageSize(discountCodesPage.getSize())
                .hasNext(discountCodesPage.hasNext())
                .hasPrevious(discountCodesPage.hasPrevious())
                .build();
    }

    @Override
    public void deleteDiscountCode(Long discountCodeId, Long deletedBy) {
        log.info("Deleting discount code with ID: {} by user: {}", discountCodeId, deletedBy);

        DiscountCode discountCode = discountCodeRepository.findById(discountCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá"));

        // Kiểm tra quyền sở hữu store
        if (!storeRepository.existsByIdAndOwnerId(discountCode.getStore().getId(), deletedBy)) {
            throw new BusinessException("Bạn không có quyền xóa mã giảm giá này");
        }

        // Soft delete by setting isActive to false
        discountCode.setIsActive(false);
        discountCodeRepository.save(discountCode);

        log.info("Discount code with ID: {} has been deleted by user: {}", discountCodeId, deletedBy);
    }

    @Override
    public void toggleDiscountCodeStatus(Long discountCodeId, Boolean isActive, Long updatedBy) {
        log.info("Toggling discount code status - ID: {}, isActive: {}, updatedBy: {}",
                discountCodeId, isActive, updatedBy);

        DiscountCode discountCode = discountCodeRepository.findById(discountCodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá"));

        // Kiểm tra quyền sở hữu store
        if (!storeRepository.existsByIdAndOwnerId(discountCode.getStore().getId(), updatedBy)) {
            throw new BusinessException("Bạn không có quyền thay đổi trạng thái mã giảm giá này");
        }

        discountCode.setIsActive(isActive);
        discountCodeRepository.save(discountCode);

        log.info("Discount code with ID: {} status changed to: {} by user: {}",
                discountCodeId, isActive, updatedBy);
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCalculationResponse applyDiscountCode(ApplyDiscountRequest request) {
        log.info("=== STARTING APPLY DISCOUNT CODE ===");
        log.info("Request: {}", request);
        log.info("Discount Code: {}", request.getDiscountCode());
        log.info("Store ID: {}", request.getStoreId());
        log.info("User ID: {}", request.getUserId());
        log.info("Order Amount: {}", request.getOrderAmount());
        log.info("Product IDs: {}", request.getProductIds());

        // Find discount code
        DiscountCode discountCode = discountCodeRepository.findByCodeAndActive(request.getDiscountCode())
                .orElse(null);

        if (discountCode == null) {
            log.error("❌ Discount code not found or inactive: {}", request.getDiscountCode());
            return DiscountCalculationResponse.builder()
                    .success(false)
                    .message("Mã giảm giá không tồn tại hoặc đã hết hiệu lực")
                    .discountCode(request.getDiscountCode())
                    .originalAmount(request.getOrderAmount())
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .build();
        }

        log.info("✅ Found discount code: {}", discountCode);
        log.info("Discount details - ID: {}, Store: {}, Type: {}, Value: {}",
                discountCode.getId(),
                discountCode.getStore().getId(),
                discountCode.getDiscountType(),
                discountCode.getDiscountValue());
        log.info("Applies to: {}, Min order: {}, Max discount: {}",
                discountCode.getAppliesTo(),
                discountCode.getMinOrderAmount(),
                discountCode.getMaxDiscountValue());
        log.info("Start date: {}, End date: {}", discountCode.getStartDate(), discountCode.getEndDate());
        log.info("Used count: {}/{}, Usage per customer: {}",
                discountCode.getUsedCount(),
                discountCode.getMaxUses(),
                discountCode.getUsagePerCustomer());

        // Validate discount code
        String validationError = checkDiscountCodeUsability(
                request.getDiscountCode(),
                request.getStoreId(),
                request.getProductIds(),
                request.getUserId(),
                request.getOrderAmount()
        );

        if (validationError != null) {
            log.error("❌ Validation failed: {}", validationError);
            return DiscountCalculationResponse.builder()
                    .success(false)
                    .message(validationError)
                    .discountCode(request.getDiscountCode())
                    .originalAmount(request.getOrderAmount())
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .build();
        }

        log.info("✅ Validation passed");

        // Calculate discount
        BigDecimal discountAmount = discountCode.calculateDiscountAmount(request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);

        log.info("💰 Discount calculation - Original: {}, Discount: {}, Final: {}",
                request.getOrderAmount(), discountAmount, finalAmount);

        DiscountCalculationResponse response = DiscountCalculationResponse.builder()
                .success(true)
                .message("Áp dụng mã giảm giá thành công")
                .discountCode(request.getDiscountCode())
                .originalAmount(request.getOrderAmount())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .discountDescription(discountCode.getDescription())
                .build();

        log.info("=== DISCOUNT APPLY SUCCESS ===");
        return response;
    }


    @Override
    @Transactional(readOnly = true)
    public List<DiscountCodeDTO> getApplicableDiscountCodes(Long storeId, List<Long> productIds, Long userId) {
        log.info("Getting applicable discount codes for store: {}, user: {}, products: {}",
                storeId, userId, productIds);

        LocalDateTime currentTime = LocalDateTime.now();
        List<DiscountCode> applicableDiscountCodes = discountCodeRepository
                .findAllValidDiscountCodes(storeId, productIds != null ? productIds : List.of(), currentTime);

        return applicableDiscountCodes.stream()
                .filter(dc -> {
                    int userUsageCount = userDiscountRepository
                            .countUserDiscountUsage(dc.getId(), userId);
                    return dc.canUserUse(userUsageCount);
                })
                .map(discountCodeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCalculationResponse getAutoBestDiscount(Long storeId, List<Long> productIds,
                                                           Long userId, BigDecimal orderAmount) {
        log.info("Finding auto best discount for store: {}, user: {}, amount: {}", storeId, userId, orderAmount);

        LocalDateTime currentTime = LocalDateTime.now();
        List<DiscountCode> autoApplyDiscountCodes = discountCodeRepository
                .findAutoApplyDiscountCodes(storeId, productIds != null ? productIds : List.of(), currentTime);

        DiscountCode bestDiscount = null;
        BigDecimal maxDiscountAmount = BigDecimal.ZERO;

        for (DiscountCode discountCode : autoApplyDiscountCodes) {
            // Check if user can use this discount
            int userUsageCount = userDiscountRepository
                    .countUserDiscountUsage(discountCode.getId(), userId);
            if (!discountCode.canUserUse(userUsageCount)) {
                continue;
            }

            // Check if order amount meets minimum requirement
            if (orderAmount.compareTo(discountCode.getMinOrderAmount()) < 0) {
                continue;
            }

            // Calculate discount amount
            BigDecimal discountAmount = discountCode.calculateDiscountAmount(orderAmount);
            if (discountAmount.compareTo(maxDiscountAmount) > 0) {
                maxDiscountAmount = discountAmount;
                bestDiscount = discountCode;
            }
        }

        if (bestDiscount == null) {
            return DiscountCalculationResponse.builder()
                    .success(false)
                    .message("Không có mã giảm giá tự động áp dụng")
                    .originalAmount(orderAmount)
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(orderAmount)
                    .build();
        }

        BigDecimal finalAmount = orderAmount.subtract(maxDiscountAmount);

        return DiscountCalculationResponse.builder()
                .success(true)
                .message("Tự động áp dụng mã giảm giá tốt nhất")
                .discountCode(bestDiscount.getCode())
                .originalAmount(orderAmount)
                .discountAmount(maxDiscountAmount)
                .finalAmount(finalAmount)
                .discountDescription(bestDiscount.getDescription())
                .build();
    }

    @Override
    @Transactional
    public void confirmDiscountUsage(String discountCode, Long userId, Long orderId,
                                     BigDecimal discountAmount, BigDecimal originalAmount) {
        log.info("Confirming discount usage: {} for user: {}, order: {}", discountCode, userId, orderId);

        // Find discount code
        DiscountCode discount = discountCodeRepository.findByCodeAndActive(discountCode)
                .orElseThrow(() -> new BusinessException("Mã giảm giá không tồn tại"));

        // Find user and order
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        // Increment used count
        discount.setUsedCount(discount.getUsedCount() + 1);
        discountCodeRepository.save(discount);

        // Create user discount record
        UserDiscountId userDiscountId = UserDiscountId.builder()
                .userId(userId)
                .discountId(discount.getId())
                .build();

        UserDiscount userDiscount = UserDiscount.builder()
                .userId(userId)
                .user(user)
                .discountId(discount.getId())
                .discountCode(discount)
                .usedAt(LocalDateTime.now())
                .build();

        userDiscountRepository.save(userDiscount);

        // Create usage history
        DiscountUsageHistory usageHistory = DiscountUsageHistory.builder()
                .discountCode(discount)
                .user(user)
                .order(order)
                .discountAmount(discountAmount)
                .originalAmount(originalAmount)
                .finalAmount(originalAmount.subtract(discountAmount))
                .usedAt(LocalDateTime.now())
                .build();

        discountUsageHistoryRepository.save(usageHistory);

        log.info("Discount usage confirmed successfully for code: {}", discountCode);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDiscountCodeValid(String discountCode, Long storeId, List<Long> productIds, Long userId) {
        return checkDiscountCodeUsability(discountCode, storeId, productIds, userId, BigDecimal.ZERO) == null;
    }

    @Override
    @Transactional(readOnly = true)
    public String checkDiscountCodeUsability(String discountCode, Long storeId, List<Long> productIds,
                                             Long userId, BigDecimal orderAmount) {
        log.info("=== CHECKING DISCOUNT CODE USABILITY ===");
        log.info("Code: {}, Store: {}, User: {}, Amount: {}, Products: {}",
                discountCode, storeId, userId, orderAmount, productIds);

        // Find discount code
        DiscountCode discount = discountCodeRepository.findByCodeAndActive(discountCode)
                .orElse(null);

        if (discount == null) {
            log.error("❌ Check 1 FAILED: Discount code not found or inactive");
            return "Mã giảm giá không tồn tại hoặc đã hết hiệu lực";
        }
        log.info("✅ Check 1 PASSED: Discount code found and active");

        // Check if discount belongs to the store
        if (!discount.getStore().getId().equals(storeId)) {
            log.error("❌ Check 2 FAILED: Store mismatch. Discount store: {}, Request store: {}",
                    discount.getStore().getId(), storeId);
            return "Mã giảm giá không áp dụng cho cửa hàng này";
        }
        log.info("✅ Check 2 PASSED: Store match");

        // Check if discount is still valid
        if (!discount.isValidForUse()) {
            log.error("❌ Check 3 FAILED: Discount not valid for use");
            log.error("Details - Active: {}, Start: {}, End: {}, Used: {}/{}",
                    discount.getIsActive(),
                    discount.getStartDate(),
                    discount.getEndDate(),
                    discount.getUsedCount(),
                    discount.getMaxUses());

            LocalDateTime now = LocalDateTime.now();
            log.error("Current time: {}", now);
            log.error("Is before start? {}", now.isBefore(discount.getStartDate()));
            log.error("Is after end? {}", now.isAfter(discount.getEndDate()));
            log.error("Usage exceeded? {}", discount.getUsedCount() >= discount.getMaxUses());

            return "Mã giảm giá đã hết hiệu lực hoặc đã hết số lần sử dụng";
        }
        log.info("✅ Check 3 PASSED: Discount is valid for use");

        // Check user usage limit
        int userUsageCount = userDiscountRepository.countUserDiscountUsage(discount.getId(), userId);
        log.info("User usage count: {}, Limit per customer: {}", userUsageCount, discount.getUsagePerCustomer());

        if (!discount.canUserUse(userUsageCount)) {
            log.error("❌ Check 4 FAILED: User usage limit exceeded");
            return "Bạn đã sử dụng hết số lần cho phép của mã giảm giá này";
        }
        log.info("✅ Check 4 PASSED: User can still use this discount");

        // Check minimum order amount
        if (orderAmount.compareTo(BigDecimal.ZERO) > 0 &&
                orderAmount.compareTo(discount.getMinOrderAmount()) < 0) {
            log.error("❌ Check 5 FAILED: Order amount {} is less than minimum {}",
                    orderAmount, discount.getMinOrderAmount());
            return String.format("Đơn hàng tối thiểu phải từ %s",
                    formatCurrency(discount.getMinOrderAmount()));
        }
        log.info("✅ Check 5 PASSED: Order amount meets minimum requirement");

        // Check if discount applies to the products
        if (discount.getAppliesTo() == AppliesTo.PRODUCTS && productIds != null && !productIds.isEmpty()) {
            log.info("Checking product applicability for PRODUCTS type discount");
            log.info("Discount applies to products: {}",
                    discount.getProducts().stream().map(p -> p.getId()).collect(Collectors.toList()));
            log.info("Request product IDs: {}", productIds);

            boolean hasApplicableProduct = productIds.stream()
                    .anyMatch(productId -> discount.isApplicableToProduct(productId));

            log.info("Has applicable product: {}", hasApplicableProduct);

            if (!hasApplicableProduct) {
                log.error("❌ Check 6 FAILED: No applicable products found");
                return "Mã giảm giá không áp dụng cho sản phẩm trong đơn hàng";
            }
            log.info("✅ Check 6 PASSED: Found applicable products");
        } else if (discount.getAppliesTo() == AppliesTo.SHOP) {
            log.info("✅ Check 6 PASSED: SHOP type discount applies to all products");
        }

        log.info("=== ALL CHECKS PASSED ===");
        return null; // Valid
    }


    // ===== PRIVATE HELPER METHODS =====

    private void validateCreateDiscountCodeRequest(CreateDiscountCodeRequest request) {
        // Validate percentage discount value
        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(BigDecimal.ONE) < 0 ||
                    request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BusinessException("Giá trị giảm theo phần trăm phải từ 1% đến 100%");
            }
        }

        // Validate date range
        if (request.getEndDate().isBefore(request.getStartDate()) ||
                request.getEndDate().isEqual(request.getStartDate())) {
            throw new BusinessException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        // Validate max discount value for percentage type
        if (request.getDiscountType() == DiscountType.PERCENTAGE &&
                request.getMaxDiscountValue() == null) {
            throw new BusinessException("Giá trị giảm tối đa là bắt buộc khi sử dụng giảm theo phần trăm");
        }
    }

    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f VNĐ", amount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiscountCodeDTO> getApplicableDiscountCodesWithContext(Long storeId, List<Long> productIds, Long userId) {
        log.info("Getting applicable discount codes with context for store: {}, user: {}, products: {}",
                storeId, userId, productIds);

        LocalDateTime currentTime = LocalDateTime.now();

        // Lấy tất cả voucher valid của store
        List<DiscountCode> applicableDiscountCodes = discountCodeRepository
                .findAllValidDiscountCodes(storeId, productIds != null ? productIds : List.of(), currentTime);

        return applicableDiscountCodes.stream()
                .filter(dc -> {
                    // Kiểm tra user usage
                    int userUsageCount = userDiscountRepository
                            .countUserDiscountUsage(dc.getId(), userId);
                    return dc.canUserUse(userUsageCount);
                })
                .map(dc -> {
                    // Map với context để có applicableProductIds
                    DiscountCodeDTO dto = discountCodeMapper.toDtoWithContext(dc, productIds);

                    // Nếu là voucher PRODUCTS, chỉ giữ lại những voucher có ít nhất 1 sản phẩm áp dụng
                    if (dc.getAppliesTo() == AppliesTo.PRODUCTS) {
                        List<Long> applicableIds = dto.getApplicableProductIds();
                        if (applicableIds == null || applicableIds.isEmpty()) {
                            return null; // Sẽ bị filter ở bước tiếp theo
                        }
                    }

                    return dto;
                })
                .filter(Objects::nonNull) // Loại bỏ null values
                .collect(Collectors.toList());
    }

    // Trong DiscountCodeServiceImpl - method calculateDiscountDetails
    @Override
    public DiscountCalculationResponse calculateDiscountDetails(ApplyDiscountRequest request) {
        log.info("=== CALCULATING DISCOUNT DETAILS ===");
        log.info("Request: {}", request);

        // Find discount code
        DiscountCode discountCode = discountCodeRepository.findByCodeAndActive(request.getDiscountCode())
                .orElse(null);

        if (discountCode == null) {
            log.error("❌ Discount code not found or inactive: {}", request.getDiscountCode());
            return DiscountCalculationResponse.builder()
                    .success(false)
                    .message("Mã giảm giá không tồn tại hoặc đã hết hiệu lực")
                    .discountCode(request.getDiscountCode())
                    .originalAmount(request.getOrderAmount())
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .build();
        }

        // Validate discount code
        String validationError = checkDiscountCodeUsability(
                request.getDiscountCode(),
                request.getStoreId(),
                request.getProductIds(),
                request.getUserId(),
                request.getOrderAmount()
        );

        if (validationError != null) {
            log.error("❌ Validation failed: {}", validationError);
            return DiscountCalculationResponse.builder()
                    .success(false)
                    .message(validationError)
                    .discountCode(request.getDiscountCode())
                    .originalAmount(request.getOrderAmount())
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getOrderAmount())
                    .build();
        }

        // Calculate discount based on type
        BigDecimal discountAmount = BigDecimal.ZERO;
        List<Long> applicableProductIds = new ArrayList<>();

        if (discountCode.getAppliesTo() == AppliesTo.SHOP) {
            // Áp dụng cho toàn bộ đơn hàng
            discountAmount = discountCode.calculateDiscountAmount(request.getOrderAmount());
            applicableProductIds = request.getProductIds(); // Tất cả sản phẩm
        } else if (discountCode.getAppliesTo() == AppliesTo.PRODUCTS) {
            // Chỉ áp dụng cho sản phẩm cụ thể
            applicableProductIds = discountCode.getApplicableProductIds(request.getProductIds());

            if (applicableProductIds.isEmpty()) {
                return DiscountCalculationResponse.builder()
                        .success(false)
                        .message("Mã giảm giá không áp dụng cho sản phẩm trong đơn hàng")
                        .discountCode(request.getDiscountCode())
                        .originalAmount(request.getOrderAmount())
                        .discountAmount(BigDecimal.ZERO)
                        .finalAmount(request.getOrderAmount())
                        .build();
            }

            // QUAN TRỌNG: Tính giảm giá cho MỖI sản phẩm được áp dụng
            if (discountCode.getDiscountType() == DiscountType.FIXED) {
                // Với voucher FIXED, nhân với số lượng sản phẩm được áp dụng
                discountAmount = discountCode.calculateDiscountAmount(
                        request.getOrderAmount(),
                        true, // applyPerProduct = true
                        applicableProductIds.size()
                );
            } else {
                // Với voucher PERCENTAGE, tính theo tổng giá trị sản phẩm được áp dụng
                // (Giả sử request có thêm thông tin chi tiết về giá từng sản phẩm)
                discountAmount = discountCode.calculateDiscountAmount(request.getOrderAmount());
            }
        }

        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);

        log.info("💰 Discount calculation - Original: {}, Discount: {}, Final: {}, Applicable Products: {}",
                request.getOrderAmount(), discountAmount, finalAmount, applicableProductIds);

        DiscountCalculationResponse response = DiscountCalculationResponse.builder()
                .success(true)
                .message("Áp dụng mã giảm giá thành công")
                .discountCode(request.getDiscountCode())
                .originalAmount(request.getOrderAmount())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .discountDescription(discountCode.getDescription())
                .applicableProductIds(applicableProductIds)
                .discountPerProduct(discountCode.getAppliesTo() == AppliesTo.PRODUCTS) // Thêm flag này
                .build();

        log.info("=== DISCOUNT CALCULATION SUCCESS ===");
        return response;
    }
}