package com.quadra.ecommerce_api.service.customer.address;

import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.dto.custom.address.ProvinceResponse;
import com.quadra.ecommerce_api.dto.custom.address.request.AddAddress;
import com.quadra.ecommerce_api.entity.address.Address;
import com.quadra.ecommerce_api.entity.address.District;
import com.quadra.ecommerce_api.entity.address.Province;
import com.quadra.ecommerce_api.entity.address.Ward;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.repository.address.AddressRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class AddressService {
    private final AddressRepo addressRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public AddressService(AddressRepo addressRepository, RestTemplate restTemplate) {
        this.addressRepository = addressRepository;
        this.restTemplate = restTemplate;
    }
    public List<Province> getAllProvinces() {
        String url = "https://provinces.open-api.vn/api/?depth=1";
        Province[] provinces = restTemplate.getForObject(url, Province[].class);
        return Arrays.asList(provinces);
    }

    public List<District> getDistrictsByProvince(String provinceCode) {
        String url = "https://provinces.open-api.vn/api/p/" + provinceCode + "?depth=2";
        ProvinceResponse response = restTemplate.getForObject(url, ProvinceResponse.class);
        return response.getDistricts();
    }

    public List<Ward> getWardsByDistrict(String districtCode) {
        String url = "https://provinces.open-api.vn/api/d/" + districtCode + "?depth=2";
        District district = restTemplate.getForObject(url, District.class);
        return district.getWards();
    }

    public List<Address> getAddressesByUser(User user) {
        return addressRepository.findByUser(user);
    }

    public Address getAddressByIdAndUser(Long id, User user) {
        return addressRepository.findByIdAndUser(id, user);
    }

    @Transactional
    public Address saveAddress(AddAddress address, User user) {
        Address address1 = new Address();
        // Gán người dùng cho địa chỉ
        System.out.println("Check Add Address 2");
        address1.setUser(user);
        address1.setDetailAddress(address.getDetailAddress());
        address1.setReceiverName(address.getReceiverName());
        address1.setReceiverPhone(address.getReceiverPhone());

        address1.setCity(address.getCity());
        address1.setCityCode(address.getCityCode());

        address1.setDistrict(address.getDistrict());
        address1.setDistrictCode(address.getDistrictCode());

        address1.setWard(address.getWard());
        address1.setWardCode(address.getWardCode());

        System.out.println("Check Add Address null");
        if(address.getIsDefault() != null){
            address1.setDefault(address.getIsDefault());
            // Xử lý logic địa chỉ mặc định
            if (address.getIsDefault()) {
                List<Address> userAddresses = addressRepository.findByUser(user);
                for (Address addr : userAddresses) {
                    if (addr.isDefault()) {
                        addr.setDefault(false);
                        addressRepository.save(addr);
                    }
                }
                System.out.println("Check Add Address 4");
            }
        }else{
            address1.setDefault(false);
        }

        addressRepository.save(address1);

        // Kiểm tra nếu không có mặc định thì sẽ lấy cái đầu tien làm mặc định
        List<Address> userAddresses = addressRepository.findByUser(user);
        if(!userAddresses.isEmpty()){
            boolean isDefault = false;
            for (Address addr : userAddresses) {
                if (addr.isDefault()) {
                    isDefault = true;
                }
            }
            if(!isDefault){
                Address address2 = userAddresses.get(0);
                address2.setDefault(true);
                return addressRepository.save(address2);
            }
        }

        System.out.println("Check Add Address 5");
        return address1;
    }

    @Transactional
    public Address updateAddress(Long id, AddAddress updatedAddress, User user) {
        Address existingAddress = getAddressByIdAndUser(id, user);
        // Cập nhật các trường
        existingAddress.setReceiverName(updatedAddress.getReceiverName());
        existingAddress.setReceiverPhone(updatedAddress.getReceiverPhone());
        existingAddress.setWard(updatedAddress.getWard());
        existingAddress.setWardCode(updatedAddress.getWardCode());
        existingAddress.setDistrict(updatedAddress.getDistrict());
        existingAddress.setDistrictCode(updatedAddress.getDistrictCode());
        existingAddress.setCity(updatedAddress.getCity());
        existingAddress.setCityCode(updatedAddress.getCityCode());
        existingAddress.setDetailAddress(updatedAddress.getDetailAddress());
        existingAddress.setDefault(updatedAddress.getIsDefault());

        // Xử lý logic địa chỉ mặc định
        if (updatedAddress.getIsDefault()) {
            List<Address> userAddresses = addressRepository.findByUser(user);
            for (Address addr : userAddresses) {
                if (addr.isDefault() && !addr.getId().equals(id)) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
        }
         addressRepository.save(existingAddress);

        // Kiểm tra nếu không có mặc định thì sẽ lấy cái đầu tien làm mặc định
        List<Address> userAddresses = addressRepository.findByUser(user);
        if(!userAddresses.isEmpty()){
            boolean isDefault = false;
            for (Address addr : userAddresses) {
                if (addr.isDefault()) {
                    isDefault = true;
                }
            }
            if(!isDefault){
                Address address2 = userAddresses.get(0);
                address2.setDefault(true);
                return addressRepository.save(address2);
            }
        }
        return existingAddress;
    }

    @Transactional
    public Address updateAddressDefault(Long id, User user) {
        Address existingAddress = getAddressByIdAndUser(id, user);
        existingAddress.setDefault(true);
        // Xử lý logic địa chỉ mặc định
        if (existingAddress.isDefault()) {
            List<Address> userAddresses = addressRepository.findByUser(user);
            for (Address addr : userAddresses) {
                if (addr.isDefault() && !addr.getId().equals(id)) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
        }
        System.out.println("Check Default Address 2: "+existingAddress);
        return addressRepository.save(existingAddress);
    }

    public void deleteAddress(Long id, User user) {
        Address address = getAddressByIdAndUser(id, user);
        addressRepository.delete(address);
    }


    public AddressDTO getAddressDefaultByUser(User user) {
        return addressRepository.findDefaultByUser(user);
    }
}