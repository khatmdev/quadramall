package com.quadra.ecommerce_api.controller.customer.address;

import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.common.response.ApiResponseUtils;
import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.dto.custom.address.request.AddAddress;
import com.quadra.ecommerce_api.entity.address.Address;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.mapper.base.address.AddressMapper;
import com.quadra.ecommerce_api.service.customer.address.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/users/addresses")
public class UserAddressController {
    private final AddressService addressService;
    private final AddressMapper addressMapper;

    @Autowired
    public UserAddressController(AddressService addressService,
                                 AddressMapper addressMapper) {
        this.addressService = addressService;
        this.addressMapper = addressMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getUserAddresses(@AuthenticationPrincipal User user) {
        List<AddressDTO> addresses = addressService.getAddressesByUser(user)
                .stream().map(
                        addressMapper::toDto
                ).toList();
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(addresses));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Address>> getAddressById(
                                                               @PathVariable Long addressId,
                                                               @AuthenticationPrincipal User user) {

        Address address = addressService.getAddressByIdAndUser(addressId, user);
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(address));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<AddressDTO>> getDefaultAddresses(@AuthenticationPrincipal User user) {
        AddressDTO addressDTO = addressService.getAddressDefaultByUser(user);
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(addressDTO));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDTO>> createAddress(
                                                              @RequestBody AddAddress address,
                                                              @AuthenticationPrincipal User user) {
        System.out.println(address);
        System.out.println("Check Add Address 1");
        Address address1 = addressService.saveAddress(address, user);
        AddressDTO savedAddress = addressMapper.toDto(address1) ;
        System.out.println("Address DTO :" + savedAddress);
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(savedAddress));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
                                                              @PathVariable Long addressId,
                                                              @RequestBody AddAddress address,
                                                              @AuthenticationPrincipal User user) {

        Address updatedAddress = addressService.updateAddress(addressId, address, user);
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(updatedAddress));
    }

    @PutMapping("/default/{addressId}")
    public ResponseEntity<ApiResponse<Address>> updateAddressDefault(
            @PathVariable Long addressId,
            @AuthenticationPrincipal User user) {
        System.out.println("Check Default Address 1");
        Address updatedAddress = addressService.updateAddressDefault(addressId, user);
        System.out.println("Check Default Address 3");
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(updatedAddress));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@AuthenticationPrincipal User user,
                                                           @PathVariable Long addressId) {
        addressService.deleteAddress(addressId, user);
        return ResponseEntity.ok(ApiResponseUtils.wrapSuccess(null));
    }
}