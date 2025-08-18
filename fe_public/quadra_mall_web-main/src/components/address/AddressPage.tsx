// AddressPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import { AppDispatch } from '@/store';
import { fetchAddresses } from '@/store/Address/AddressSile';
import AddressList from './AddressList';
import AddressModal from './AddAddress';

const AddressPage: React.FC = () => {
  console.log('AddressPage component rendered');
  const dispatch = useDispatch<AppDispatch>();
  const [editingAddress, setEditingAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log('AddressPage useEffect - fetching addresses');
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    dispatch(fetchAddresses());
  };

  const handleCloseModal = () => {
    setEditingAddress(null);
    setShowModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className='bg-white shadow-md rounded-lg p-6 mb-8'>
          <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý địa chỉ</h1>
        <p className="text-gray-600">Quản lý các địa chỉ giao hàng của bạn</p>
      </div>
      <div className="mt-8 text-center">
        <button 
          onClick={handleAddAddress} 
          className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          Thêm địa chỉ mới
        </button>
      </div>
      </div>
      
      <AddressModal
        isOpen={showModal}
        editingAddress={editingAddress}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      <AddressList onEditAddress={handleEditAddress} />

      
    </div>
  );
};

export default AddressPage;