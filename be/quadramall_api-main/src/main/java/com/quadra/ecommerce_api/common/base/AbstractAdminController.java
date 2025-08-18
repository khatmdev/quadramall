package com.quadra.ecommerce_api.common.base;

import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Controller cho quản trị viên hệ thống.
 */
@PreAuthorize("hasRole('ADMIN')")
public abstract class AbstractAdminController extends BaseController {
}
