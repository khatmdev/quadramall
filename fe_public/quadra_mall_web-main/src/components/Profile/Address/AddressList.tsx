import React, { useEffect, useState } from "react";
import { getAllAddresses, AddressDTO, deleteAddress, setDefaultAddress } from '@/api/addressApi';
import Swal from 'sweetalert2';



interface AddressListProps {
  onEditAddress?: (address: AddressDTO) => void;
}

const AddressList: React.FC<AddressListProps> = ({ onEditAddress }) => {
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchAddresses = async () => {
    try {
      const data = await getAllAddresses();
      // Sắp xếp địa chỉ mặc định lên đầu
      const sorted = [...data].sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
      setAddresses(sorted);
    } catch (err) {
      setError('Không thể tải danh sách địa chỉ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: number) => {
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
      setDeletingId(id);
      try {
        await deleteAddress(id);
        // Reload danh sách địa chỉ
        await fetchAddresses();
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Địa chỉ đã được xóa thành công',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
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

  const handleToggleDefault = async (address: AddressDTO) => {
    // Nếu đã là mặc định thì không cho tắt
    if (address.isDefault) {
      Swal.fire({
        icon: 'info',
        title: 'Thông báo',
        text: 'Không thể tắt địa chỉ mặc định. Hãy đặt địa chỉ khác làm mặc định trước.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setTogglingId(address.id);
    try {
      await setDefaultAddress(address.id);
      await fetchAddresses(); // Reload để cập nhật trạng thái
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
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <div>Đang tải địa chỉ...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (!addresses || addresses.length === 0) return <div>Không có địa chỉ nào.</div>;

  return (
    <div className="mb-4">
      {addresses.map(address => (
        <div
          key={address.id}
          className={`flex justify-between items-start bg-white p-6 rounded-lg mb-4 shadow transition-all ${address.isDefault ? 'border-l-4 border-green-500 bg-green-50' : 'border-l-4 border-gray-200'}`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-gray-800">{address.receiverName}</span>
              <span className="text-gray-500">({address.receiverPhone})</span>
              {address.isDefault && (
                <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  Mặc định
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              {address.detailAddress}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              {address.ward}, {address.district}, {address.city}
            </div>
            {!address.isDefault && (
              <span className="inline-block px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded w-fit">
                Không mặc định
              </span>
            )}
            
            {/* Toggle Switch cho trạng thái mặc định */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-medium">Địa chỉ mặc định:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={address.isDefault}
                  onChange={() => handleToggleDefault(address)}
                  disabled={togglingId === address.id}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-200 ease-in-out ${
                  address.isDefault ? 'bg-green-400' : 'bg-gray-300'
                } ${togglingId === address.id ? 'opacity-50' : ''}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                    address.isDefault ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}></div>
                </div>
                <span className={`ml-2 text-sm font-medium ${address.isDefault ? 'text-green-600' : 'text-gray-500'}`}>
                  {togglingId === address.id ? 'Đang cập nhật...' : (address.isDefault ? 'Bật' : 'Tắt')}
                </span>
              </label>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded hover:bg-green-400 text-sm bg-gray-100" onClick={() => onEditAddress && onEditAddress(address)}>
                Cập nhật
              </button>
              <button 
                className="px-3 py-1 rounded hover:bg-red-400 text-sm bg-red-100 text-red-600 disabled:opacity-50"
                onClick={() => handleDelete(address.id)}
                disabled={deletingId === address.id}
              >
                {deletingId === address.id ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
