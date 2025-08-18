package com.quadra.ecommerce_api.common.validators;

import com.quadra.ecommerce_api.common.annotation.ValidEmoji;
import com.vdurmont.emoji.EmojiManager;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidEmojiValidator implements ConstraintValidator<ValidEmoji, String> {

    @Override
    public void initialize(ValidEmoji constraintAnnotation) {
        // Không cần init gì thêm
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true; // Cho phép optional
        }
        // Remove variation selectors (FE0E và FE0F) để normalize
        String sanitized = value.replaceAll("[\uFE0E\uFE0F]", "");
        return EmojiManager.isOnlyEmojis(sanitized);
    }
}
