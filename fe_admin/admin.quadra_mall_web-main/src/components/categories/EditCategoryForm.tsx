import React, { useState } from 'react';
import type { ItemType } from '@/types/itemType';

interface EditCategoryFormProps {
    category: ItemType;
    depth: number;
    onEdit: (id: number, name: string, imageFile: File | null) => void;
    onCancel: () => void;
    updating: boolean;
}

const EditCategoryForm: React.FC<EditCategoryFormProps> = ({
                                                               category,
                                                               depth,
                                                               onEdit,
                                                               onCancel,
                                                               updating,
                                                           }) => {
    const [name, setName] = useState(category.name);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('Tên danh mục là bắt buộc');
            return;
        }
        if (depth === 0 && !category.iconUrl && !imageFile) {
            setError('Ảnh là bắt buộc cho danh mục cấp cao nhất');
            return;
        }

        onEdit(category.id, name.trim(), depth === 0 ? imageFile : null);
        setName('');
        setImageFile(null);
        setError(null);
    };

    return (
        <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold mb-3">
                {depth === 0 ? 'Sửa ngành hàng' : 'Sửa ngành hàng con'}
            </h3>
            {error && <div className="text-red-600 mb-3">{error}</div>}
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên danh mục"
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && !updating && handleSubmit()}
                    disabled={updating}
                />
                {depth === 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ảnh danh mục {category.iconUrl ? '(tùy chọn)' : '(bắt buộc)'}
                        </label>
                        {category.iconUrl && (
                            <div className="mb-2">
                                <img src={category.iconUrl} alt={category.name} className="w-16 h-16 object-cover rounded" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageChange}
                            className="px-3 py-2 border rounded-lg w-full"
                            disabled={updating}
                        />
                        {imageFile && (
                            <div className="mt-2">
                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-16 h-16 object-cover rounded" />
                            </div>
                        )}
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        disabled={updating}
                    >
                        {updating ? 'Đang xử lý...' : 'Lưu'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
                        disabled={updating}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCategoryForm;