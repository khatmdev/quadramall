import React, { useState } from 'react';

interface AddCategoryFormProps {
  selectedParent: number | null;
  onAdd: (name: string, imageFile: File | null, parentId: number | null) => void;
  onCancel: () => void;
  updating: boolean;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
                                                           selectedParent,
                                                           onAdd,
                                                           onCancel,
                                                           updating,
                                                         }) => {
  const [categoryName, setCategoryName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      setError('Tên danh mục là bắt buộc');
      return;
    }
    if (!selectedParent && !imageFile) {
      setError('Ảnh là bắt buộc cho danh mục cấp cao nhất');
      return;
    }

    onAdd(categoryName.trim(), imageFile, selectedParent);
    setCategoryName('');
    setImageFile(null);
    setError(null);
  };

  return (
      <div className="bg-white p-4 rounded-lg border-2 border-green-200">
        <h3 className="font-semibold mb-3">
          {selectedParent ? 'Thêm ngành hàng con' : 'Thêm ngành hàng mới'}
        </h3>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <div className="flex flex-col gap-3">
          <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Tên ngành hàng"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && !updating && handleSubmit()}
              disabled={updating}
          />
          {!selectedParent && (
              <div>
                <label className="block text-sm font-medium mb-1">Ảnh danh mục (bắt buộc)</label>
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                disabled={updating}
            >
              {updating ? 'Đang xử lý...' : 'Thêm'}
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

export default AddCategoryForm;