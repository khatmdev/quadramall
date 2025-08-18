// AddressList.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, setDefaultAddress, fetchAddressesDefault, deleteAddress } from '@/store/Address/AddressSile';
import { AppDispatch, RootState } from '@/store';
import { MapPin, User, Phone, Home, Edit, Trash2, Star } from 'lucide-react';

import Swal from 'sweetalert2';
import { Address } from '@/types/Order/interface';

interface AddressListProps {
  onEditAddress: (address: Address) => void;
}

const AddressList: React.FC<AddressListProps> = ({ onEditAddress }) => {
  console.log('AddressList component rendered');
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, loading } = useSelector((state: RootState) => state.address);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  console.log('AddressList addresses:', addresses);  

  // Sắp xếp addresses - mặc định lên đầu
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const handleSetDefault = async (id: number) => {
    const result = await Swal.fire({
      title: 'Đặt làm địa chỉ mặc định?',
      text: 'Địa chỉ này sẽ được sử dụng làm địa chỉ mặc định cho các đơn hàng',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(setDefaultAddress(id)).unwrap();
        dispatch(fetchAddressesDefault());
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã đặt làm địa chỉ mặc định',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể đặt làm địa chỉ mặc định',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    console.log('handleDelete called with id:', id);
    const result = await Swal.fire({
      title: 'Xóa địa chỉ?',
      text: 'Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      console.log('User confirmed deletion');
      setDeletingId(id);
      try {
        console.log('Calling deleteAddress with id:', id);
        await dispatch(deleteAddress(id)).unwrap();
        console.log('Delete successful, reloading addresses');
        // Reload danh sách địa chỉ
        dispatch(fetchAddresses());
        dispatch(fetchAddressesDefault());
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Địa chỉ đã được xóa thành công',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể xóa địa chỉ',
          confirmButtonColor: '#3b82f6'
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <MapPin className="text-blue-500" size={24} />
        Danh sách địa chỉ
      </h2>
      
      {sortedAddresses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Chưa có địa chỉ nào</p>
          <p className="text-sm mt-2">Hãy thêm địa chỉ đầu tiên của bạn</p>
        </div>
      ) : (
        sortedAddresses.map((address: Address) => {
          console.log('Rendering address:', address);
          return (
          <div 
            key={address.id} 
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${
              address.isDefault ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-600" />
                <span className="font-semibold text-gray-800 text-lg">{address.receiverName}</span>
                {address.isDefault && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                    <Star size={12} className="text-yellow-500" />
                    Mặc định
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    console.log('Edit button clicked');
                    onEditAddress(address);
                  }} 
                  className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors" 
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    console.log('Delete button clicked, event:', e);
                    console.log('Delete button clicked, address.id:', address.id, 'type:', typeof address.id);
                    handleDelete(Number(address.id));
                  }}
                  disabled={deletingId === address.id}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                  title="Xóa"
                >
                  {deletingId === address.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>{address.receiverPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home size={14} />
                <span>{address.detailAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{address.ward}, {address.district}, {address.city}</span>
              </div>
            </div>
            
            {!address.isDefault && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log('Set default button clicked, address.id:', address.id, 'type:', typeof address.id);
                    handleSetDefault(Number(address.id));
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                >
                  <Star size={14} />
                  Đặt làm mặc định
                </button>
              </div>
            )}
          </div>
          );
        })
      )}
    </div>
  );
};

export default AddressList;
