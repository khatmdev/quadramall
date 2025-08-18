package com.quadra.ecommerce_api.repository.address;

import com.quadra.ecommerce_api.dto.base.address.AddressDTO;
import com.quadra.ecommerce_api.entity.address.Address;
import com.quadra.ecommerce_api.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepo extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    Address findByIdAndUser(Long id, User user);
    @Query("""
      SELECT new com.quadra.ecommerce_api.dto.base.address.AddressDTO(
        a.id,
        a.receiverName,
        a.receiverPhone,
        a.detailAddress,
        a.ward,
        a.district,
        a.city,
        a.cityCode,
        a.wardCode,
        a.districtCode,
        a.isDefault
      )
      FROM Address a
      WHERE a.user = :user
        AND a.isDefault = true
    """)
    AddressDTO findDefaultByUser(User user);

}
