import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CategoryItem from './CategoryItem';
import AddCategoryForm from './AddCategoryForm';
import EditCategoryForm from './EditCategoryForm';
import { itemTypeApi } from '@/services/itemTypeApi';
import { uploadImage } from '@/services/uploadService';
import type { ItemType, CreateItemTypePayload } from '@/types/itemType';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ItemType[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState<{ category: ItemType; depth: number } | null>(null);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  // Load danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await itemTypeApi.getAllWithHierarchy();
        console.log('Loaded categories:', JSON.stringify(data, null, 2)); // Debug
        setCategories(data);
      } catch (err: any) {
        setError('Không thể tải danh mục');
        console.error('Error fetching categories:', err);
        toast.error(err.response?.data?.message || 'Không thể tải danh mục', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev =>
        prev.includes(categoryId)
            ? prev.filter(id => id !== categoryId)
            : [...prev, categoryId]
    );
  };

  // Tìm kiếm danh mục đệ quy
  const findCategoryById = (cats: ItemType[], id: number): ItemType | undefined => {
    for (const cat of cats) {
      if (cat.id === id) {
        return cat;
      }
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  const handleAddCategory = async (name: string, imageFile: File | null, parentId: number | null) => {
    if (!name.trim()) {
      setError('Tên danh mục là bắt buộc');
      toast.error('Tên danh mục là bắt buộc', { position: 'top-right' });
      return;
    }
    if (!parentId && !imageFile) {
      setError('Ảnh là bắt buộc cho danh mục cấp cao nhất');
      toast.error('Ảnh là bắt buộc cho danh mục cấp cao nhất', { position: 'top-right' });
      return;
    }

    try {
      setUpdating(true);
      const toastId: string | number = toast.loading('Đang thêm danh mục...', { position: 'top-right' });

      let iconUrl: string | undefined;
      if (!parentId && imageFile) {
        iconUrl = await uploadImage(imageFile);
      }

      const newCategory: CreateItemTypePayload = {
        name: name.trim(),
        isActive: true,
        parent: parentId ? { id: parentId } : undefined,
        iconUrl,
      };

      console.log('Add category payload:', newCategory); // Debug
      const createdCategory = await itemTypeApi.createItemType(newCategory);
      console.log('Created category:', createdCategory); // Debug
      setCategories(prev => {
        if (!parentId) {
          return [...prev, createdCategory];
        }
        const updateChildren = (cats: ItemType[]): ItemType[] =>
            cats.map(cat => ({
              ...cat,
              children: cat.id === parentId
                  ? [...(cat.children || []), createdCategory]
                  : updateChildren(cat.children || []),
            }));
        return updateChildren(prev);
      });
      setIsAddingCategory(false);
      setSelectedParent(null);
      toast.update(toastId, {
        render: 'Thêm danh mục thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        position: 'top-right',
      });
    } catch (err: any) {
      setError('Không thể thêm danh mục');
      console.error('Error creating category:', err);
      toast.error(err.response?.data?.message || 'Không thể thêm danh mục', { position: 'top-right' });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddChild = (parentId: number) => {
    setSelectedParent(parentId);
    setIsAddingCategory(true);
  };

  const handleEdit = (category: ItemType, depth: number) => {
    setIsEditingCategory({ category, depth });
  };

  const handleUpdateCategory = async (id: number, name: string, imageFile: File | null) => {
    if (!name.trim()) {
      setError('Tên danh mục là bắt buộc');
      toast.error('Tên danh mục là bắt buộc', { position: 'top-right' });
      return;
    }

    try {
      setUpdating(true);
      const toastId: string | number = toast.loading('Đang cập nhật danh mục...', { position: 'top-right' });

      console.log('Updating category with id:', id); // Debug
      const currentCategory = findCategoryById(categories, id);
      if (!currentCategory) {
        setError('Danh mục không tồn tại');
        toast.error('Danh mục không tồn tại', { position: 'top-right' });
        setUpdating(false);
        toast.update(toastId, {
          render: 'Danh mục không tồn tại',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          position: 'top-right',
        });
        return;
      }

      let iconUrl = currentCategory.iconUrl;
      if (!currentCategory.parent && imageFile) {
        iconUrl = await uploadImage(imageFile);
      }

      const updatedCategory: ItemType = {
        ...currentCategory,
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, '-'), // Backend sẽ xử lý slug
        iconUrl,
        parent: currentCategory.parent, // Giữ parent hiện tại
      };

      console.log('Update category payload:', updatedCategory); // Debug
      const result = await itemTypeApi.updateItemType(id, updatedCategory);
      console.log('Updated category:', result); // Debug
      setCategories(prev => {
        const updateCategory = (cats: ItemType[]): ItemType[] =>
            cats.map(cat => cat.id === id ? result : { ...cat, children: updateCategory(cat.children || []) });
        return updateCategory(prev);
      });
      setIsEditingCategory(null);
      toast.update(toastId, {
        render: 'Cập nhật danh mục thành công!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        position: 'top-right',
      });
    } catch (err: any) {
      setError('Không thể cập nhật danh mục');
      console.error('Error updating category:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật danh mục', { position: 'top-right' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsAddingCategory(false);
    setIsEditingCategory(null);
    setSelectedParent(null);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
      <div className="space-y-6">
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý ngành hàng</h2>
          <button
              onClick={() => {
                setSelectedParent(null);
                setIsAddingCategory(true);
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={16} className="mr-2" />
            Thêm ngành hàng
          </button>
        </div>

        {isAddingCategory && (
            <AddCategoryForm
                selectedParent={selectedParent}
                onAdd={handleAddCategory}
                onCancel={handleCancel}
                updating={updating}
            />
        )}

        {isEditingCategory && (
            <EditCategoryForm
                category={isEditingCategory.category}
                depth={isEditingCategory.depth}
                onEdit={handleUpdateCategory}
                onCancel={handleCancel}
                updating={updating}
            />
        )}

        <div className="space-y-4">
          {categories.map(category => (
              <CategoryItem
                  key={category.id}
                  category={category}
                  depth={0}
                  expandedCategories={expandedCategories}
                  toggleExpand={toggleExpand}
                  onAddChild={handleAddChild}
                  onEdit={handleEdit}
              />
          ))}
        </div>
      </div>
  );
};

export default CategoryManagement;