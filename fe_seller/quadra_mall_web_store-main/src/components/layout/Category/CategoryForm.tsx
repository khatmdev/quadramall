import React, { useState } from 'react';

interface CategoryFormProps {
    onSubmit: (category: { name: string; description?: string }) => void;
    onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const handleSubmit = () => {
        if (!formData.name) {
            return;
        }
        onSubmit(formData);
        setFormData({ name: '', description: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900">Thêm danh mục mới</h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Tên danh mục (*)</label>
                    <input
                        type="text"
                        placeholder="Nhập tên danh mục"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 rounded-md text-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Mô tả</label>
                    <textarea
                        placeholder="Nhập mô tả danh mục"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 rounded-md text-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    onClick={onCancel}
                >
                    Hủy
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleSubmit}
                >
                    Lưu danh mục
                </button>
            </div>
        </div>
    );
};

export default CategoryForm;