import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { getItemTypes } from '@/services/productService';

interface ItemTypeDTO {
    id: number;
    parent: ItemTypeDTO | null;
    children: ItemTypeDTO[];
    name: string;
    slug: string;
    description: string | null;
    iconUrl: string | null;
    isActive: boolean | null;
}

interface ItemType {
    id: number;
    name: string;
    parent_id: number | null;
    children?: ItemType[];
}

interface BasicInfoProps {
    productName: string;
    setProductName: React.Dispatch<React.SetStateAction<string>>;
    selectedItemType: ItemType | null;
    setSelectedItemType: React.Dispatch<React.SetStateAction<ItemType | null>>;
}

const BasicInfo: React.FC<BasicInfoProps> = ({
                                                 productName,
                                                 setProductName,
                                                 selectedItemType,
                                                 setSelectedItemType,
                                             }) => {
    const [showItemTypeModal, setShowItemTypeModal] = useState(false);
    const [expandedItemTypes, setExpandedItemTypes] = useState<Record<number, boolean>>({});
    const [selectedPath, setSelectedPath] = useState<ItemType[]>([]);
    const [itemTypes, setItemTypes] = useState<ItemType[]>([]);

    useEffect(() => {
        const loadItemTypes = async () => {
            try {
                const data: ItemTypeDTO[] = await getItemTypes();
                const convertToItemType = (item: ItemTypeDTO): ItemType => ({
                    id: item.id,
                    name: item.name,
                    parent_id: item.parent ? item.parent.id : null,
                    children: item.children.length > 0 ? item.children.map(convertToItemType) : undefined,
                });
                const convertedData = data.map(convertToItemType);
                setItemTypes(convertedData);
            } catch (error) {
                console.error('Failed to load item types:', error);
                alert('Không thể tải danh mục ngành hàng. Vui lòng thử lại sau.');
            }
        };
        loadItemTypes();
    }, []);

    const toggleItemType = (id: number) => setExpandedItemTypes((prev) => ({ ...prev, [id]: !prev[id] }));

    const selectItemType = (itemType: ItemType) => {
        const buildPath = (item: ItemType, allItems: ItemType[], path: ItemType[] = []): ItemType[] => {
            if (item.parent_id) {
                const parent = allItems.find((i) => i.id === item.parent_id);
                if (parent) return buildPath(parent, allItems, [parent, ...path]);
            }
            return path;
        };

        const path = [...buildPath(itemType, itemTypes), itemType];
        setSelectedPath(path);
        setSelectedItemType(itemType);
    };

    const confirmItemTypeSelection = () => setShowItemTypeModal(false);
    const cancelItemTypeSelection = () => {
        setShowItemTypeModal(false);
        setSelectedPath([]);
        setSelectedItemType(null);
    };

    const renderItemTypeTree = (items: ItemType[], level = 0) =>
        items.map((item) => (
            <div key={item.id} className={`${level > 0 ? 'ml-6' : ''}`}>
                <div
                    className={`flex items-center py-2 px-3 rounded-lg hover:bg-white transition-colors ${
                        selectedItemType?.id === item.id ? 'bg-blue-100 border border-blue-300' : 'hover:shadow-sm'
                    }`}
                >
                    {item.children && item.children.length > 0 ? (
                        <button
                            onClick={() => toggleItemType(item.id)}
                            className="mr-3 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        >
                            {expandedItemTypes[item.id] ? (
                                <ChevronDown size={16} className="text-blue-600" />
                            ) : (
                                <ChevronRight size={16} />
                            )}
                        </button>
                    ) : (
                        <div className="w-8 mr-3 flex justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                    )}
                    <button
                        onClick={() => selectItemType(item)}
                        className={`flex-1 text-left py-2 px-3 rounded-md cursor-pointer transition-colors ${
                            selectedItemType?.id === item.id
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'hover:bg-blue-50 hover:text-blue-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className={`font-medium ${
                                    level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'
                                }`}
                            >
                                {item.name}
                            </span>
                            {item.children && item.children.length > 0 && (
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                        selectedItemType?.id === item.id
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {item.children.length}
                                </span>
                            )}
                        </div>
                    </button>
                </div>
                {item.children && expandedItemTypes[item.id] && (
                    <div className="mt-1 mb-2 border-l-2 border-gray-200 ml-4">
                        {renderItemTypeTree(item.children, level + 1)}
                    </div>
                )}
            </div>
        ));

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Tên sản phẩm</h2>
                        <p className="text-sm text-gray-500">Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật</p>
                    </div>
                    <span className="ml-auto text-red-500 text-sm font-medium">Bắt buộc</span>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        maxLength={120}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span
                            className={`text-sm px-2 py-1 rounded-full ${
                                productName.length > 100 ? 'bg-red-100 text-red-600' : productName.length > 80 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {productName.length}/120
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Ngành hàng</h2>
                        <p className="text-sm text-gray-500">Chọn ngành hàng phù hợp với sản phẩm</p>
                    </div>
                    <span className="ml-auto text-red-500 text-sm font-medium">Bắt buộc</span>
                </div>
                <div
                    className="relative border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    onClick={() => setShowItemTypeModal(true)}
                >
                    {selectedItemType ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium">{selectedItemType.name}</span>
                                    <span className="text-sm text-gray-500">
                                        {(() => {
                                            const buildPath = (item: ItemType, allItems: ItemType[], path: ItemType[] = []): ItemType[] => {
                                                if (item.parent_id) {
                                                    const parent = allItems.find((i) => i.id === item.parent_id) || itemTypes.find((i) => i.id === item.parent_id);
                                                    if (parent) return buildPath(parent, allItems, [parent, ...path]);
                                                }
                                                return path;
                                            };
                                            const fullPath = [...buildPath(selectedItemType, itemTypes), selectedItemType];
                                            return fullPath.map(item => item.name).join(' > ');
                                        })()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600">
                                <span className="text-sm">Thay đổi</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="text-gray-500 group-hover:text-blue-600">Chọn ngành hàng cho sản phẩm</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600">
                                <span className="text-sm">Chọn ngành hàng</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showItemTypeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-6xl h-5/6 flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Chọn ngành hàng</h2>
                                <p className="text-sm text-gray-600 mt-1">Chọn danh mục phù hợp với sản phẩm của bạn</p>
                            </div>
                            <button
                                onClick={cancelItemTypeSelection}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-2/5 border-r border-gray-200 flex flex-col bg-gray-50">
                                <div className="p-4 border-b border-gray-200 bg-white">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm danh mục..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="space-y-2">{renderItemTypeTree(itemTypes)}</div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Thông tin lựa chọn</h3>
                                    {selectedPath.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Đường dẫn:</span>
                                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                                    {selectedPath.map((item, index) => (
                                                        <span key={item.id} className="flex items-center gap-2">
                                                            <span className={index === selectedPath.length - 1 ? 'text-blue-700 font-medium' : 'text-blue-600'}>
                                                                {item.name}
                                                            </span>
                                                            {index < selectedPath.length - 1 && (
                                                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-green-800">Đã chọn: {selectedItemType?.name}</h4>
                                                        <p className="text-sm text-green-600">Danh mục này phù hợp với sản phẩm của bạn</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-800 mb-2">Chọn một danh mục</h4>
                                            <p className="text-gray-600">Nhấp vào danh mục bên trái để chọn ngành hàng phù hợp</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn chọn danh mục</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Chọn danh mục càng cụ thể càng tốt</li>
                                            <li>• Danh mục phù hợp giúp khách hàng dễ tìm thấy sản phẩm</li>
                                            <li>• Có thể tìm kiếm danh mục bằng ô tìm kiếm ở trên</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                            <div className="text-sm text-gray-600">
                                {selectedItemType ? (
                                    <span className="text-green-600 font-medium">✓ Đã chọn danh mục</span>
                                ) : (
                                    <span>Vui lòng chọn một danh mục</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelItemTypeSelection}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={confirmItemTypeSelection}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    disabled={!selectedItemType}
                                >
                                    Xác nhận chọn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BasicInfo;