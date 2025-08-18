package com.quadra.ecommerce_api.exception;

import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.common.response.ApiResponseUtils;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ExCustom.class)
    public ResponseEntity<Object> handleApiException(ExCustom ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", ex.getStatus().value());
        response.put("message", ex.getMessage());

        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException ex) {
        return ApiResponseUtils.error(
                "API không tồn tại: " + ex.getRequestURL(),
                HttpStatus.NOT_FOUND,
                "ENDPOINT_NOT_FOUND"
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ApiResponseUtils.error("Không có quyền truy cập: " + ex.getMessage(), HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ApiResponseUtils.error(ex.getMessage(), HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }

    // ✅ CẢI THIỆN XỬ LÝ VALIDATION ERRORS
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        // Lấy field error đầu tiên để hiển thị message chính
        AtomicReference<String> mainErrorMessage = new AtomicReference<>("Dữ liệu không hợp lệ");

        ex.getBindingResult().getAllErrors().forEach(error -> {
            if (error instanceof FieldError fieldError) {
                String fieldName = fieldError.getField();
                String errorMessage = fieldError.getDefaultMessage();
                errors.put(fieldName, errorMessage);

                // Nếu là lỗi đầu tiên, dùng làm message chính
                if (errors.size() == 1) {
                    mainErrorMessage.set(errorMessage);
                }
            }
        });

        return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                .status("error")
                .message(String.valueOf(mainErrorMessage)) // ✅ Hiển thị message validation chính xác
                .errorCode("VALIDATION_ERROR")
                .data(errors)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ApiResponseUtils.error("Phương thức HTTP không hỗ trợ: " + ex.getMessage(), HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED");
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(ConstraintViolationException ex) {
        return ApiResponseUtils.error("Dữ liệu không hợp lệ: " + ex.getMessage(), HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    @ExceptionHandler(ResourceNotFound.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFound(ResourceNotFound ex) {
        return ApiResponseUtils.error(ex.getMessage(), HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException ex) {
        return ApiResponseUtils.error(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, "UNKNOWN");
    }
}