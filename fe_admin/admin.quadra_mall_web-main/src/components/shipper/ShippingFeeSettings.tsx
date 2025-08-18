import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface FeeSetting {
    area: string;
    fee: number;
}

const ShippingFeeSettings: React.FC = () => {
    const [fees, setFees] = useState<FeeSetting[]>([
        { area: 'Hà Nội', fee: 20000 },
        { area: 'TP.HCM', fee: 25000 },
        { area: 'Đà Nẵng', fee: 18000 },
    ]);
    const [newArea, setNewArea] = useState('');
    const [newFee, setNewFee] = useState('');

    const handleAddFee = () => {
        if (newArea.trim() && newFee.trim()) {
            setFees([...fees, { area: newArea.trim(), fee: parseInt(newFee) }]);
            setNewArea('');
            setNewFee('');
        }
    };

    const handleRemoveFee = (area: string) => {
        setFees(fees.filter(f => f.area !== area));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cài đặt phí ship</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Khu vực..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder="Phí (VNĐ)..."
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAddFee}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Thêm
                </button>
            </div>
            <div className="space-y-2">
                {fees.map(fee => (
                    <div key={fee.area} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <span>{fee.area}: {fee.fee.toLocaleString()} VNĐ</span>
                        <button
                            onClick={() => handleRemoveFee(fee.area)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShippingFeeSettings;