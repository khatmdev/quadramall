package com.quadra.ecommerce_api.dto.custom.productDetail;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private String userName;
    private String avatarUrl;
    private Long likes;
}
