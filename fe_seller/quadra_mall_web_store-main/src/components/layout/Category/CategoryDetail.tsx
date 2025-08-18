import React, {useState, useMemo, useEffect} from 'react';
import { FiArrowLeft, FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCategoryDetail } from '@/services/categoryService';
import { CategoryDetailData } from '@/types/Category';

interface CategoryDetailProps {
    category: CategoryDetailData;
    onBack: () => void;
    onEditCategory: (categoryId: number, newName: string) => void;
    onDeleteCategory: (categoryId: number) => void;
    onAddProduct: (categoryId: number, productId: number) => void;
    onRemoveProduct: (categoryId: number, productId: number) => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({
                                                           category: initialCategory,
                                                           onBack,
                                                           onEditCategory,
                                                           onDeleteCategory,
                                                           onAddProduct,
                                                           onRemoveProduct,
                                                       }) => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(initialCategory.name);
    const [page, setPage] = useState(1);
    const productsPerPage = 9;

    // Lấy storeId từ localStorage
    const storeId = localStorage.getItem('selectedStoreId');

    // Load chi tiết danh mục từ API
    const { data: category = initialCategory, isLoading } = useQuery<CategoryDetailData, Error>({
        queryKey: ['categoryDetail', Number(storeId), initialCategory.id],
        queryFn: () => fetchCategoryDetail(Number(storeId), initialCategory.id),
        enabled: !!storeId,
        initialData: initialCategory,
    });

    // Cập nhật editName khi category thay đổi
    useEffect(() => {
        setEditName(category.name);
    }, [category.name]);

    const filteredUncategorizedProducts = useMemo(() =>
            category.uncategorizedProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [category.uncategorizedProducts, searchQuery]
    );

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * productsPerPage;
        return filteredUncategorizedProducts.slice(start, start + productsPerPage);
    }, [filteredUncategorizedProducts, page]);

    const totalPages = Math.ceil(filteredUncategorizedProducts.length / productsPerPage);

    const handleRemoveProduct = (productId: number) => {
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc muốn xóa sản phẩm này khỏi danh mục?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                onRemoveProduct(category.id, productId);
            }
        });
    };

    const handleAddProduct = (productId: number, productName: string) => {
        Swal.fire({
            title: 'Xác nhận thêm',
            text: `Bạn có muốn thêm "${productName}" vào danh mục "${category.name}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Thêm',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                onAddProduct(category.id, productId);
            }
        });
    };

    const handleSaveEdit = () => {
        if (editName.trim()) {
            onEditCategory(category.id, editName.trim());
            queryClient.invalidateQueries({ queryKey: ['categoryDetail', Number(storeId), category.id] });
            setIsEditing(false);
        }
    };

    if (isLoading) {
        return <div className="p-6">Đang tải chi tiết danh mục...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                        <FiArrowLeft size={16} />
                        Quay lại
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="text-lg font-semibold border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditName(category.name);
                                        }}
                                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold text-gray-900">{category.name}</h1>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-1 text-blue-500 hover:text-blue-600"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteCategory(category.id)}
                                        className="p-1 text-red-500 hover:text-red-600"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            )}
                            <p className="text-sm text-gray-600">{category.products.length} sản phẩm trực tiếp</p>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold mb-4">Sản phẩm trong danh mục</h2>
                    {category.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveProduct(product.id)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có sản phẩm trong danh mục này</p>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            Sản phẩm chưa phân loại ({filteredUncategorizedProducts.length})
                        </h2>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {paginatedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAddProduct(product.id, product.name)}
                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                        >
                                            <FiPlus size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`px-3 py-1 rounded-lg ${
                                            page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                        } hover:bg-blue-500 hover:text-white transition-colors duration-200`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            {searchQuery ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm chưa phân loại'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryDetail;