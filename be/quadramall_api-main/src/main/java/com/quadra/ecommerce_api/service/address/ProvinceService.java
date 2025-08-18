package com.quadra.ecommerce_api.service.address;

import com.quadra.ecommerce_api.dto.custom.address.response.ProvinceApiResponseDTO;
import com.quadra.ecommerce_api.dto.custom.address.response.ProvinceResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProvinceService {

    private final RestTemplate restTemplate;
    private static final String PROVINCE_API_URL = "https://provinces.open-api.vn/api/?depth=1";

    @Autowired
    public ProvinceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ProvinceResponseDTO getAllProvinces() {
        try {
            // Gọi API bên thứ ba
            ProvinceApiResponseDTO[] response = restTemplate.getForObject(PROVINCE_API_URL, ProvinceApiResponseDTO[].class);

            // Map sang List<String>, loại bỏ tiền tố "Tỉnh"/"Thành phố"
            List<String> provinces = Arrays.stream(response)
                    .map(dto -> dto.getName()
                            .replace("Thành phố ", "")
                            .replace("Tỉnh ", ""))
                    .sorted() // Sắp xếp theo alphabet
                    .collect(Collectors.toList());

            // Bọc trong ProvinceResponseDTO
            ProvinceResponseDTO result = new ProvinceResponseDTO();
            result.setData(provinces);
            return result;
        } catch (Exception e) {
            // Xử lý lỗi API bên thứ ba
            throw new RuntimeException("Failed to fetch provinces from external API: " + e.getMessage());
        }
    }
}
