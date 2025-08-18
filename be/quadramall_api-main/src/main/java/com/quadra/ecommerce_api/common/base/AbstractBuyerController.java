package com.quadra.ecommerce_api.common.base;

import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Controller cho người mua đã đăng nhập.
 */
@PreAuthorize("hasRole('BUYER')")
public abstract class AbstractBuyerController extends BaseController {
}
