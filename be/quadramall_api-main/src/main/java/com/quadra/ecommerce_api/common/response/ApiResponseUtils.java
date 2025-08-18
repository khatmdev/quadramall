package com.quadra.ecommerce_api.common.response;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

public class ApiResponseUtils {

    private static long now() {
        return Instant.now().toEpochMilli();
    }

    // ======== Success builder (internal use) ========
    private static <T> ApiResponse<T> buildSuccess(String message, T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .message(message)
                .data(data)
                .errorCode(null)
                .timestamp(now())
                .build();
    }

    // ======== Error builder (internal use) ========
    private static <T> ApiResponse<T> buildError(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .status("error")
                .message(message)
                .data(null)
                .errorCode(errorCode)
                .timestamp(now())
                .build();
    }

    // ======== Success responses ========
    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(buildSuccess("Thành công", data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(buildSuccess(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buildSuccess("Tạo mới thành công", data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buildSuccess(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> updated() {
        return ResponseEntity.ok(buildSuccess("Cập nhật thành công", null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> updated(String message) {
        return ResponseEntity.ok(buildSuccess(message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> updated(T data) {
        return ResponseEntity.ok(buildSuccess("Cập nhật thành công", data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> updated(T data, String message) {
        return ResponseEntity.ok(buildSuccess(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> deleted() {
        return ResponseEntity.ok(buildSuccess("Xóa thành công", null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> deleted(String message) {
        return ResponseEntity.ok(buildSuccess(message, null));
    }

    // ======== Error responses ========
    public static <T> ResponseEntity<ApiResponse<T>> error(String message, HttpStatus status, String errorCode) {
        return ResponseEntity.status(status).body(buildError(message, errorCode));
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(String message, int statusCode, String errorCode) {
        return ResponseEntity.status(statusCode).body(buildError(message, errorCode));
    }

    // ======== Manual wrap (for Aspect, etc) ========
    public static <T> ApiResponse<T> wrapSuccess(T data) {
        return buildSuccess("Thành công", data);
    }
}

