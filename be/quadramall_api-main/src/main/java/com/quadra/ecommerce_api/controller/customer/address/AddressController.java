package com.quadra.ecommerce_api.controller.customer.address;

import com.quadra.ecommerce_api.common.response.ApiResponse;
import com.quadra.ecommerce_api.common.response.ApiResponseUtils;
import com.quadra.ecommerce_api.entity.address.District;
import com.quadra.ecommerce_api.entity.address.Province;
import com.quadra.ecommerce_api.entity.address.Ward;
import com.quadra.ecommerce_api.service.customer.address.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/address")
@Tag(name = "Address Management", description = "Các thao tác liên quan đến tỉnh, quận/huyện và phường/xã")
public class AddressController {
    private final AddressService addressService;

    @Autowired
    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping("/provinces")
    @Operation(summary = "Lấy danh sách tất cả tỉnh", description = "Trả về danh sách tất cả các tỉnh")
    public ResponseEntity<ApiResponse<List<Province>>> getAllProvinces() {
        List<Province> provinces = addressService.getAllProvinces();
        ApiResponse<List<Province>> apiResponse = ApiResponseUtils.wrapSuccess(provinces);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/provinces/{provinceCode}/districts")
    @Operation(summary = "Lấy danh sách quận/huyện theo tỉnh", description = "Trả về danh sách quận/huyện dựa trên mã tỉnh")
    public ResponseEntity<ApiResponse<List<District>>> getDistrictsByProvince(
            @Parameter(name = "provinceCode", description = "Mã của tỉnh", required = true)
            @PathVariable String provinceCode) {
        List<District> districts = addressService.getDistrictsByProvince(provinceCode);
        ApiResponse<List<District>> apiResponse = ApiResponseUtils.wrapSuccess(districts);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/districts/{districtCode}/wards")
    @Operation(summary = "Lấy danh sách phường/xã theo quận/huyện", description = "Trả về danh sách phường/xã dựa trên mã quận/huyện")
    public ResponseEntity<ApiResponse<List<Ward>>> getWardsByDistrict(
            @Parameter(name = "districtCode", description = "Mã của quận/huyện", required = true)
            @PathVariable String districtCode) {
        List<Ward> wards = addressService.getWardsByDistrict(districtCode);
        ApiResponse<List<Ward>> apiResponse = ApiResponseUtils.wrapSuccess(wards);
        return ResponseEntity.ok(apiResponse);
    }
}