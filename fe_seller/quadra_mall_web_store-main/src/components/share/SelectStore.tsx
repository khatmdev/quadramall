import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const SelectStore: React.FC = () => {
    const { storeIds, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(localStorage.getItem('selectedStoreId') || null);

    useEffect(() => {
        if (isAuthenticated && storeIds.length > 0 && !selectedStoreId) {
            setSelectedStoreId(storeIds[0].toString()); // Chọn mặc định cửa hàng đầu tiên
        }
    }, [isAuthenticated, storeIds, selectedStoreId]);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStoreId(e.target.value);
    };

    const handleSubmit = () => {
        if (selectedStoreId) {
            localStorage.setItem('selectedStoreId', selectedStoreId);
            navigate('/', { replace: true });
        }
    };

    if (!isAuthenticated) {
        return <div>Please log in</div>;
    }

    if (storeIds.length === 0) {
        return <div>No stores available. Please contact support.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Your Store</h2>
                <select
                    onChange={handleSelect}
                    value={selectedStoreId || ''}
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                >
                    <option value="" disabled>Select a store</option>
                    {storeIds.map((id: number) => (
                        <option key={id} value={id.toString()}>
                            Store {id}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedStoreId}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Go to Store
                </button>
            </div>
        </div>
    );
};

export default SelectStore;