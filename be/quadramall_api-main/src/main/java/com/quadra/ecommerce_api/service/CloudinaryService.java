package com.quadra.ecommerce_api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    // Thư mục mặc định để lưu video trên Cloudinary
    private static final String DEFAULT_VIDEO_FOLDER = "quadra_mall_video";

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "image"
        ));
        return uploadResult.get("secure_url").toString(); // URL của ảnh sau khi upload
    }

    public String uploadVideo(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "video",
                "folder", folder != null && !folder.isEmpty() ? folder : DEFAULT_VIDEO_FOLDER
        ));
        return uploadResult.get("secure_url").toString(); // URL của video sau khi upload
    }

    // Phương thức tiện ích để upload video với thư mục mặc định
    public String uploadVideo(MultipartFile file) throws IOException {
        return uploadVideo(file, DEFAULT_VIDEO_FOLDER);
    }
}