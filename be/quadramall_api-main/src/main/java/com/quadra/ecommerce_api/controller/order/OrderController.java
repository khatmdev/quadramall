package com.quadra.ecommerce_api.controller.order;

import com.quadra.ecommerce_api.common.base.AbstractBuyerController;
import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.common.response.ApiResponseUtils;
import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.dto.custom.discount.DiscountCodeDTO;
import com.quadra.ecommerce_api.dto.custom.order.request.BuyNowRequest;
import com.quadra.ecommerce_api.dto.custom.order.response.*;
import com.quadra.ecommerce_api.entity.cart.CartItem;
import com.quadra.ecommerce_api.entity.cart.CartItemAddon;
import com.quadra.ecommerce_api.entity.discount.FlashSale;
import com.quadra.ecommerce_api.entity.order.Order;
import com.quadra.ecommerce_api.entity.order.OrderItem;
import com.quadra.ecommerce_api.entity.order.OrderItemAddon;
import com.quadra.ecommerce_api.entity.product.Addon;
import com.quadra.ecommerce_api.entity.product.Product;
import com.quadra.ecommerce_api.entity.product.ProductVariant;
import com.quadra.ecommerce_api.entity.shipping.OrderShipping;
import com.quadra.ecommerce_api.entity.store.Store;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.order.OrderStatus;
import com.quadra.ecommerce_api.enums.payment.PaymentMethod;
import com.quadra.ecommerce_api.enums.shipping.ShippingMethod;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.mapper.base.product.AddonMapper;
import com.quadra.ecommerce_api.mapper.base.product.ProductVariantMapper;
import com.quadra.ecommerce_api.mapper.base.store.CategoryMapper;
import com.quadra.ecommerce_api.mapper.base.store.ItemTypeMapper;
import com.quadra.ecommerce_api.mapper.base.store.StoreMapper;
import com.quadra.ecommerce_api.repository.flashsale.FlashSaleRepo;
import com.quadra.ecommerce_api.repository.order.OrderDiscountRepository;
import com.quadra.ecommerce_api.repository.product.AddonRepo;
import com.quadra.ecommerce_api.service.customer.address.AddressService;
import com.quadra.ecommerce_api.service.base.UserService;
import com.quadra.ecommerce_api.service.customer.cart.CartService;
import com.quadra.ecommerce_api.service.customer.order.OrderHistoryService;
import com.quadra.ecommerce_api.service.customer.order.OrderItemAddonService;
import com.quadra.ecommerce_api.service.customer.order.OrderItemService;
import com.quadra.ecommerce_api.service.payment.BalanceTransferService;
import com.quadra.ecommerce_api.service.payment.OrderService;
import com.quadra.ecommerce_api.service.customer.order.OrderShippingService;
import com.quadra.ecommerce_api.service.customer.product.ProductService;
import com.quadra.ecommerce_api.service.discount.DiscountCodeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Tag(name = "Buyer.order", description = "Quản lý đặt hàng")
@RestController
@RequiredArgsConstructor
@RequestMapping("/order")
public class OrderController extends AbstractBuyerController {

    private final OrderService orderService;
    private final OrderItemService orderItemService;
    private final UserService userService;
    private final AddressService addressService;
    private final CartService cartService;
    private final ProductService productService;
    private final ProductVariantMapper productVariantMapper;
    private final StoreMapper storeMapper;
    private final ItemTypeMapper itemTypeMapper;
    private final CategoryMapper categoryMapper;
    private final AddonMapper addonMapper;
    private final OrderItemAddonService orderItemAddonService;
    private final OrderShippingService orderShippingService;
    private final DiscountCodeService discountCodeService;
    private final OrderDiscountRepository orderDiscountRepository;
    private final AddonRepo addonRepo;
    private final BalanceTransferService balanceTransferService;
    private final OrderHistoryService orderHistoryService;
    private final FlashSaleRepo flashSaleRepo;

    // =============================
    // API lấy đơn hàng của user
    // =============================

    /**
     * Lấy tất cả đơn hàng của user
     */
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUser(@AuthenticationPrincipal User user) {
        List<Order> orders = orderHistoryService.getOrdersByIdAndUserId(null, user.getId());
        List<OrderResponse> responses = orders.stream()
                .map(order -> {
                    OrderResponse response = new OrderResponse();
                    response.setId(order.getId());
                    response.setStatus(order.getStatus());
                    response.setShippingMethod(order.getShippingMethod());
                    response.setPaymentMethod(order.getPaymentMethod());
                    response.setTotalAmount(order.getTotalAmount());
                    response.setNote(order.getNote());
                    response.setCreatedAt(order.getCreatedAt());
                    response.setUpdatedAt(order.getUpdatedAt());

                    // Thông tin cửa hàng
                    Store store = order.getStore();
                    if (store != null) {
                        OrderStoreResponse storeResponse = new OrderStoreResponse();
                        storeResponse.setId(store.getId());
                        storeResponse.setName(store.getName());
                        storeResponse.setImage(store.getLogoUrl());
                        response.setStore(storeResponse);
                    }

                    // Lấy thông tin sản phẩm của đơn hàng
                    List<OrderItem> orderItems = orderItemService.getOrderItemsByOrderId(order.getId());
                    List<OrderItemResponse> itemResponses = orderItems.stream().map(orderItem -> {
                        OrderItemResponse itemResponse = new OrderItemResponse();
                        itemResponse.setId(orderItem.getId());
                        itemResponse.setQuantity(orderItem.getQuantity());
                        itemResponse.setPriceAtTime(orderItem.getPriceAtTime());
                        ProductVariant variant = orderItem.getVariant();
                        OrderProductVariantResponse variantResponse = new OrderProductVariantResponse();
                        variantResponse.setId(variant.getId());
                        variantResponse.setSku(variant.getSku());
                        variantResponse.setImageUrl(variant.getImageUrl());
                        variantResponse.setPrice(variant.getPrice());
                        Product product = variant.getProduct();
                        OrderProductResponse productResponse = new OrderProductResponse();
                        productResponse.setId(product.getId());
                        productResponse.setName(product.getName());
                        productResponse.setThumbnailUrl(product.getThumbnailUrl());
                        productResponse.setDescription(product.getDescription());
                        productResponse.setSlug(product.getSlug());
                        productResponse.setIsActive(product.isActive());
                        productResponse.setCategory(categoryMapper.toDto(product.getCategory()));
                        productResponse.setItemType(itemTypeMapper.toDto(product.getItemType()));
                        variantResponse.setProduct(productResponse);
                        variantResponse.setAltText(product.getName());
                        variantResponse.setIsActive(variant.isActive());
                        variantResponse.setStockQuantity(variant.getStockQuantity());
                        if (response.getStore() != null) {
                            variantResponse.setStore(response.getStore());
                        }
                        itemResponse.setProductVariant(variantResponse);
                        itemResponse.setCreatedAt(orderItem.getCreatedAt());
                        itemResponse.setUpdatedAt(orderItem.getUpdatedAt());
                        itemResponse.setAddons(new ArrayList<>());
                        itemResponse.setTotalItemPrice(orderItem.getPriceAtTime().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
                        return itemResponse;
                    }).toList();
                    response.setOrderItemResponses(itemResponses);

                    // Shipping cost mặc định
                    response.setShippingCost(BigDecimal.valueOf(30000));
                    return response;
                })
                .toList();
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(responses));
    }

    @GetMapping("/user/status")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUserAndStatus(@AuthenticationPrincipal User user,
                                                                                     @RequestParam("status") OrderStatus status) {
        List<Order> orders = orderHistoryService.getOrdersByStatusAndUserId(status, user.getId());
        List<OrderResponse> responses = orders.stream()
                .map(order -> {
                    OrderResponse response = new OrderResponse();
                    response.setId(order.getId());
                    response.setStatus(order.getStatus());
                    response.setShippingMethod(order.getShippingMethod());
                    response.setPaymentMethod(order.getPaymentMethod());
                    response.setTotalAmount(order.getTotalAmount());
                    response.setNote(order.getNote());
                    response.setCreatedAt(order.getCreatedAt());
                    response.setUpdatedAt(order.getUpdatedAt());

                    // Thông tin cửa hàng
                    Store store = order.getStore();
                    if (store != null) {
                        OrderStoreResponse storeResponse = new OrderStoreResponse();
                        storeResponse.setId(store.getId());
                        storeResponse.setName(store.getName());
                        storeResponse.setImage(store.getLogoUrl());
                        response.setStore(storeResponse);
                    }

                    // Lấy thông tin sản phẩm của đơn hàng
                    List<OrderItem> orderItems = orderItemService.getOrderItemsByOrderId(order.getId());
                    List<OrderItemResponse> itemResponses = orderItems.stream().map(orderItem -> {
                        OrderItemResponse itemResponse = new OrderItemResponse();
                        itemResponse.setId(orderItem.getId());
                        itemResponse.setQuantity(orderItem.getQuantity());
                        itemResponse.setPriceAtTime(orderItem.getPriceAtTime());
                        ProductVariant variant = orderItem.getVariant();
                        OrderProductVariantResponse variantResponse = new OrderProductVariantResponse();
                        variantResponse.setId(variant.getId());
                        variantResponse.setSku(variant.getSku());
                        variantResponse.setImageUrl(variant.getImageUrl());
                        variantResponse.setPrice(variant.getPrice());
                        Product product = variant.getProduct();
                        OrderProductResponse productResponse = new OrderProductResponse();
                        productResponse.setId(product.getId());
                        productResponse.setName(product.getName());
                        productResponse.setThumbnailUrl(product.getThumbnailUrl());
                        productResponse.setDescription(product.getDescription());
                        productResponse.setSlug(product.getSlug());
                        productResponse.setIsActive(product.isActive());
                        productResponse.setCategory(categoryMapper.toDto(product.getCategory()));
                        productResponse.setItemType(itemTypeMapper.toDto(product.getItemType()));
                        variantResponse.setProduct(productResponse);
                        variantResponse.setAltText(product.getName());
                        variantResponse.setIsActive(variant.isActive());
                        variantResponse.setStockQuantity(variant.getStockQuantity());
                        if (response.getStore() != null) {
                            variantResponse.setStore(response.getStore());
                        }
                        itemResponse.setProductVariant(variantResponse);
                        itemResponse.setCreatedAt(orderItem.getCreatedAt());
                        itemResponse.setUpdatedAt(orderItem.getUpdatedAt());
                        itemResponse.setAddons(new ArrayList<>());
                        itemResponse.setTotalItemPrice(orderItem.getPriceAtTime().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
                        return itemResponse;
                    }).toList();
                    response.setOrderItemResponses(itemResponses);

                    // Shipping cost mặc định
                    response.setShippingCost(BigDecimal.valueOf(30000));
                    return response;
                })
                .toList();
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(responses));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<OrderPageResponse>> createOrder(@AuthenticationPrincipal User user,
                                                                      @RequestBody List<Long> selectedItemIds) {
        System.out.println("Đã đến: " + selectedItemIds);

        // Bước 1: Lấy danh sách cart items
        List<CartItem> cartItems = cartService.getCartItemsByIdsAndUserId(selectedItemIds, user.getId());
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        // Bước 2: Nhóm cart items theo storeId
        Map<Long, List<CartItem>> cartItemsByStore = cartItems.stream()
                .collect(Collectors.groupingBy(cartItem -> cartItem.getVariant().getProduct().getStore().getId()));

        List<OrderResponse> orderResponses = new ArrayList<>();

        // Bước 3: Tạo đơn hàng cho từng cửa hàng
        for (Map.Entry<Long, List<CartItem>> entry : cartItemsByStore.entrySet()) {
            Long storeId = entry.getKey();
            List<CartItem> storeCartItems = entry.getValue();

            // Kiểm tra tồn kho trước khi tạo đơn hàng
            for (CartItem cartItem : storeCartItems) {
                ProductVariant variant = cartItem.getVariant();
                int requiredQuantity = cartItem.getQuantity();
                if (variant.getStockQuantity() < requiredQuantity) {
                    throw new ExCustom(HttpStatus.BAD_REQUEST, "Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho");
                }
            }

            // Tạo Order
            Order order = Order.builder()
                    .customer(user)
                    .store(storeCartItems.getFirst().getVariant().getProduct().getStore())
                    .status(OrderStatus.PENDING)
                    .shippingMethod(ShippingMethod.STANDARD)
                    .paymentMethod(PaymentMethod.COD)
                    .totalAmount(BigDecimal.ZERO)
                    .note("")
                    .build();

            // Lưu Order để có ID
            order = orderService.save(order);

            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal shippingCost = BigDecimal.valueOf(30000); // Phí vận chuyển cố định
            List<OrderItemResponse> orderItemResponses = new ArrayList<>();

            // Bước 4: Tạo và lưu OrderItem
            for (CartItem cartItem : storeCartItems) {
                ProductVariant variant = cartItem.getVariant();
                int quantity = cartItem.getQuantity();

                // ✅ TÍNH GIÁ VỚI FLASH SALE - CHỈ TÍNH 1 LẦN DUY NHẤT TẠI ĐÂY
                BigDecimal priceAtTime = calculatePriceWithFlashSale(variant, quantity);
                BigDecimal itemTotal = priceAtTime.multiply(BigDecimal.valueOf(quantity));

                // Tạo OrderItem và liên kết với Order
                OrderItem orderItem = OrderItem.builder()
                        .variant(variant)
                        .order(order)
                        .quantity(quantity)
                        .priceAtTime(priceAtTime) // ✅ LƯU GIÁ ĐÃ BAO GỒM FLASH SALE
                        .build();

                // Lưu OrderItem
                orderItemService.save(orderItem);

                // Xử lý addons
                List<CartItemAddon> cartItemAddons = cartService.getAddonsByCartItemId(cartItem.getId());
                List<OrderItemAddonResponse> addonResponses = new ArrayList<>();
                BigDecimal addonTotal = BigDecimal.ZERO;

                for (CartItemAddon cartItemAddon : cartItemAddons) {
                    Addon addon = cartItemAddon.getAddon();
                    BigDecimal priceAdjustAtTime = addon.getPriceAdjust();

                    OrderItemAddon orderItemAddon = OrderItemAddon.builder()
                            .orderItem(orderItem)
                            .addon(addon)
                            .priceAdjustAtTime(priceAdjustAtTime)
                            .build();
                    orderItemAddonService.save(orderItemAddon);

                    addonTotal = addonTotal.add(priceAdjustAtTime);
                    OrderItemAddonResponse addonDTO = new OrderItemAddonResponse();
                    addonDTO.setAddonName(addon.getName());
                    addonDTO.setAddonGroupName(addon.getAddonGroup().getName());
                    addonDTO.setPriceAdjust(priceAdjustAtTime);
                    addonResponses.add(addonDTO);
                }

                itemTotal = itemTotal.add(addonTotal);

                // ✅ SỬ DỤNG HELPER METHOD ĐỂ TẠO RESPONSE VỚI FLASH SALE
                Store store = order.getStore();
                OrderStoreResponse orderStoreResponse = new OrderStoreResponse();
                orderStoreResponse.setId(store.getId());
                orderStoreResponse.setName(store.getName());
                orderStoreResponse.setImage(store.getLogoUrl());

                OrderItemResponse orderItemResponse = createOrderItemResponseWithFlashSale(
                        orderItem,
                        addonResponses,
                        itemTotal,
                        orderStoreResponse
                );

                orderItemResponses.add(orderItemResponse);
                totalAmount = totalAmount.add(itemTotal);
            }

            // Cập nhật totalAmount cho Order (bao gồm phí vận chuyển)
            order.setTotalAmount(totalAmount.add(shippingCost));
            orderService.update(order);

            // Lấy danh sách voucher khả dụng cho store
            List<Long> productIds = storeCartItems.stream()
                    .map(item -> item.getVariant().getProduct().getId())
                    .collect(Collectors.toList());

            List<DiscountCodeDTO> availableVouchers = discountCodeService
                    .getApplicableDiscountCodesWithContext(storeId, productIds, user.getId());

            // Tạo OrderResponse
            OrderResponse orderResponse = new OrderResponse();
            orderResponse.setId(order.getId());

            Store store = order.getStore();
            OrderStoreResponse orderStoreResponse = new OrderStoreResponse();
            orderStoreResponse.setId(store.getId());
            orderStoreResponse.setName(store.getName());
            orderStoreResponse.setImage(store.getLogoUrl());

            orderResponse.setStore(orderStoreResponse);
            orderResponse.setStatus(order.getStatus());
            orderResponse.setShippingMethod(order.getShippingMethod());
            orderResponse.setPaymentMethod(order.getPaymentMethod());
            orderResponse.setTotalAmount(order.getTotalAmount());
            orderResponse.setNote(order.getNote());
            orderResponse.setCreatedAt(order.getCreatedAt());
            orderResponse.setUpdatedAt(order.getUpdatedAt());
            orderResponse.setOrderItemResponses(orderItemResponses);
            orderResponse.setShippingCost(shippingCost);
            orderResponse.setAvailableVouchers(availableVouchers);

            // ✅ THÊM THỐNG KÊ FLASH SALE CHO ORDER
            setFlashSaleStatsForOrder(orderResponse, orderItemResponses);

            orderResponses.add(orderResponse);
        }

        OrderPageResponse orderPageResponse = new OrderPageResponse();
        orderPageResponse.setOrderResponse(orderResponses);
        ApiResponse<OrderPageResponse> apiResponse = ApiResponseUtils.wrapSuccess(orderPageResponse);
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/buy-now")
    @Transactional
    public ResponseEntity<ApiResponse<OrderPageResponse>> buyNow(@AuthenticationPrincipal User user,
                                                                 @RequestBody BuyNowRequest buyNowRequest) {
        System.out.println("Buy now request: " + buyNowRequest);

        // Validate input
        if (buyNowRequest.getProductVariantId() == null || buyNowRequest.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body(null);
        }

        // Lấy thông tin ProductVariant
        ProductVariant variant = productService.getProductVariantById(buyNowRequest.getProductVariantId());
        if (variant == null || !variant.isActive() || !variant.getProduct().isActive()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Sản phẩm không tồn tại hoặc đã ngừng bán");
        }

        // Kiểm tra tồn kho
        if (variant.getStockQuantity() < buyNowRequest.getQuantity()) {
            throw new ExCustom(HttpStatus.BAD_REQUEST,
                    "Sản phẩm " + variant.getProduct().getName() + " không đủ tồn kho. Còn lại: " + variant.getStockQuantity());
        }

        // Tạo Order
        Order order = Order.builder()
                .customer(user)
                .store(variant.getProduct().getStore())
                .status(OrderStatus.PENDING)
                .shippingMethod(ShippingMethod.STANDARD)
                .paymentMethod(PaymentMethod.COD)
                .totalAmount(BigDecimal.ZERO)
                .note("")
                .build();

        // Lưu Order để có ID
        order = orderService.save(order);

        // ✅ TÍNH GIÁ VỚI FLASH SALE - CHỈ TÍNH 1 LẦN DUY NHẤT TẠI ĐÂY
        int quantity = buyNowRequest.getQuantity();
        BigDecimal priceAtTime = calculatePriceWithFlashSale(variant, quantity);
        BigDecimal itemTotal = priceAtTime.multiply(BigDecimal.valueOf(quantity));

        // Tạo OrderItem
        OrderItem orderItem = OrderItem.builder()
                .variant(variant)
                .order(order)
                .quantity(quantity)
                .priceAtTime(priceAtTime) // ✅ LƯU GIÁ ĐÃ BAO GỒM FLASH SALE
                .build();

        // Lưu OrderItem
        orderItemService.save(orderItem);

        // Xử lý addons nếu có
        List<OrderItemAddonResponse> addonResponses = new ArrayList<>();
        BigDecimal addonTotal = BigDecimal.ZERO;

        if (buyNowRequest.getAddonIds() != null && !buyNowRequest.getAddonIds().isEmpty()) {
            for (Long addonId : buyNowRequest.getAddonIds()) {
                Optional<Addon> addon1 = addonRepo.findById(addonId);
                Addon addon = addon1.get();
                if (addon != null && addon.isActive()) {
                    BigDecimal priceAdjustAtTime = addon.getPriceAdjust();

                    OrderItemAddon orderItemAddon = OrderItemAddon.builder()
                            .orderItem(orderItem)
                            .addon(addon)
                            .priceAdjustAtTime(priceAdjustAtTime)
                            .build();
                    orderItemAddonService.save(orderItemAddon);

                    addonTotal = addonTotal.add(priceAdjustAtTime);

                    OrderItemAddonResponse addonDTO = new OrderItemAddonResponse();
                    addonDTO.setAddonName(addon.getName());
                    addonDTO.setAddonGroupName(addon.getAddonGroup().getName());
                    addonDTO.setPriceAdjust(priceAdjustAtTime);
                    addonResponses.add(addonDTO);
                }
            }
        }

        // Tính tổng tiền item (bao gồm addons)
        itemTotal = itemTotal.add(addonTotal);

        // Tính phí vận chuyển
        BigDecimal shippingCost = BigDecimal.valueOf(30000);

        // Cập nhật totalAmount cho Order (bao gồm phí vận chuyển)
        order.setTotalAmount(itemTotal.add(shippingCost));
        orderService.update(order);

        // Lấy danh sách voucher khả dụng cho store
        List<Long> productIds = List.of(variant.getProduct().getId());
        List<DiscountCodeDTO> availableVouchers = discountCodeService
                .getApplicableDiscountCodesWithContext(variant.getProduct().getStore().getId(), productIds, user.getId());

        // Tạo response objects
        Store store = order.getStore();
        OrderStoreResponse orderStoreResponse = new OrderStoreResponse();
        orderStoreResponse.setId(store.getId());
        orderStoreResponse.setName(store.getName());
        orderStoreResponse.setImage(store.getLogoUrl());

        // ✅ SỬ DỤNG HELPER METHOD ĐỂ TẠO RESPONSE VỚI FLASH SALE
        OrderItemResponse orderItemResponse = createOrderItemResponseWithFlashSale(
                orderItem,
                addonResponses,
                itemTotal,
                orderStoreResponse
        );

        // Tạo OrderResponse
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(order.getId());
        orderResponse.setStore(orderStoreResponse);
        orderResponse.setStatus(order.getStatus());
        orderResponse.setShippingMethod(order.getShippingMethod());
        orderResponse.setPaymentMethod(order.getPaymentMethod());
        orderResponse.setTotalAmount(order.getTotalAmount());
        orderResponse.setNote(order.getNote());
        orderResponse.setCreatedAt(order.getCreatedAt());
        orderResponse.setUpdatedAt(order.getUpdatedAt());
        orderResponse.setOrderItemResponses(List.of(orderItemResponse));
        orderResponse.setShippingCost(shippingCost);
        orderResponse.setAvailableVouchers(availableVouchers);

        // ✅ THÊM THỐNG KÊ FLASH SALE CHO ORDER
        setFlashSaleStatsForOrder(orderResponse, List.of(orderItemResponse));

        // Tạo OrderPageResponse
        OrderPageResponse orderPageResponse = new OrderPageResponse();
        orderPageResponse.setOrderResponse(List.of(orderResponse));

        ApiResponse<OrderPageResponse> apiResponse = ApiResponseUtils.wrapSuccess(orderPageResponse);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/vouchers/{orderId}")
    public ResponseEntity<ApiResponse<List<DiscountCodeDTO>>> getAvailableVouchers(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {

        Order order = orderService.getOrderById(orderId);
        if (order == null || !order.getCustomer().getId().equals(user.getId())) {
            throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
        }

        List<OrderItem> orderItems = orderItemService.getOrderItems(orderId);
        List<Long> productIds = orderItems.stream()
                .map(item -> item.getVariant().getProduct().getId())
                .collect(Collectors.toList());

        List<DiscountCodeDTO> vouchers = discountCodeService
                .getApplicableDiscountCodes(order.getStore().getId(), productIds, user.getId());

        return ok(vouchers, "Lấy danh sách voucher thành công");
    }

    @PutMapping("/update-voucher")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updateVoucher(@AuthenticationPrincipal User user,
                                                           @RequestBody AddressDTO addressDTO,
                                                           @RequestParam("orderIds") List<Long> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Order> orders = orderService.getOrdersByIdAndUserId(orderIds, user.getId());
        for (Order order : orders) {
            OrderShipping orderShipping = orderShippingService.getByOrder(order);
            if (orderShipping == null) {
                orderShipping = new OrderShipping();
                orderShipping.setOrder(order);
            }
            orderShipping.setDeliveryAddress(addressDTO.getDetailAddress());
            orderShipping.setDeliveryProvince(addressDTO.getCity());
            orderShipping.setDeliveryDistrict(addressDTO.getDistrict());
            orderShipping.setDeliveryWard(addressDTO.getWard());
            orderShipping.setDeliveryPhone(addressDTO.getReceiverPhone());
            orderShipping.setCreatedAt(order.getCreatedAt());
            orderShipping.setUpdatedAt(order.getUpdatedAt());
            orderShippingService.save(orderShipping);
        }
        return ok(null, "Cập nhật thành công");
    }

    @PutMapping("/cancel/{orderId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@AuthenticationPrincipal User user,
                                                         @PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        System.out.println("UserId: " + user.getId() + "  CustomerId: " + order.getCustomer().getId());
        if (order == null || !order.getCustomer().getId().equals(user.getId())) {
            throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn hàng đã bị hủy");
        }
        orderService.cancelOrder(orderId);
        return ok(null, "Đơn hàng đã được hủy thành công");
    }

    @PutMapping("/buy-again/{orderId}")
    @Transactional
    public ResponseEntity<ApiResponse<OrderPageResponse>> buyAgain(@AuthenticationPrincipal User user,
                                                                   @PathVariable Long orderId) {
        try {
            OrderPageResponse orderPageResponse = orderService.buyAgain(orderId, user);
            ApiResponse<OrderPageResponse> apiResponse = ApiResponseUtils.wrapSuccess(orderPageResponse);
            return ResponseEntity.ok(apiResponse);
        } catch (ExCustom ex) {
            throw ex; // Re-throw custom exceptions
        } catch (Exception ex) {
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra khi tạo đơn hàng mới");
        }
    }

    @PutMapping("/confirm/{orderId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> confirmOrder(@AuthenticationPrincipal User user,
                                                          @PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            if (order == null || !order.getCustomer().getId().equals(user.getId())) {
                throw new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
            }

            if (order.getStatus() != OrderStatus.DELIVERED) {
                throw new ExCustom(HttpStatus.BAD_REQUEST,
                        "Không thể thực hiện thao tác ĐÃ NHẬN HÀNG vì đơn hàng chưa được giao.");
            }
            balanceTransferService.processOrderStatusChange(order,OrderStatus.CONFIRMED);
            order.setStatus(OrderStatus.CONFIRMED);
            orderService.update(order);
            return updated();

        } catch (ExCustom ex) {
            throw ex; // Re-throw custom exceptions
        } catch (Exception ex) {
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi xảy ra khi tạo đơn hàng mới");
        }
    }

    // ================================
    // ✅ HELPER METHODS CHO FLASH SALE
    // ================================

    /**
     * Lấy thông tin Flash Sale cho OrderItem
     */
    private OrderItemFlashSaleInfo getFlashSaleInfoForOrderItem(OrderItem orderItem) {
        ProductVariant variant = orderItem.getVariant();
        Product product = variant.getProduct();

        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(product.getId());

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Kiểm tra còn số lượng trong flash sale không
            if (flashSale.getSoldCount() + orderItem.getQuantity() <= flashSale.getQuantity()) {
                return OrderItemFlashSaleInfo.builder()
                        .id(flashSale.getId())
                        .percentageDiscount(Double.valueOf(flashSale.getPercentageDiscount()))
                        .quantity(flashSale.getQuantity())
                        .soldCount(flashSale.getSoldCount())
                        .endTime(flashSale.getEndTime().toString())
                        .build();
            }
        }

        return null;
    }

    /**
     * ✅ TÍNH GIÁ VỚI FLASH SALE CHO PRODUCT VARIANT - CHỈ DÙNG KHI TẠO ORDER
     */
    private BigDecimal calculatePriceWithFlashSale(ProductVariant variant, int quantity) {
        Product product = variant.getProduct();
        BigDecimal originalPrice = variant.getPrice();

        Optional<FlashSale> flashSaleOpt = flashSaleRepo.findActiveByProduct_Id(product.getId());

        if (flashSaleOpt.isPresent()) {
            FlashSale flashSale = flashSaleOpt.get();

            // Kiểm tra còn số lượng trong flash sale không
            if (flashSale.getSoldCount() + quantity <= flashSale.getQuantity()) {
                // Áp dụng giá flash sale
                return originalPrice.multiply(
                        BigDecimal.valueOf(100 - flashSale.getPercentageDiscount())
                ).divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
            }
        }

        return originalPrice; // Không có flash sale hoặc hết số lượng
    }

    /**
     * Tạo OrderItemResponse với thông tin Flash Sale
     */
    private OrderItemResponse createOrderItemResponseWithFlashSale(OrderItem orderItem,
                                                                   List<OrderItemAddonResponse> addonResponses,
                                                                   BigDecimal itemTotal,
                                                                   OrderStoreResponse storeResponse) {
        ProductVariant variant = orderItem.getVariant();
        Product product = variant.getProduct();

        // Tạo product response
        OrderProductResponse orderProductResponse = new OrderProductResponse();
        orderProductResponse.setId(product.getId());
        orderProductResponse.setName(product.getName());
        orderProductResponse.setThumbnailUrl(product.getThumbnailUrl());
        orderProductResponse.setDescription(product.getDescription());
        orderProductResponse.setSlug(product.getSlug());
        orderProductResponse.setIsActive(product.isActive());
        orderProductResponse.setCategory(categoryMapper.toDto(product.getCategory()));
        orderProductResponse.setItemType(itemTypeMapper.toDto(product.getItemType()));

        // Tạo variant response
        OrderProductVariantResponse orderProductVariantResponse = new OrderProductVariantResponse();
        orderProductVariantResponse.setId(variant.getId());
        orderProductVariantResponse.setProduct(orderProductResponse);
        orderProductVariantResponse.setAltText(variant.getProduct().getName());
        orderProductVariantResponse.setImageUrl(variant.getImageUrl());
        orderProductVariantResponse.setSku(variant.getSku());
        orderProductVariantResponse.setIsActive(variant.isActive());
        orderProductVariantResponse.setStockQuantity(variant.getStockQuantity());
        orderProductVariantResponse.setPrice(variant.getPrice());
        orderProductVariantResponse.setStore(storeResponse);

        // Tạo order item response
        OrderItemResponse orderItemResponse = new OrderItemResponse();
        orderItemResponse.setId(orderItem.getId());
        orderItemResponse.setProductVariant(orderProductVariantResponse);
        orderItemResponse.setQuantity(orderItem.getQuantity());
        orderItemResponse.setPriceAtTime(orderItem.getPriceAtTime());
        orderItemResponse.setCreatedAt(orderItem.getCreatedAt());
        orderItemResponse.setUpdatedAt(orderItem.getUpdatedAt());
        orderItemResponse.setAddons(addonResponses);
        orderItemResponse.setTotalItemPrice(itemTotal);

        // ✅ THÊM THÔNG TIN FLASH SALE
        OrderItemFlashSaleInfo flashSaleInfo = getFlashSaleInfoForOrderItem(orderItem);
        if (flashSaleInfo != null) {
            orderItemResponse.setFlashSale(flashSaleInfo);
            orderItemResponse.setOriginalPrice(variant.getPrice()); // Giá gốc
            orderItemResponse.setHasFlashSale(true);
        } else {
            orderItemResponse.setHasFlashSale(false);
        }

        return orderItemResponse;
    }

    /**
     * Tính thống kê Flash Sale cho OrderResponse
     */
    private void setFlashSaleStatsForOrder(OrderResponse orderResponse, List<OrderItemResponse> orderItemResponses) {
        boolean hasFlashSaleItems = false;
        BigDecimal totalFlashSavings = BigDecimal.ZERO;
        int flashSaleItemCount = 0;

        for (OrderItemResponse item : orderItemResponses) {
            if (item.getHasFlashSale() != null && item.getHasFlashSale()) {
                hasFlashSaleItems = true;
                flashSaleItemCount++;

                // Tính tiền tiết kiệm từ flash sale
                if (item.getOriginalPrice() != null) {
                    BigDecimal originalTotal = item.getOriginalPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal flashSaleTotal = item.getPriceAtTime().multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal savings = originalTotal.subtract(flashSaleTotal);
                    totalFlashSavings = totalFlashSavings.add(savings);
                }
            }
        }

        // Set thông tin Flash Sale cho OrderResponse
        orderResponse.setHasFlashSaleItems(hasFlashSaleItems);
        orderResponse.setTotalFlashSavings(totalFlashSavings);
        orderResponse.setFlashSaleItemCount(flashSaleItemCount);
    }
}