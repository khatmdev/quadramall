package com.quadra.ecommerce_api.common.annotation;

import com.quadra.ecommerce_api.common.validators.ValidEmojiValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ValidEmojiValidator.class) // Liên kết với validator class
@Target({ ElementType.FIELD, ElementType.PARAMETER }) // Áp dụng cho field hoặc param
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmoji {
    String message() default "Emoji chỉ được chứa các ký tự emoji hợp lệ";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
