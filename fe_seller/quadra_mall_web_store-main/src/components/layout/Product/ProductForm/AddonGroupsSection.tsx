import React from 'react';
import { Plus, X } from 'lucide-react';

interface Addon {
    id: number;
    name: string;
    priceAdjust: number;
    active: boolean;
}

interface AddonGroup {
    id: number;
    name: string;
    maxChoice: number;
    addons: Addon[];
}

interface AddonGroupsSectionProps {
    addonGroups: AddonGroup[];
    setAddonGroups: React.Dispatch<React.SetStateAction<AddonGroup[]>>;
}

const AddonGroupsSection: React.FC<AddonGroupsSectionProps> = ({
                                                                   addonGroups,
                                                                   setAddonGroups,
                                                               }) => {
    // Addons handling
    const addAddonGroup = () =>
        setAddonGroups((prev) => [...prev, { id: Date.now(), name: '', maxChoice: 1, addons: [] }]);
    const updateAddonGroup = (groupId: number, field: 'name' | 'maxChoice', value: string | number) =>
        setAddonGroups((prev) =>
            prev.map((group) => (group.id === groupId ? { ...group, [field]: value } : group))
        );
    const removeAddonGroup = (groupId: number) => setAddonGroups((prev) => prev.filter((group) => group.id !== groupId));
    const addAddon = (groupId: number) =>
        setAddonGroups((prev) =>
            prev.map((group) =>
                group.id === groupId
                    ? { ...group, addons: [...group.addons, { id: Date.now(), name: '', priceAdjust: 0, active: true }] }
                    : group
            )
        );
    const updateAddon = (
        groupId: number,
        addonId: number,
        field: 'name' | 'priceAdjust' | 'active',
        value: string | number | boolean
    ) =>
        setAddonGroups((prev) =>
            prev.map((group) =>
                group.id === groupId
                    ? {
                        ...group,
                        addons: group.addons.map((addon) => (addon.id === addonId ? { ...addon, [field]: value } : addon)),
                    }
                    : group
            )
        );
    const removeAddon = (groupId: number, addonId: number) =>
        setAddonGroups((prev) =>
            prev.map((group) =>
                group.id === groupId ? { ...group, addons: group.addons.filter((addon) => addon.id !== addonId) } : group
            )
        );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Tùy chọn bổ sung (Addons)</h2>
                        <p className="text-sm text-gray-500">Thêm các tùy chọn mà khách hàng có thể lựa chọn kèm theo sản phẩm chính</p>
                    </div>
                </div>
                <button
                    onClick={addAddonGroup}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <Plus size={16} />
                    Thêm nhóm tùy chọn
                </button>
            </div>
            {addonGroups.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                            <Plus size={24} className="text-gray-400" />
                        </div>
                    </div>
                    <p className="text-lg mb-2 font-medium">Chưa có nhóm tùy chọn nào</p>
                    <p className="text-sm">Nhấn "Thêm nhóm tùy chọn" để bắt đầu thêm các tùy chọn bổ sung cho sản phẩm</p>
                    <p className="text-xs text-gray-400 mt-2">Ví dụ: Topping (cho đồ ăn), Bảo hành mở rộng (cho điện tử), Phụ kiện (cho thời trang)</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {addonGroups.map((group, groupIndex) => (
                        <div key={group.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">{groupIndex + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên nhóm tùy chọn <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={group.name}
                                            onChange={(e) => updateAddonGroup(group.id, 'name', e.target.value)}
                                            placeholder="VD: Topping, Bảo hành, Phụ kiện..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            maxLength={100}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeAddonGroup(group.id)}
                                    className="w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all duration-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng tối đa có thể chọn</label>
                                <select
                                    value={group.maxChoice}
                                    onChange={(e) => updateAddonGroup(group.id, 'maxChoice', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value={1}>Chỉ chọn 1 (Radio)</option>
                                    <option value={2}>Tối đa 2 tùy chọn</option>
                                    <option value={3}>Tối đa 3 tùy chọn</option>
                                    <option value={5}>Tối đa 5 tùy chọn</option>
                                    <option value={-1}>Không giới hạn (Checkbox)</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Danh sách tùy chọn</label>
                                    <button
                                        onClick={() => addAddon(group.id)}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <Plus size={16} />
                                        Thêm tùy chọn
                                    </button>
                                </div>
                                {group.addons.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                                        <div className="mb-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                                                <Plus size={20} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium">Chưa có tùy chọn nào</p>
                                        <p className="text-xs">Nhấn "Thêm tùy chọn" để bắt đầu</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {group.addons.map((addon, addonIndex) => (
                                            <div key={addon.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-sm font-medium">{addonIndex + 1}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={addon.name}
                                                    onChange={(e) => updateAddon(group.id, addon.id, 'name', e.target.value)}
                                                    placeholder="Tên tùy chọn (VD: Phô mai thêm, Bảo hành 2 năm...)"
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    maxLength={100}
                                                />
                                                <div className="w-32 flex items-center">
                                                    <input
                                                        type="number"
                                                        value={addon.priceAdjust}
                                                        onChange={(e) => updateAddon(group.id, addon.id, 'priceAdjust', parseFloat(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-right"
                                                        step="0.01"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-500">₫</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={addon.active}
                                                            onChange={(e) => updateAddon(group.id, addon.id, 'active', e.target.checked)}
                                                            className="sr-only"
                                                        />
                                                        <div
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                                addon.active ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                                            }`}
                                                        >
                                                            {addon.active && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-600">Hiện</span>
                                                    </label>
                                                    <button
                                                        onClick={() => removeAddon(group.id, addon.id)}
                                                        className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {group.addons.length > 0 && (
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-medium text-blue-800">Xem trước:</h4>
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        <div className="font-medium mb-2">{group.name || 'Tên nhóm tùy chọn'}</div>
                                        <div className="space-y-2">
                                            {group.addons
                                                .filter((addon) => addon.active)
                                                .map((addon, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type={group.maxChoice === 1 ? 'radio' : 'checkbox'}
                                                                name={`preview-${group.id}`}
                                                                className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                                disabled
                                                            />
                                                            <span>{addon.name || `Tùy chọn ${index + 1}`}</span>
                                                        </label>
                                                        <span className="text-blue-600 font-medium">
                                                            {addon.priceAdjust > 0
                                                                ? `+${addon.priceAdjust.toLocaleString()}₫`
                                                                : addon.priceAdjust < 0
                                                                    ? `${addon.priceAdjust.toLocaleString()}₫`
                                                                    : 'Miễn phí'}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-2">
                                            {group.maxChoice === 1
                                                ? 'Khách hàng chỉ có thể chọn 1 tùy chọn'
                                                : group.maxChoice === -1
                                                    ? 'Khách hàng có thể chọn nhiều tùy chọn'
                                                    : `Khách hàng có thể chọn tối đa ${group.maxChoice} tùy chọn`}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddonGroupsSection;