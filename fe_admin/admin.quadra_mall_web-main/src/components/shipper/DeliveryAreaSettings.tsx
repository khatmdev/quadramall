import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const DeliveryAreaSettings: React.FC = () => {
    const [areas, setAreas] = useState<string[]>(['Hà Nội', 'TP.HCM', 'Đà Nẵng']);
    const [newArea, setNewArea] = useState('');

    const handleAddArea = () => {
        if (newArea.trim()) {
            setAreas([...areas, newArea.trim()]);
            setNewArea('');
        }
    };

    const handleRemoveArea = (area: string) => {
        setAreas(areas.filter(a => a !== area));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Khu vực giao hàng</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Thêm khu vực mới..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAddArea}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Thêm
                </button>
            </div>
            <div className="space-y-2">
                {areas.map(area => (
                    <div key={area} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        <span>{area}</span>
                        <button
                            onClick={() => handleRemoveArea(area)}
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

export default DeliveryAreaSettings;