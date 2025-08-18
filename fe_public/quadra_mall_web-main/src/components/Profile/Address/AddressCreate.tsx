

import React, { useState } from "react";
import { createAddress, AddAddressRequest } from '@/api/addressApi';
import { VN_CITIES, City, District, Ward } from '@/data/vn-address-data';
import Swal from 'sweetalert2';


interface AddressCreateProps {
  address?: Partial<AddAddressRequest>;
  onClose: () => void;
  onCreated?: () => void;
}



const AddressCreate: React.FC<AddressCreateProps> = ({ address, onClose, onCreated }) => {
  const [form, setForm] = useState<Partial<AddAddressRequest>>({
    receiverName: address?.receiverName || '',
    receiverPhone: address?.receiverPhone || '',
    detailAddress: address?.detailAddress || '',
    ward: address?.ward || '',
    district: address?.district || '',
    city: address?.city || '',
    cityCode: address?.cityCode || '',
    districtCode: address?.districtCode || '',
    wardCode: address?.wardCode || '',
    isDefault: address?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lưu trữ danh sách động
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Khi address thay đổi (chỉnh sửa), tự động load districts/wards
  React.useEffect(() => {
    if (address) {
      const cityObj = VN_CITIES.find(c => c.name === address.city);
      setDistricts(cityObj ? cityObj.districts : []);
      const districtObj = cityObj?.districts.find(d => d.name === address.district);
      setWards(districtObj ? districtObj.wards : []);
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === 'city') {
      const cityObj = VN_CITIES.find(c => c.name === value);
      setForm(prev => ({
        ...prev,
        city: value,
        cityCode: cityObj ? cityObj.code : '',
        district: '',
        districtCode: '',
        ward: '',
        wardCode: '',
      }));
      setDistricts(cityObj ? cityObj.districts : []);
      setWards([]);
    } else if (name === 'district') {
      const districtObj = districts.find(d => d.name === value);
      setForm(prev => ({
        ...prev,
        district: value,
        districtCode: districtObj ? districtObj.code : '',
        ward: '',
        wardCode: '',
      }));
      setWards(districtObj ? districtObj.wards : []);
    } else if (name === 'ward') {
      const wardObj = wards.find(w => w.name === value);
      setForm(prev => ({
        ...prev,
        ward: value,
        wardCode: wardObj ? wardObj.code : '',
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: AddAddressRequest & { street: string } = {
        receiverName: form.receiverName || '',
        receiverPhone: form.receiverPhone || '',
        detailAddress: form.detailAddress || '',
        street: form.detailAddress || '', // Thêm trường street cho backend
        ward: form.ward || '',
        district: form.district || '',
        city: form.city || '',
        cityCode: form.cityCode || '',
        wardCode: form.wardCode || '',
        districtCode: form.districtCode || '',
        isDefault: form.isDefault === true,
      };
      if (address && (address as any).id) {
        await import('@/api/addressApi').then(api => api.updateAddress((address as any).id, payload));
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật địa chỉ thành công!',
          confirmButtonColor: '#3b82f6'
        });
      } else {
        await createAddress(payload);
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Thêm địa chỉ mới thành công!',
          confirmButtonColor: '#3b82f6'
        });
      }
      if (onCreated) onCreated();
      onClose();
    } catch {
      setError(address && (address as any).id ? 'Không thể cập nhật địa chỉ!' : 'Không thể tạo địa chỉ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          name="receiverName"
          value={form.receiverName}
          onChange={handleChange}
          placeholder="Họ và tên"
          className="border border-gray-300 p-2 rounded w-full"
        />
        <input
          type="text"
          name="receiverPhone"
          value={form.receiverPhone}
          onChange={handleChange}
          placeholder="Số điện thoại"
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <select
          name="city"
          value={form.city}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full placeholder-gray-400"
        >
          <option value="">Tỉnh/Thành phố</option>
          {VN_CITIES.map(city => (
            <option key={city.code + '-' + city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
        <select
          name="district"
          value={form.district}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full placeholder-gray-400"
          disabled={!districts.length}
        >
          <option value="">Quận/Huyện</option>
          {districts.map(d => (
            <option key={form.cityCode + '-' + d.code + '-' + d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
        <select
          name="ward"
          value={form.ward}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full placeholder-gray-400"
          disabled={!wards.length}
        >
          <option value="">Phường/Xã</option>
          {wards.map(w => (
            <option key={form.districtCode + '-' + w.code + '-' + w.name} value={w.name}>{w.name}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        name="detailAddress"
        value={form.detailAddress}
        onChange={handleChange}
        placeholder="Địa chỉ cụ thể"
        className="border border-gray-300 p-2 rounded w-full mb-4"
      />
      <div className="border border-gray-300 rounded bg-white flex items-center justify-center h-32 mb-4 text-gray-400">
        + Thêm vị trí (Google Maps giả định)
      </div>

      <div className="mb-4">
        <span className="font-medium">Trạng thái:</span>
        <label className="ml-2">
          <input
            type="radio"
            name="isDefault"
            value="true"
            checked={form.isDefault === true}
            onChange={() => setForm(f => ({ ...f, isDefault: true }))}
          />
          <span className="ml-1">Mặc định</span>
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="isDefault"
            value="false"
            checked={form.isDefault === false}
            onChange={() => setForm(f => ({ ...f, isDefault: false }))}
          />
          <span className="ml-1">Không mặc định</span>
        </label>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 border border-gray-300 rounded" onClick={onClose}>
            Trở lại
          </button>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Hoàn thành'}
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
};

export default AddressCreate;
