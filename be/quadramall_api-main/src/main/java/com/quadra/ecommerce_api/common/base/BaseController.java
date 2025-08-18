package com.quadra.ecommerce_api.common.base;

import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.common.response.ApiResponseUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public abstract class BaseController {

    // ===== SUCCESS =====
    protected <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ApiResponseUtils.success(data);
    }

    protected <T> ResponseEntity<ApiResponse<T>> ok(T data, String message) {
        return ApiResponseUtils.success(data, message);
    }

    protected <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ApiResponseUtils.created(data);
    }

    protected <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ApiResponseUtils.created(data, message);
    }

    // Dạng 1: Không trả dữ liệu, chỉ báo thành công
    protected <T> ResponseEntity<ApiResponse<T>> updated() {
        return ApiResponseUtils.updated();
    }

    protected <T> ResponseEntity<ApiResponse<T>> updated(String message) {
        return ApiResponseUtils.updated(message);
    }

    // Dạng 2: trả về object mới nhất sau cập nhật
    protected <T> ResponseEntity<ApiResponse<T>> updated(T data) {
        return ApiResponseUtils.updated(data); // data không null
    }

    protected <T> ResponseEntity<ApiResponse<T>> updated(T data, String  message) {
        return ApiResponseUtils.updated(data, message); // data không null kèm message customize
    }

    protected <T> ResponseEntity<ApiResponse<T>> deleted() {
        return ApiResponseUtils.deleted();
    }

    protected <T> ResponseEntity<ApiResponse<T>> deleted(String message) {
        return ApiResponseUtils.deleted(message);
    }

    // ===== ERROR =====
    protected <T> ResponseEntity<ApiResponse<T>> error(String message, String errorCode, HttpStatus status) {
        return ApiResponseUtils.error(message, status, errorCode);
    }

    protected <T> ResponseEntity<ApiResponse<T>> error(String message, String errorCode, int statusCode) {
        return ApiResponseUtils.error(message, statusCode, errorCode);
    }
}

