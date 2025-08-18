package com.quadra.ecommerce_api.service.customer.cart;

import com.quadra.ecommerce_api.dto.custom.cart.request.AddToCartRequest;
import com.quadra.ecommerce_api.dto.custom.cart.request.UpdateCartItemVariantRequest;
import com.quadra.ecommerce_api.dto.custom.cart.response.*;
import com.quadra.ecommerce_api.entity.cart.CartItem;
import com.quadra.ecommerce_api.entity.cart.CartItemAddon;
import com.quadra.ecommerce_api.entity.discount.FlashSale;
import com.quadra.ecommerce_api.entity.product.*;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.cart.CartItemAddonRepo;
import com.quadra.ecommerce_api.repository.cart.CartItemRepo;
import com.quadra.ecommerce_api.repository.flashsale.FlashSaleRepo;
import com.quadra.ecommerce_api.repository.product.AddonRepo;
import com.quadra.ecommerce_api.repository.product.AttributeRepo;
import com.quadra.ecommerce_api.repository.product.ProductDetailRepo;
import com.quadra.ecommerce_api.repository.product.ProductVariantRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CartService {

    protected final CartItemRepo cartItemRepo;
    protected final CartItemAddonRepo cartItemAddonRepo;
    protected final ProductVariantRepo productVariantRepo;
    protected final AddonRepo addonRepo;
    private final ProductDetailRepo productDetailRepo;
    private final AttributeRepo attributeRepo;
    protected final FlashSaleRepo flashSaleRepo;

    @Autowired
    public CartService(CartItemRepo cartItemRepo,
                       CartItemAddonRepo cartItemAddonRepo,
                       ProductVariantRepo productVariantRepo,
                       AddonRepo addonRepo,
                       ProductDetailRepo productDetailRepo,
                       AttributeRepo attributeRepo,
                       FlashSaleRepo flashSaleRepo) {
        this.cartItemRepo = cartItemRepo;
        this.cartItemAddonRepo = cartItemAddonRepo;
        this.productVariantRepo = productVariantRepo;
        this.addonRepo = addonRepo;
        this.productDetailRepo = productDetailRepo;
        this.attributeRepo = attributeRepo;
        this.flashSaleRepo = flashSaleRepo;
    }

    @Transactional
    public AddToCartResponse addToCart(User user, AddToCartRequest request) {
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0.");
        }
        if (request.getAddonIds() != null && new HashSet<>(request.getAddonIds()).size() != request.getAddonIds().size()) {
            throw new IllegalArgumentException("Addon không được trùng lặp.");
        }

        Optional<ProductVariant> variantOpt = productVariantRepo.findById(request.getVariantId());
        if (variantOpt.isEmpty() || !variantOpt.get().isActive() || variantOpt.get().getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Biến thể không hợp lệ hoặc hết hàng.");
        }
        ProductVariant variant = variantOpt.get();

        CartItem existingCartItem = cartItemRepo.findByUserIdAndVariantId(user.getId(), variant.getId())
                .orElse(null);

        CartItem cartItem = existingCartItem != null ? existingCartItem : new CartItem();
        if (existingCartItem == null) {
            cartItem.setUser(user);
            cartItem.setVariant(variant);
            cartItem.setQuantity(0);
        }

        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        cartItem = cartItemRepo.save(cartItem);

        if (request.getAddonIds() != null && !request.getAddonIds().isEmpty()) {
            cartItemAddonRepo.deleteByCartItemId(cartItem.getId());
            for (Long addonId : request.getAddonIds()) {
                Addon addon = addonRepo.findById(addonId)
                        .orElseThrow(() -> new IllegalArgumentException("Addon không tồn tại: " + addonId));
                CartItemAddon cartItemAddon = new CartItemAddon();
                cartItemAddon.setCartItem(cartItem);
                cartItemAddon.setAddon(addon);
                cartItemAddonRepo.save(cartItemAddon);
            }
        }

        return new AddToCartResponse("Sản phẩm đã được thêm vào giỏ hàng.", cartItem.getId(), cartItem.getQuantity());
    }

    @Transactional(readOnly = true)
    public List<CartStoreDTO> getCartItems(User user) {
        List<CartItem> cartItems = cartItemRepo.findByUserId(user.getId());
        // Nhóm các item theo store
        Map<Store, List<CartItem>> itemsByStore = cartItems.stream()
                .collect(Collectors.groupingBy(cartItem -> cartItem.getVariant().getProduct().getStore()));

        return itemsByStore.entrySet().stream()
                .map(entry -> {
                    Store store = entry.getKey();
                    List<CartItem> storeItems = entry.getValue();
                    CartStoreDTO cartStoreDTO = new CartStoreDTO();
                    StoreDTO storeDTO = new StoreDTO();
                    storeDTO.setId(store.getId());
                    storeDTO.setName(store.getName());
                    storeDTO.setImage(store.getLogoUrl());
                    cartStoreDTO.setStore(storeDTO);

                    // Batch load ProductDetails và ProductVariants cho tất cả productIds trong store
                    List<Long> productIds = storeItems.stream()
                            .map(item -> item.getVariant().getProduct().getId())
                            .distinct()
                            .collect(Collectors.toList());

                    // ✅ THÊM MỚI: Batch load FlashSales
                    List<FlashSale> allFlashSales = flashSaleRepo.findActiveFlashSalesByProductIds(productIds);
                    Map<Long, FlashSale> flashSalesByProductId = allFlashSales.stream()
                            .collect(Collectors.toMap(fs -> fs.getProduct().getId(), fs -> fs, (existing, replacement) -> existing));

                    List<ProductDetail> allProductDetails = productDetailRepo.findByProductIdIn(productIds);
                    Map<Long, List<ProductDetail>> productDetailsByProductId = allProductDetails.stream()
                            .collect(Collectors.groupingBy(pd -> pd.getVariant().getProduct().getId()));

                    List<ProductVariant> allVariants = productVariantRepo.findByProductIdInAndIsActiveTrue(productIds);
                    Map<Long, List<ProductVariant>> variantsByProductId = allVariants.stream()
                            .collect(Collectors.groupingBy(v -> v.getProduct().getId()));

                    List<CartItemDTO> itemDTOs = storeItems.stream()
                            .map(item -> {
                                CartItemDTO dto = new CartItemDTO();
                                Product product = item.getVariant().getProduct();
                                Long productId = product.getId();
                                dto.setId(item.getId());
                                dto.setProductId(productId);
                                dto.setSlug(product.getSlug());
                                dto.setProductName(product.getName());
                                dto.setVariantId(item.getVariant().getId());
                                dto.setQuantity(item.getQuantity());
                                dto.setAddons(cartItemAddonRepo.findByCartItemId(item.getId()).stream()
                                        .map(addonItem -> {
                                            CartAddonDTO addonDto = new CartAddonDTO();
                                            addonDto.setAddonId(addonItem.getAddon().getId());
                                            addonDto.setAddonName(addonItem.getAddon().getName());
                                            addonDto.setPriceAdjust(addonItem.getAddon().getPriceAdjust().doubleValue());
                                            return addonDto;
                                        })
                                        .collect(Collectors.toList()));

                                // ✅ THÊM MỚI: Load FlashSale và set FlashSaleDTO
                                FlashSale flashSale = flashSalesByProductId.get(productId);
                                if (flashSale != null) {
                                    FlashSaleDTO flashSaleDTO = new FlashSaleDTO();
                                    flashSaleDTO.setId(flashSale.getId());
                                    flashSaleDTO.setPercentageDiscount(flashSale.getPercentageDiscount());
                                    flashSaleDTO.setEndTime(flashSale.getEndTime());
                                    flashSaleDTO.setSoldCount(flashSale.getSoldCount());
                                    flashSaleDTO.setQuantity(flashSale.getQuantity());
                                    dto.setFlashSale(flashSaleDTO);
                                }

                                // ✅ CẬP NHẬT: calculateTotalPrice với flash sale
                                dto.setTotalPrice(calculateTotalPrice(item, flashSale));

                                dto.setImage(product.getThumbnailUrl());
                                dto.setInStock(item.getVariant().isActive() && item.getVariant().getStockQuantity() > 0);

                                // ✅ GIỮ NGUYÊN: price là giá gốc của variant
                                dto.setPrice(item.getVariant().getPrice().doubleValue());

                                dto.setIsActive(product.isActive());

                                // ✅ GIỮ NGUYÊN: Load variantAttributes - CHỈ variant hiện tại (cho UI card)
                                List<ProductDetail> currentVariantDetails = productDetailRepo.findByVariantId(item.getVariant().getId());
                                List<VariantAttributeDTO> variantAttributes = currentVariantDetails.stream()
                                        .map(pd -> {
                                            VariantAttributeDTO vaDTO = new VariantAttributeDTO();
                                            vaDTO.setVariantId(pd.getVariant().getId());
                                            vaDTO.setAttributeName(pd.getAttributeValue().getAttribute().getName());
                                            vaDTO.setAttributeValue(pd.getAttributeValue().getValue());
                                            return vaDTO;
                                        })
                                        .collect(Collectors.toList());
                                dto.setVariantAttributes(variantAttributes);

                                // ✅ THÊM MỚI: Load allVariantAttributes - TẤT CẢ variants (cho modal)
                                List<ProductDetail> allProductDetailsForProduct = productDetailsByProductId.getOrDefault(productId, Collections.emptyList());
                                List<VariantAttributeDTO> allVariantAttributes = allProductDetailsForProduct.stream()
                                        .map(pd -> {
                                            VariantAttributeDTO vaDTO = new VariantAttributeDTO();
                                            vaDTO.setVariantId(pd.getVariant().getId());
                                            vaDTO.setAttributeName(pd.getAttributeValue().getAttribute().getName());
                                            vaDTO.setAttributeValue(pd.getAttributeValue().getValue());
                                            return vaDTO;
                                        })
                                        .collect(Collectors.toList());
                                dto.setAllVariantAttributes(allVariantAttributes);

                                // Set variantAttributeNames - chỉ của variant hiện tại
                                String variantAttributeNames = currentVariantDetails.stream()
                                        .map(pd -> pd.getAttributeValue().getValue())
                                        .collect(Collectors.joining(", "));
                                dto.setVariantAttributeNames(variantAttributeNames.isEmpty() ? item.getVariant().getSku() : variantAttributeNames);

                                // Load available attributes
                                List<Attribute> attributes = attributeRepo.findByProductIdThroughDetails(productId);
                                List<AttributeDTO> availableAttributes = attributes.stream()
                                        .map(attr -> {
                                            AttributeDTO attrDTO = new AttributeDTO();
                                            attrDTO.setName(attr.getName());
                                            List<String> values = productDetailsByProductId.getOrDefault(productId, Collections.emptyList()).stream()
                                                    .map(ProductDetail::getAttributeValue)
                                                    .filter(av -> av.getAttribute().getId().equals(attr.getId()))
                                                    .map(AttributeValue::getValue)
                                                    .distinct()
                                                    .collect(Collectors.toList());
                                            attrDTO.setValues(values);
                                            return attrDTO;
                                        })
                                        .collect(Collectors.toList());
                                dto.setAvailableAttributes(availableAttributes);

                                // Load variants
                                List<ProductVariant> variants = variantsByProductId.getOrDefault(productId, Collections.emptyList());
                                List<VariantDTO> variantDTOs = variants.stream()
                                        .map(v -> {
                                            VariantDTO vDTO = new VariantDTO();
                                            vDTO.setId(v.getId());
                                            vDTO.setSku(v.getSku());
                                            return vDTO;
                                        })
                                        .collect(Collectors.toList());
                                dto.setVariants(variantDTOs);

                                return dto;
                            })
                            .collect(Collectors.toList());
                    cartStoreDTO.setItems(itemDTOs);
                    return cartStoreDTO;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDTO updateCartItemVariant(Long cartItemId, Long userId, UpdateCartItemVariantRequest request) {
        // Validate cart item
        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mục giỏ hàng"));

        // Validate user authorization
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Không có quyền truy cập mục giỏ hàng");
        }

        // Validate new variant
        Optional<ProductVariant> variantOpt = productVariantRepo.findById(request.getVariantId());
        if (variantOpt.isEmpty() || !variantOpt.get().isActive() || variantOpt.get().getStockQuantity() < cartItem.getQuantity()) {
            throw new IllegalArgumentException("Biến thể không hợp lệ hoặc không đủ hàng");
        }
        ProductVariant newVariant = variantOpt.get();

        // Check if the new variant belongs to the same product
        if (!newVariant.getProduct().getId().equals(cartItem.getVariant().getProduct().getId())) {
            throw new IllegalArgumentException("Biến thể mới phải thuộc cùng sản phẩm");
        }

        // Update variant, keep quantity
        cartItem.setVariant(newVariant);
        cartItem = cartItemRepo.save(cartItem);

        // Re-attach addons
        if (request.getAddonIds() != null && !request.getAddonIds().isEmpty()) {
            cartItemAddonRepo.deleteByCartItemId(cartItem.getId());
            for (Long addonId : request.getAddonIds()) {
                Addon addon = addonRepo.findById(addonId)
                        .orElseThrow(() -> new IllegalArgumentException("Addon không tồn tại: " + addonId));
                CartItemAddon cartItemAddon = new CartItemAddon();
                cartItemAddon.setCartItem(cartItem);
                cartItemAddon.setAddon(addon);
                cartItemAddonRepo.save(cartItemAddon);
            }
        }

        // ✅ THÊM MỚI: Load FlashSale cho product
        FlashSale flashSale = flashSaleRepo.findActiveByProduct_Id(newVariant.getProduct().getId()).orElse(null);

        // Build CartItemDTO
        CartItemDTO dto = new CartItemDTO();
        Product product = newVariant.getProduct();
        Long productId = product.getId();
        dto.setId(cartItem.getId());
        dto.setProductId(productId);
        dto.setSlug(product.getSlug());
        dto.setProductName(product.getName());
        dto.setVariantId(newVariant.getId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setAddons(cartItemAddonRepo.findByCartItemId(cartItem.getId()).stream()
                .map(addonItem -> {
                    CartAddonDTO addonDto = new CartAddonDTO();
                    addonDto.setAddonId(addonItem.getAddon().getId());
                    addonDto.setAddonName(addonItem.getAddon().getName());
                    addonDto.setPriceAdjust(addonItem.getAddon().getPriceAdjust().doubleValue());
                    return addonDto;
                })
                .collect(Collectors.toList()));

        // ✅ GIỮ NGUYÊN: price là giá gốc của variant
        dto.setPrice(newVariant.getPrice().doubleValue());

        // ✅ THÊM MỚI: Set FlashSale info
        if (flashSale != null) {
            FlashSaleDTO flashSaleDTO = new FlashSaleDTO();
            flashSaleDTO.setId(flashSale.getId());
            flashSaleDTO.setPercentageDiscount(flashSale.getPercentageDiscount());
            flashSaleDTO.setEndTime(flashSale.getEndTime());
            flashSaleDTO.setSoldCount(flashSale.getSoldCount());
            flashSaleDTO.setQuantity(flashSale.getQuantity());
            dto.setFlashSale(flashSaleDTO);
        }

        // ✅ CẬP NHẬT: calculateTotalPrice với flash sale
        dto.setTotalPrice(calculateTotalPrice(cartItem, flashSale));

        dto.setImage(product.getThumbnailUrl());
        dto.setInStock(newVariant.isActive() && newVariant.getStockQuantity() > 0);
        dto.setIsActive(product.isActive());

        // Load variant attributes for the new variant
        List<ProductDetail> currentVariantDetails = productDetailRepo.findByVariantId(newVariant.getId());
        List<VariantAttributeDTO> variantAttributes = currentVariantDetails.stream()
                .map(pd -> {
                    VariantAttributeDTO vaDTO = new VariantAttributeDTO();
                    vaDTO.setVariantId(pd.getVariant().getId());
                    vaDTO.setAttributeName(pd.getAttributeValue().getAttribute().getName());
                    vaDTO.setAttributeValue(pd.getAttributeValue().getValue());
                    return vaDTO;
                })
                .collect(Collectors.toList());
        dto.setVariantAttributes(variantAttributes);

        // Load all variant attributes for the product
        List<ProductDetail> allProductDetails = productDetailRepo.findByProductId(productId);
        List<VariantAttributeDTO> allVariantAttributes = allProductDetails.stream()
                .map(pd -> {
                    VariantAttributeDTO vaDTO = new VariantAttributeDTO();
                    vaDTO.setVariantId(pd.getVariant().getId());
                    vaDTO.setAttributeName(pd.getAttributeValue().getAttribute().getName());
                    vaDTO.setAttributeValue(pd.getAttributeValue().getValue());
                    return vaDTO;
                })
                .collect(Collectors.toList());
        dto.setAllVariantAttributes(allVariantAttributes);

        // Set variant attribute names
        String variantAttributeNames = currentVariantDetails.stream()
                .map(pd -> pd.getAttributeValue().getValue())
                .collect(Collectors.joining(", "));
        dto.setVariantAttributeNames(variantAttributeNames.isEmpty() ? newVariant.getSku() : variantAttributeNames);

        // Load available attributes
        List<Attribute> attributes = attributeRepo.findByProductIdThroughDetails(productId);
        List<AttributeDTO> availableAttributes = attributes.stream()
                .map(attr -> {
                    AttributeDTO attrDTO = new AttributeDTO();
                    attrDTO.setName(attr.getName());
                    List<String> values = allProductDetails.stream()
                            .map(ProductDetail::getAttributeValue)
                            .filter(av -> av.getAttribute().getId().equals(attr.getId()))
                            .map(AttributeValue::getValue)
                            .distinct()
                            .collect(Collectors.toList());
                    attrDTO.setValues(values);
                    return attrDTO;
                })
                .collect(Collectors.toList());
        dto.setAvailableAttributes(availableAttributes);

        // Load variants
        List<ProductVariant> variants = productVariantRepo.findByProductIdInAndIsActiveTrue(Collections.singletonList(productId));
        List<VariantDTO> variantDTOs = variants.stream()
                .map(v -> {
                    VariantDTO vDTO = new VariantDTO();
                    vDTO.setId(v.getId());
                    vDTO.setSku(v.getSku());
                    return vDTO;
                })
                .collect(Collectors.toList());
        dto.setVariants(variantDTOs);

        return dto;
    }

    @Transactional
    public void updateCartItemQuantity(Long cartItemId, Long userId, int quantity) {
        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to cart item");
        }
        if (quantity <= 0) {
            cartItemRepo.deleteById(cartItemId); // Gây lỗi nếu có CartItemAddon
        } else {
            Optional<ProductVariant> variantOpt = productVariantRepo.findById(cartItem.getVariant().getId());
            if (variantOpt.isEmpty() || variantOpt.get().getStockQuantity() < quantity) {
                throw new IllegalArgumentException("Số lượng vượt quá tồn kho");
            }
            cartItem.setQuantity(quantity);
            cartItemRepo.save(cartItem);
        }
    }

    @Transactional
    public void deleteCartItem(Long cartItemId, Long userId) {
        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to cart item");
        }
        cartItemAddonRepo.deleteByCartItemId(cartItemId);
        cartItemRepo.deleteById(cartItemId);
    }

    @Transactional
    public void deleteCartItemAddon(Long cartItemId, Long userId, Long addonId) {
        CartItem cartItem = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to cart item");
        }
        CartItemAddon cartItemAddon = cartItemAddonRepo.findByCartItemIdAndAddonId(cartItemId, addonId)
                .orElseThrow(() -> new IllegalArgumentException("Addon not found in cart item"));
        cartItemAddonRepo.delete(cartItemAddon);
    }

    // ✅ CẬP NHẬT: calculateTotalPrice methods với FlashSale
    private double calculateTotalPrice(CartItem item) {
        // Load flash sale cho method cũ (dùng khi không có flashSale sẵn)
        FlashSale flashSale = flashSaleRepo.findActiveByProduct_Id(item.getVariant().getProduct().getId()).orElse(null);
        return calculateTotalPrice(item, flashSale);
    }

    private double calculateTotalPrice(CartItem item, FlashSale flashSale) {
        double basePrice = item.getVariant().getPrice().doubleValue();

        // ✅ TÍNH GIÁ VỚI FLASH SALE
        if (flashSale != null) {
            basePrice = basePrice * (100 - flashSale.getPercentageDiscount()) / 100.0;
        }

        double addonPrice = cartItemAddonRepo.findByCartItemId(item.getId()).stream()
                .mapToDouble(addon -> addon.getAddon().getPriceAdjust().doubleValue())
                .sum();
        return (basePrice + addonPrice) * item.getQuantity();
    }

    public List<CartItem> getCartItemsByIdsAndUserId(List<Long> cartItemIds, Long userId) {
        return cartItemRepo.findByIdInAndUserId(cartItemIds, userId);
    }

    public List<CartItemAddon> getAddonsByCartItemId(Long id) {
        return cartItemAddonRepo.findByCartItemId(id);
    }

    @Transactional
    public void deleteCartItemsByOrderIds(List<Long> orderIds, Long userId) {
        if (orderIds == null || orderIds.isEmpty()) {
            throw new IllegalArgumentException("Order IDs cannot be empty");
        }

        List<CartItem> cartItemsToDelete = cartItemRepo.findCartItemsByUserAndOrderIds(userId, orderIds);

        if (!cartItemsToDelete.isEmpty()) {
            cartItemRepo.deleteAll(cartItemsToDelete);
        }
    }
}