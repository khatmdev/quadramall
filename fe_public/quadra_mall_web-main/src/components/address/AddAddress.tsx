// AddressModal.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addAddress, fetchAddressesDefault, updateAddress } from '@/store/Address/AddressSile';
import { api } from '@/main';
import { 
  MapPin, 
  User, 
  Phone, 
  Home, 
  X, 
  Check, 
  AlertCircle, 
  Star 
} from 'lucide-react';
import { AppDispatch } from '@/store';
import Swal from 'sweetalert2';

interface AddressModalProps {
  isOpen: boolean;
  editingAddress?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  isOpen, 
  editingAddress, 
  onClose, 
  onSuccess 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  
  interface LocationItem {
    code: string | number;
    name: string;
  }
  
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    detailAddress: '',
    isDefault: false
  });
  
  interface AddressFormErrors {
    receiverName?: string;
    receiverPhone?: string;
    detailAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
  }
  
  const [errors, setErrors] = useState<AddressFormErrors>({});

  const isEditing = !!editingAddress;

  // Load provinces from API
  useEffect(() => {
    if (isOpen) {
      api.get('/address/provinces')
        .then(response => {
          setProvinces(response.data.data);
          
          if (editingAddress) {
            setFormData({
              receiverName: editingAddress.receiverName || '',
              receiverPhone: editingAddress.receiverPhone || '',
              detailAddress: editingAddress.detailAddress || '',
              isDefault: editingAddress.isDefault || false
            });
            
            if (editingAddress.cityCode) {
              setSelectedProvince(editingAddress.cityCode.toString());
            }
            if (editingAddress.districtCode) {
              setSelectedDistrict(editingAddress.districtCode.toString());
            }
            if (editingAddress.wardCode) {
              setSelectedWard(editingAddress.wardCode.toString());
            }
          }
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể tải danh sách tỉnh/thành phố',
            confirmButtonColor: '#3b82f6'
          });
        });
    }
  }, [isOpen, editingAddress]);

  // Initialize form data if editing
  useEffect(() => {
    if (editingAddress && provinces.length > 0) {
      setFormData({
        receiverName: editingAddress.receiverName || '',
        receiverPhone: editingAddress.receiverPhone || '',
        detailAddress: editingAddress.detailAddress || '',
        isDefault: editingAddress.isDefault || false
      });
      
      if (editingAddress.cityCode) {
        setSelectedProvince(editingAddress.cityCode.toString());
      }
      if (editingAddress.districtCode) {
        setSelectedDistrict(editingAddress.districtCode.toString());
      }
      if (editingAddress.wardCode) {
        setSelectedWard(editingAddress.wardCode.toString());
      }
    }
  }, [editingAddress, provinces]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      api.get(`/address/provinces/${selectedProvince}/districts`)
        .then(response => {
          setDistricts(response.data.data);
          if (!isEditing) {
            setSelectedDistrict('');
            setSelectedWard('');
          }
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể tải danh sách quận/huyện',
            confirmButtonColor: '#3b82f6'
          });
        });
    } else {
      setDistricts([]);
      setSelectedDistrict('');
      setSelectedWard('');
    }
  }, [selectedProvince, isEditing]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      api.get(`/address/districts/${selectedDistrict}/wards`)
        .then(response => {
          setWards(response.data.data);
          if (!isEditing) {
            setSelectedWard('');
          }
        })
        .catch(() => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể tải danh sách phường/xã',
            confirmButtonColor: '#3b82f6'
          });
        });
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict, isEditing]);

  // Load districts và wards khi vào chế độ edit
  useEffect(() => {
    const loadEditingData = async () => {
      if (isEditing && editingAddress && selectedProvince) {
        try {
          const districtResponse = await api.get(`/address/provinces/${selectedProvince}/districts`);
          setDistricts(districtResponse.data.data);
          
          if (selectedDistrict) {
            const wardResponse = await api.get(`/address/districts/${selectedDistrict}/wards`);
            setWards(wardResponse.data.data);
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể tải dữ liệu địa chỉ',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
    };
    
    loadEditingData();
  }, [isEditing, editingAddress, selectedProvince, selectedDistrict]);

  const validateForm = () => {
    const newErrors: AddressFormErrors = {};
    if (!formData.receiverName.trim()) newErrors.receiverName = 'Tên người nhận không được để trống';
    if (!formData.receiverPhone.trim()) {
      newErrors.receiverPhone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.receiverPhone)) {
      newErrors.receiverPhone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.detailAddress.trim()) newErrors.detailAddress = 'Địa chỉ chi tiết không được để trống';
    if (!selectedProvince) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    dispatch(fetchAddressesDefault());
    const result = await Swal.fire({
      title: isEditing ? 'Xác nhận cập nhật' : 'Xác nhận thêm địa chỉ',
      text: isEditing ? 'Bạn có chắc chắn muốn cập nhật địa chỉ này?' : 'Bạn có chắc chắn muốn thêm địa chỉ này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isEditing ? 'Cập nhật' : 'Thêm',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    const selectedProvinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
    const selectedDistrictName = districts.find(d => d.code.toString() === selectedDistrict)?.name || '';
    const selectedWardName = wards.find(w => w.code.toString() === selectedWard)?.name || '';

    const data = {
      receiverName: formData.receiverName,
      receiverPhone: formData.receiverPhone,
      detailAddress: formData.detailAddress,
      ward: selectedWardName,
      wardCode: selectedWard,
      district: selectedDistrictName,
      districtCode: selectedDistrict,
      city: selectedProvinceName,
      cityCode: selectedProvince,
      isDefault: formData.isDefault
    };

    const action = isEditing ? updateAddress({ id: editingAddress.id, address: data }) : addAddress(data);
    
    try {
      await dispatch(action).unwrap();
      dispatch(fetchAddressesDefault());
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: isEditing ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công',
        confirmButtonColor: '#3b82f6'
      });
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: isEditing ? 'Lỗi cập nhật địa chỉ' : 'Lỗi thêm địa chỉ',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ receiverName: '', receiverPhone: '', detailAddress: '', isDefault: false });
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-blue-500" size={24} />
              {isEditing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Tên người nhận
            </label>
            <input
              type="text"
              value={formData.receiverName}
              onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.receiverName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên người nhận"
            />
            {errors.receiverName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.receiverName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.receiverPhone}
              onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.receiverPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập số điện thoại"
            />
            {errors.receiverPhone && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.receiverPhone}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.province ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(province => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>
              {errors.province && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.province}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedProvince}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.district ? 'border-red-500' : 'border-gray-300'
                } ${!selectedProvince ? 'bg-gray-100' : ''}`}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code.toString()}>{district.name}</option>
                ))}
              </select>
              {errors.district && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.district}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={!selectedDistrict}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.ward ? 'border-red-500' : 'border-gray-300'
                } ${!selectedDistrict ? 'bg-gray-100' : ''}`}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code.toString()}>{ward.name}</option>
                ))}
              </select>
              {errors.ward && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.ward}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home size={16} className="inline mr-1" />
              Địa chỉ chi tiết
            </label>
            <textarea
              value={formData.detailAddress}
              onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.detailAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường...)"
            />
            {errors.detailAddress && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.detailAddress}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Star size={16} className="text-yellow-500" />
              Đặt làm địa chỉ mặc định
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {isEditing ? 'Cập nhật' : 'Thêm địa chỉ'}
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;