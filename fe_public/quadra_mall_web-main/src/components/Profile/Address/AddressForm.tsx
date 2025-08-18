import React, { useState } from "react";
import AddressList from "./AddressList";
import AddressCreate from "./AddressCreate";


const AddressForm: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [addressEdit, setAddressEdit] = useState<any | null>(null);

  const handleEditAddress = (address: any) => {
    setAddressEdit(address);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setAddressEdit(null);
  };

  return (
    <div className="relative bg-white p-6 shadow rounded-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Địa chỉ của tôi</h1>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => { setShowForm(true); setAddressEdit(null); }}
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      <AddressList key={showForm ? 'reload' : 'normal'} onEditAddress={handleEditAddress} />

      {showForm && (
        <>
          {/* Overlay nền mờ */}
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.05)] " />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">
              <AddressCreate address={addressEdit} onClose={handleCloseForm} onCreated={handleCloseForm} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddressForm;
