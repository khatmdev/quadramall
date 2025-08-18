import { useState, useEffect } from 'react';
import { MapPin, Edit, Plus, Trash2, Star, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchAddresses, setDefaultAddress, fetchAddressesDefault } from '@/store/Address/AddressSile';
import Swal from 'sweetalert2';
import { Address } from '@/types/Order/interface';
import AddressModal from '../address/AddAddress';

interface AddressSectionProps {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({ selectedAddress, setSelectedAddress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, loading, error } = useSelector((state: RootState) => state.address);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      console.log('Setting default address from addresses', addresses);
      const defaultAddr: Address = addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    }
  }, [addresses, selectedAddress, setSelectedAddress]);

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const newDefault = await dispatch(setDefaultAddress(id)).unwrap();
      setSelectedAddress(newDefault);
      await dispatch(fetchAddressesDefault()); // Cập nhật defaultAddress trong Redux store
      setShowSelectModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã đặt làm địa chỉ mặc định',
        confirmButtonColor: '#3b82f6'
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể đặt địa chỉ mặc định. Vui lòng thử lại.',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleSuccess = () => {
    dispatch(fetchAddresses());
    dispatch(fetchAddressesDefault()); // Cập nhật defaultAddress sau khi thêm/sửa
    setShowAddressModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Địa chỉ giao hàng</h2>
      </div>
      {addresses.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <MapPin size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Chưa có địa chỉ nào</p>
          <button
            onClick={handleAddAddress}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm địa chỉ mới
          </button>
        </div>
      ) : selectedAddress ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{selectedAddress.receiverName}</p>
              <p className="text-sm text-gray-600 truncate">{selectedAddress.receiverPhone}</p>
              <p className="text-sm text-gray-600 truncate">{selectedAddress.detailAddress}</p>
              <p className="text-sm text-gray-600 truncate">{selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}</p>
            </div>
            <button
              onClick={() => setShowSelectModal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-2"
            >
              <Edit className="h-4 w-4" />
              Thay đổi
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Chưa có địa chỉ mặc định</p>
          <button
            onClick={() => setShowSelectModal(true)}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chọn địa chỉ
          </button>
        </div>
      )}

      {showSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="text-blue-500" size={24} />
                  Chọn địa chỉ
                </h2>
                <button
                  onClick={() => setShowSelectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              )}
              {error && <p className="text-red-600">{error}</p>}
              {addresses.map((address: Address) => (
                <div
                  key={address.id}
                  className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSetDefaultAddress(address.id!)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{address.receiverName}</p>
                      <p className="text-sm text-gray-600 truncate">{address.receiverPhone}</p>
                      <p className="text-sm text-gray-600 truncate">{address.detailAddress}</p>
                      <p className="text-sm text-gray-600 truncate">{address.ward}, {address.district}, {address.city}</p>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          <Star size={12} className="mr-1" /> Mặc định
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(address);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-2"
                    >
                      <Edit className="h-4 w-4" />
                      Sửa
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddAddress}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <AddressModal
          isOpen={showAddressModal}
          editingAddress={editingAddress}
          onClose={() => setShowAddressModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AddressSection;