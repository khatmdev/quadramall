import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Specification } from '@/types/ProductEdit';

interface SpecificationsSectionProps {
    specifications: Specification[];
    setSpecifications: React.Dispatch<React.SetStateAction<Specification[]>>;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({
                                                                         specifications,
                                                                         setSpecifications,
                                                                     }) => {
    const [error, setError] = useState<string>('');

    // Hàm riêng: Thêm thông số mới với id null
    const addSpecification = () => {
        const newSpec: Specification = {
            id: null,
            specificationId: 0,
            specificationName: '',
            value: '',
        };
        setSpecifications((prev) => [...prev, newSpec]);
    };

    // Hàm riêng: Update spec dựa trên index (giữ cách cũ)
    const updateSpecification = (index: number, field: 'specificationName' | 'value', value: string) => {
        setError('');
        setSpecifications((prev) =>
            prev.map((spec, i) =>
                i === index ? { ...spec, [field]: value } : spec
            )
        );
    };

    // Hàm riêng: Remove spec dựa trên index (giữ cách cũ)
    const removeSpecification = (index: number) => {
        setSpecifications((prev) => prev.filter((_, i) => i !== index));
        setError('');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Thông tin chi tiết</h2>
                        <p className="text-sm text-gray-500">Thêm các thông số kỹ thuật</p>
                    </div>
                </div>
                <button
                    onClick={addSpecification}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <Plus size={16} />
                    Thêm thông số
                </button>
            </div>
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                    {error}
                </div>
            )}
            {specifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                            <Plus size={24} className="text-gray-400" />
                        </div>
                    </div>
                    <p className="text-lg mb-2 font-medium">Chưa có thông số nào</p>
                    <p className="text-sm">Nhấn "Thêm thông số" để bắt đầu thêm thông tin chi tiết</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {specifications.map((spec, index) => (
                        <div key={index} className="flex gap-4 items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-medium">{index + 1}</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Tên thông số (VD: Thương hiệu)"
                                value={spec.specificationName}
                                onChange={(e) => updateSpecification(index, 'specificationName', e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                maxLength={100}
                            />
                            <input
                                type="text"
                                placeholder="Giá trị (VD: Nike)"
                                value={spec.value}
                                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                maxLength={200}
                            />
                            <button
                                onClick={() => removeSpecification(index)}
                                className="w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpecificationsSection;