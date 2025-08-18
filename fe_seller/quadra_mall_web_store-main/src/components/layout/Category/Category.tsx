import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiChevronRight, FiChevronDown, FiFolder, FiFile } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategoriesByStoreId, createCategory, fetchCategoryDetail, updateCategory, deleteCategory, addProductToCategory, removeProductFromCategory } from '@/services/categoryService';
import { Category, CategoryDetailData, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/Category';
import { RootState } from '@/store';
import SearchBar from './SearchBar';
import CategoryForm from './CategoryForm';
import CategoryDetail from './CategoryDetail';

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState<{ show: boolean; parentId?: number }>({ show: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetailData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Lấy storeId từ Redux hoặc localStorage
  const storeId = useSelector((state: RootState) => state.auth.storeId) || localStorage.getItem('selectedStoreId');

  // Load danh mục từ API
  const { data: apiCategories = [], isLoading } = useQuery<Category[], Error>({
    queryKey: ['categories', storeId],
    queryFn: () => fetchCategoriesByStoreId(Number(storeId)),
    enabled: !!storeId,
  });

  // Khởi tạo isExpanded khi dữ liệu API thay đổi
  useEffect(() => {
    const initializeExpanded = (cats: Category[]): Category[] => {
      return cats.map(cat => ({
        ...cat,
        isExpanded: cat.isExpanded ?? false,
        children: initializeExpanded(cat.children),
      }));
    };
    setCategories(initializeExpanded(apiCategories));
  }, [apiCategories]);

  // Thêm danh mục mới
  const createMutation = useMutation({
    mutationFn: (request: CreateCategoryRequest) => createCategory(Number(storeId), request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      setShowForm({ show: false });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Danh mục đã được thêm!',
        confirmButtonColor: '#3B82F6',
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể thêm danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
  });

  // Cập nhật danh mục
  const updateMutation = useMutation({
    mutationFn: ({ categoryId, request }: { categoryId: number; request: UpdateCategoryRequest }) =>
        updateCategory(Number(storeId), categoryId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      queryClient.invalidateQueries({ queryKey: ['categoryDetail', Number(storeId), selectedCategory?.id] });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Danh mục đã được cập nhật!',
        confirmButtonColor: '#3B82F6',
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể cập nhật danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
  });

  // Xóa danh mục
  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => deleteCategory(Number(storeId), categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
      setSelectedCategory(null);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Danh mục đã được xóa!',
        confirmButtonColor: '#3B82F6',
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể xóa danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
  });

  // Thêm sản phẩm vào danh mục
  const addProductMutation = useMutation({
    mutationFn: ({ categoryId, productId }: { categoryId: number; productId: number }) =>
        addProductToCategory(Number(storeId), categoryId, productId),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categoryDetail', Number(storeId), categoryId] });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Sản phẩm đã được thêm vào danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể thêm sản phẩm vào danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
  });

  // Xóa sản phẩm khỏi danh mục
  const removeProductMutation = useMutation({
    mutationFn: ({ categoryId, productId }: { categoryId: number; productId: number }) =>
        removeProductFromCategory(Number(storeId), categoryId, productId),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categoryDetail', Number(storeId), categoryId] });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Sản phẩm đã được xóa khỏi danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể xóa sản phẩm khỏi danh mục!',
        confirmButtonColor: '#3B82F6',
      });
    },
  });

  // Tìm kiếm danh mục
  const filteredCategories = useMemo(() => {
    const search = searchQuery.toLowerCase();
    if (!search) return categories;

    const flattenCategories = (cats: Category[]): Category[] => {
      return cats.reduce((acc: Category[], cat) => {
        return [...acc, cat, ...flattenCategories(cat.children)];
      }, []);
    };

    const matchedCategories = flattenCategories(categories).filter(cat =>
        cat.name.toLowerCase().includes(search)
    );

    const expandedCats = categories.map(cat => ({
      ...cat,
      isExpanded: matchedCategories.some(m => m.id === cat.id || m.parentId === cat.id),
      children: cat.children.map(child => ({
        ...child,
        isExpanded: matchedCategories.some(m => m.id === child.id || m.parentId === child.id),
      })),
    }));

    return expandedCats;
  }, [categories, searchQuery]);

  // Toggle expand/collapse danh mục
  const toggleCategory = (categoryId: number) => {
    const updateExpanded = (cats: Category[]): Category[] =>
        cats.map(cat => {
          if (cat.id === categoryId) {
            return { ...cat, isExpanded: !cat.isExpanded };
          }
          return { ...cat, children: updateExpanded(cat.children) };
        });

    setCategories(updateExpanded);
  };

  // Thêm danh mục mới
  const handleAddCategory = (
      newCategory: { name: string; description?: string },
      parentId?: number
  ) => {
    if (!newCategory.name) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng nhập tên danh mục!',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    const request: CreateCategoryRequest = {
      name: newCategory.name,
      description: newCategory.description || undefined,
      parentId: parentId || undefined,
      storeId: Number(storeId),
    };

    createMutation.mutate(request);
  };

  // Sửa danh mục
  const handleEditCategory = (categoryId: number, newName: string) => {
    const request: UpdateCategoryRequest = {
      name: newName,
    };
    updateMutation.mutate({ categoryId, request });
  };

  // Xóa danh mục
  const handleDeleteCategory = (categoryId: number) => {
    Swal.fire({
      title: 'Xác nhận xóa danh mục',
      text: 'Bạn có chắc muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục sẽ trở về trạng thái chưa phân loại.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Xóa danh mục',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(categoryId);
      }
    });
  };

  // Thêm sản phẩm vào danh mục
  const handleAddProduct = (categoryId: number, productId: number) => {
    addProductMutation.mutate({ categoryId, productId });
  };

  // Xóa sản phẩm khỏi danh mục
  const handleRemoveProduct = (categoryId: number, productId: number) => {
    removeProductMutation.mutate({ categoryId, productId });
  };

  // Thống kê
  const totalCategories = categories.length > 0 ? categories[0].totalCategories : 0;
  const totalProducts = categories.length > 0 ? categories[0].totalProducts : 0;
  const categorizedProducts = categories.length > 0 ? categories[0].totalProductsWithCategory : 0;

  if (!storeId) {
    return <div className="p-6">Không tìm thấy ID cửa hàng. Vui lòng chọn cửa hàng!</div>;
  }

  if (isLoading) {
    return <div className="p-6">Đang tải danh mục...</div>;
  }

  if (selectedCategory) {
    return (
        <CategoryDetail
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
        />
    );
  }

  return (
      <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h2>
          <div className="flex items-center gap-4">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <button
                onClick={() => setShowForm({ show: true })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus />
              Thêm danh mục gốc
            </button>
          </div>
        </div>

        {/* Thống kê */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCategories}</div>
              <div className="text-sm text-gray-600">Tổng danh mục</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{totalProducts}</div>
              <div className="text-sm text-gray-600">Tổng sản phẩm</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{categorizedProducts}</div>
              <div className="text-sm text-gray-600">Sản phẩm đã phân loại</div>
            </div>
          </div>
        </div>

        {/* Form thêm danh mục */}
        {showForm.show && (
            <CategoryForm
                onSubmit={(data) => handleAddCategory(data, showForm.parentId)}
                onCancel={() => setShowForm({ show: false })}
            />
        )}

        {/* Danh sách danh mục dạng cây */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cây danh mục</h3>
          {filteredCategories.length > 0 ? (
              renderCategoryTree(filteredCategories)
          ) : (
              <p className="text-gray-500">Không tìm thấy danh mục nào</p>
          )}
        </div>
      </div>
  );

  function renderCategoryTree(cats: Category[], level: number = 0) {
    return cats.map(cat => (
        <div key={cat.id} className={`ml-${level * 4}`}>
          <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <button
                onClick={() => toggleCategory(cat.id)}
                className="text-gray-500"
            >
              {cat.children.length > 0 ? (
                  cat.isExpanded ? <FiChevronDown /> : <FiChevronRight />
              ) : (
                  <FiFile className="text-gray-400" />
              )}
            </button>
            <div
                className="flex-1 flex items-center gap-2 cursor-pointer"
                onClick={async () => {
                  try {
                    const categoryDetail = await fetchCategoryDetail(Number(storeId), cat.id);
                    setSelectedCategory(categoryDetail);
                  } catch (error) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Lỗi',
                      text: 'Không thể tải chi tiết danh mục!',
                      confirmButtonColor: '#3B82F6',
                    });
                  }
                }}
            >
              <FiFolder className="text-blue-500" />
              <span className="text-gray-900 font-medium">{cat.name}</span>
            </div>
            <button
                onClick={() => setShowForm({ show: true, parentId: cat.id })}
                className="p-1 text-blue-500 hover:bg-blue-100 rounded"
            >
              <FiPlus />
            </button>
          </div>
          {cat.isExpanded && cat.children.length > 0 && (
              <div className="ml-4">{renderCategoryTree(cat.children, level + 1)}</div>
          )}
        </div>
    ));
  }
};

export default Categories;