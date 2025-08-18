package com.quadra.ecommerce_api.common.base;

import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Controller cho người bán (chủ store, quản lý sản phẩm, đơn hàng...).
 */
@PreAuthorize("hasRole('SELLER')")
public abstract class AbstractSellerController extends BaseController {
}
