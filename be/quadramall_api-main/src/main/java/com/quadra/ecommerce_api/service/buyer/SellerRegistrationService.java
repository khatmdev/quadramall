package com.quadra.ecommerce_api.service.buyer;

import com.quadra.ecommerce_api.dto.admin.response.SellerRegistrationResponseDto;
import com.quadra.ecommerce_api.dto.buyer.request.SellerRegistrationRequestDto;
import com.quadra.ecommerce_api.dto.buyer.request.RegistrationUpdateRequestDto;
import com.quadra.ecommerce_api.dto.buyer.response.RegistrationDetailsDto;
import com.quadra.ecommerce_api.entity.store.SellerRegistration;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.store.RegistrationStatus;
import com.quadra.ecommerce_api.mapper.buyer.request.SellerRegistrationMapper;
import com.quadra.ecommerce_api.mapper.buyer.response.RegistrationMapper;
import com.quadra.ecommerce_api.repository.store.SellerRegistrationRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service
public class SellerRegistrationService {

    private final SellerRegistrationRepo sellerRegistrationRepository;
    private final SellerRegistrationMapper sellerRegistrationMapper;
    private final RegistrationMapper registrationMapper;

    @Autowired
    public SellerRegistrationService(
            SellerRegistrationRepo sellerRegistrationRepository,
            SellerRegistrationMapper sellerRegistrationMapper,
            RegistrationMapper registrationMapper) {
        this.sellerRegistrationRepository = sellerRegistrationRepository;
        this.sellerRegistrationMapper = sellerRegistrationMapper;
        this.registrationMapper = registrationMapper;
    }

    /**
     * Lấy trạng thái đăng ký của user hiện tại (chỉ PENDING hoặc REJECTED)
     * Trả về null nếu không tìm thấy đăng ký nào
     */
    public RegistrationDetailsDto getCurrentUserRegistration() {
        // Lấy User từ SecurityContextHolder
        User user = getCurrentUser();

        // Tìm đăng ký PENDING hoặc REJECTED mới nhất (bỏ qua APPROVED)
        Optional<SellerRegistration> registrationOpt = sellerRegistrationRepository
                .findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                        user.getId(),
                        Arrays.asList(RegistrationStatus.PENDING, RegistrationStatus.REJECTED)
                );

        // Trả về null thay vì throw exception khi không tìm thấy
        return registrationOpt.map(registrationMapper::toDetailsDto).orElse(null);
    }

    /**
     * Đăng ký cửa hàng mới
     */
    @Transactional
    public SellerRegistrationResponseDto registerStore(SellerRegistrationRequestDto requestDto) {
        // Lấy User từ SecurityContextHolder
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new IllegalStateException("Người dùng chưa được xác thực hoặc không hợp lệ");
        }

        // Kiểm tra email từ DTO khớp với email của người dùng đã xác thực
        if (!user.getEmail().equals(requestDto.getEmail())) {
            throw new IllegalArgumentException("Email trong yêu cầu không khớp với người dùng đã xác thực");
        }

        // Kiểm tra xem user đã có đăng ký PENDING chưa
        if (sellerRegistrationRepository.existsByUserEmailAndStatus(user.getEmail(), RegistrationStatus.PENDING)) {
            throw new IllegalStateException("Người dùng đã có một yêu cầu đăng ký cửa hàng đang chờ xử lý");
        }

        // Ánh xạ DTO sang entity
        SellerRegistration sellerRegistration = sellerRegistrationMapper.toEntity(requestDto);
        sellerRegistration.setStatus(RegistrationStatus.PENDING);
        sellerRegistration.setUser(user);

        // Lưu vào database
        SellerRegistration savedRegistration = sellerRegistrationRepository.save(sellerRegistration);

        // Ánh xạ entity sang Response DTO
        return sellerRegistrationMapper.toResponseDto(savedRegistration);
    }

    /**
     * Lấy chi tiết đăng ký để chỉnh sửa (cho trạng thái REJECTED)
     */
    public RegistrationDetailsDto getRegistrationDetails(Long registrationId) {
        // Lấy User từ SecurityContextHolder
        User user = getCurrentUser();

        // Tìm đăng ký theo ID
        SellerRegistration registration = sellerRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đăng ký với ID: " + registrationId));

        // Kiểm tra quyền sở hữu
        if (!registration.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập đăng ký này");
        }

        // Kiểm tra trạng thái REJECTED
        if (registration.getStatus() != RegistrationStatus.REJECTED) {
            throw new IllegalStateException("Chỉ có thể chỉnh sửa đăng ký ở trạng thái REJECTED");
        }

        return registrationMapper.toDetailsDto(registration);
    }

    /**
     * Cập nhật đăng ký (cho trạng thái REJECTED)
     */
    @Transactional
    public SellerRegistrationResponseDto updateRegistration(Long registrationId, RegistrationUpdateRequestDto updateDto) {
        // Lấy User từ SecurityContextHolder
        User user = getCurrentUser();

        // Tìm đăng ký theo ID
        SellerRegistration registration = sellerRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đăng ký với ID: " + registrationId));

        // Kiểm tra quyền sở hữu
        if (!registration.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật đăng ký này");
        }

        // Kiểm tra trạng thái REJECTED
        if (registration.getStatus() != RegistrationStatus.REJECTED) {
            throw new IllegalStateException("Chỉ có thể cập nhật đăng ký ở trạng thái REJECTED");
        }

        // Cập nhật thông tin từ DTO
        registrationMapper.updateEntityFromUpdateDto(registration, updateDto);

        // Lưu vào database
        SellerRegistration updatedRegistration = sellerRegistrationRepository.save(registration);

        // Ánh xạ entity sang Response DTO
        return sellerRegistrationMapper.toResponseDto(updatedRegistration);
    }

    /**
     * Hủy đăng ký
     */
    @Transactional
    public void cancelRegistration(Long registrationId) {
        // Lấy User từ SecurityContextHolder
        User user = getCurrentUser();

        // Tìm đăng ký theo ID
        SellerRegistration registration = sellerRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đăng ký với ID: " + registrationId));

        // Kiểm tra quyền sở hữu
        if (!registration.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đăng ký này");
        }

        // Chỉ cho phép hủy đăng ký ở trạng thái PENDING hoặc REJECTED
        if (registration.getStatus() == RegistrationStatus.APPROVED) {
            throw new IllegalStateException("Không thể hủy đăng ký đã được phê duyệt");
        }

        // Xóa đăng ký khỏi database
        sellerRegistrationRepository.delete(registration);
    }

    /**
     * Lấy thông tin user hiện tại từ SecurityContext
     */
    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new IllegalStateException("Người dùng chưa được xác thực hoặc không hợp lệ");
        }
        return user;
    }
}