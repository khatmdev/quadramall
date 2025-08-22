package com.quadra.ecommerce_api.service.shiping;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quadra.ecommerce_api.dto.custom.shipping.request.ApproveShipperRequest;
import com.quadra.ecommerce_api.dto.custom.shipping.request.RejectShipperRequest;
import com.quadra.ecommerce_api.dto.custom.shipping.request.ShipperRegistrationRequest;
import com.quadra.ecommerce_api.dto.custom.shipping.response.ShipperRegistrationResponse;
import com.quadra.ecommerce_api.dto.custom.shipping.response.ShipperRegistrationStatusResponse;
import com.quadra.ecommerce_api.dto.custom.shipping.response.ShipperStatsDTO;
import com.quadra.ecommerce_api.entity.shipping.Shipper;
import com.quadra.ecommerce_api.entity.shipping.ShipperRegistration;
import com.quadra.ecommerce_api.entity.user.Role;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.enums.shipping.RegistrationStatus;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.repository.shipping.ShipperRegistrationRepository;
import com.quadra.ecommerce_api.repository.shipping.ShipperRepository;
import com.quadra.ecommerce_api.repository.user.RoleRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipperService {

    private final ShipperRegistrationRepository shipperRegistrationRepository;
    private final ShipperRepository shipperRepository;
    private final RoleRepo roleRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ShipperRegistrationResponse registerShipper(User user, ShipperRegistrationRequest request) {
        // Kiểm tra xem user đã đăng ký làm shipper chưa
        if (shipperRegistrationRepository.existsByUserIdAndStatus(user.getId(), RegistrationStatus.PENDING) ||
                shipperRegistrationRepository.existsByUserIdAndStatus(user.getId(), RegistrationStatus.APPROVED)) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Bạn đã đăng ký làm shipper rồi");
        }

        try {

            ShipperRegistration registration = ShipperRegistration.builder()
                    .user(user)
                    .vehicleType(request.getVehicleType())
                    .licensePlate(request.getLicensePlate())
                    .idCardNumber(request.getIdCardNumber())
                    .idCardFrontUrl(request.getIdCardFrontUrl())
                    .idCardBackUrl(request.getIdCardBackUrl())
                    .driverLicenseUrl(request.getDriverLicenseUrl())
                    .vehicleRegistrationUrl(request.getVehicleRegistrationUrl())
                    .status(RegistrationStatus.PENDING)
                    .build();

            ShipperRegistration saved = shipperRegistrationRepository.save(registration);

            log.info("User {} registered as shipper with ID {}", user.getId(), saved.getId());

            return mapToRegistrationResponse(saved);
        } catch (Exception e) {
            log.error("Error registering shipper for user {}: {}", user.getId(), e.getMessage());
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi đăng ký shipper");
        }
    }

    public Page<ShipperRegistrationResponse> getPendingRegistrations(Pageable pageable) {
        Page<ShipperRegistration> registrations = shipperRegistrationRepository
                .findByStatusOrderByCreatedAtAsc(RegistrationStatus.PENDING, pageable);

        return registrations.map(this::mapToRegistrationResponse);
    }

    @Transactional
    public void approveShipper(Long registrationId, User approvedBy, ApproveShipperRequest request) {
        ShipperRegistration registration = shipperRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đăng ký"));

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn đăng ký đã được xử lý");
        }

        try {
            // Cập nhật trạng thái đăng ký
            registration.setStatus(RegistrationStatus.APPROVED);
            registration.setApprovedBy(approvedBy);


            shipperRegistrationRepository.save(registration);

            // Tạo shipper profile
            String shipperCode = generateShipperCode();
            Shipper shipper = Shipper.builder()
                    .user(registration.getUser())
                    .shipperCode(shipperCode)
                    .vehicleType(registration.getVehicleType())
                    .licensePlate(registration.getLicensePlate())
                    .isActive(true)
                    .build();

            shipperRepository.save(shipper);

            // Thêm role SHIPPER cho user
            Role shipperRole = roleRepository.findByName("ROLE_SHIPPER")
                    .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy role SHIPPER"));

            registration.getUser().getRoles().add(shipperRole);

            log.info("Approved shipper registration {} for user {}", registrationId, registration.getUser().getId());

        } catch (Exception e) {
            log.error("Error approving shipper registration {}: {}", registrationId, e.getMessage());
            throw new ExCustom(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi duyệt đơn đăng ký");
        }
    }

    @Transactional
    public void rejectShipper(Long registrationId, RejectShipperRequest request) {
        ShipperRegistration registration = shipperRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đăng ký"));

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Đơn đăng ký đã được xử lý");
        }

        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setRejectionReason(request.getRejectionReason());

        shipperRegistrationRepository.save(registration);

        log.info("Rejected shipper registration {} with reason: {}", registrationId, request.getRejectionReason());
    }

    public ShipperStatsDTO getShipperStats(User user) {
        Shipper shipper = shipperRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ExCustom(HttpStatus.NOT_FOUND, "Bạn chưa được duyệt làm shipper hoặc chưa đăng ký"));

        BigDecimal successRate = BigDecimal.ZERO;
        if (shipper.getTotalDeliveries() > 0) {
            successRate = BigDecimal.valueOf(shipper.getSuccessfulDeliveries())
                    .divide(BigDecimal.valueOf(shipper.getTotalDeliveries()), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        ShipperStatsDTO stats = new ShipperStatsDTO();
        stats.setShipperCode(shipper.getShipperCode());
        stats.setShipperName(shipper.getUser().getFullName());
        stats.setRating(shipper.getRating());
        stats.setTotalDeliveries(shipper.getTotalDeliveries());
        stats.setSuccessfulDeliveries(shipper.getSuccessfulDeliveries());
        stats.setSuccessRate(successRate);

        return stats;
    }

    /**
     * Get registration status - works for all users who have registered
     */
    public ShipperRegistrationStatusResponse getRegistrationStatus(User user) {
        // First, try to find registration
        Optional<ShipperRegistration> registrationOpt = shipperRegistrationRepository.findByUserId(user.getId());

        if (registrationOpt.isEmpty()) {
            throw new ExCustom(HttpStatus.NOT_FOUND, "Bạn chưa đăng ký làm shipper");
        }

        ShipperRegistration registration = registrationOpt.get();
        ShipperRegistrationStatusResponse response = new ShipperRegistrationStatusResponse();

        // Map registration data
        response.setRegistrationId(registration.getId());
        response.setUserFullName(registration.getUser().getFullName());
        response.setUserEmail(registration.getUser().getEmail());
        response.setVehicleType(registration.getVehicleType());
        response.setLicensePlate(registration.getLicensePlate());
        response.setIdCardNumber(registration.getIdCardNumber());
        response.setStatus(registration.getStatus());
        response.setRejectionReason(registration.getRejectionReason());
        response.setRegistrationCreatedAt(registration.getCreatedAt());
        response.setRegistrationUpdatedAt(registration.getUpdatedAt());

        // If approved, also get shipper data
        if (registration.getStatus() == RegistrationStatus.APPROVED) {
            Optional<Shipper> shipperOpt = shipperRepository.findByUserId(user.getId());
            if (shipperOpt.isPresent()) {
                Shipper shipper = shipperOpt.get();
                response.setShipperId(shipper.getId());
                response.setShipperCode(shipper.getShipperCode());
                response.setIsActive(shipper.getIsActive());
                response.setTotalDeliveries(shipper.getTotalDeliveries());
                response.setSuccessfulDeliveries(shipper.getSuccessfulDeliveries());
                response.setRating(shipper.getRating());
                response.setShipperCreatedAt(shipper.getCreatedAt());
            }
        }

        return response;
    }

    private String generateShipperCode() {
        String code;
        do {
            code = "SP" + String.format("%06d", (int) (Math.random() * 1000000));
        } while (shipperRepository.existsByShipperCode(code));

        return code;
    }

    private ShipperRegistrationResponse mapToRegistrationResponse(ShipperRegistration registration) {
        ShipperRegistrationResponse response = new ShipperRegistrationResponse();
        response.setId(registration.getId());
        response.setUserFullName(registration.getUser().getFullName());
        response.setUserEmail(registration.getUser().getEmail());
        response.setVehicleType(registration.getVehicleType());
        response.setLicensePlate(registration.getLicensePlate());
        response.setIdCardNumber(registration.getIdCardNumber());
        response.setIdCardFrontUrl(registration.getIdCardFrontUrl());
        response.setIdCardBackUrl(registration.getIdCardBackUrl());
        response.setDriverLicenseUrl(registration.getDriverLicenseUrl());
        response.setStatus(registration.getStatus());
        response.setRejectionReason(registration.getRejectionReason());
        response.setCreatedAt(registration.getCreatedAt());
        response.setUpdatedAt(registration.getUpdatedAt());

        return response;
    }
}