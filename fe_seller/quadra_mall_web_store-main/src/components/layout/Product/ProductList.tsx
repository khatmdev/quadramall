import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiDownload, FiChevronLeft, FiChevronRight, FiEdit, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { getAllProducts, activateProduct, deactivateProduct } from '@/services/productService';
import { Product } from '@/types/product';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // Thêm để tích hợp tốt với React

// Tạo SweetAlert2 instance cho React
const MySwal = withReactContent(Swal);

// Import CSS của SweetAlert2
import 'sweetalert2/dist/sweetalert2.min.css';

interface ProductListProps {
    onAdd: () => void;
    onEdit: (id: string) => void;
    refresh: boolean;
    setRefresh: (refresh: boolean) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onAdd, onEdit, refresh, setRefresh }) => {
    const selectedStoreId = localStorage.getItem('selectedStoreId');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [togglingIds, setTogglingIds] = useState<string[]>([]);
    const itemsPerPage = 10;

    const fetchProducts = async () => {
        if (!selectedStoreId) {
            setError('Please select a store from the list.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getAllProducts(selectedStoreId);
            setProducts(data);
            setRefresh(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedStoreId, refresh]);

    const handleStatusToggle = async (productId: string, currentStatus: boolean) => {
        setTogglingIds(prev => [...prev, productId]);
        try {
            if (currentStatus) {
                await deactivateProduct(productId);
                toast.success('Sản phẩm đã được vô hiệu hóa thành công!');
            } else {
                await activateProduct(productId);
                toast.success('Sản phẩm đã được kích hoạt thành công!');
            }
            await fetchProducts();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi thay đổi trạng態 sản phẩm';
            toast.error(errorMessage);
        } finally {
            setTogglingIds(prev => prev.filter(id => id !== productId));
        }
    };

    const handleBulkActivate = async () => {
        if (selectedProducts.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        console.log('Showing SweetAlert2 for bulk activate'); // Debug
        const result = await MySwal.fire({
            title: `Kích hoạt ${selectedProducts.length} sản phẩm?`,
            text: 'Bạn có chắc muốn kích hoạt các sản phẩm đã chọn?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Kích hoạt',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#dc2626',
            customClass: {
                container: 'swal2-zindex-fix' // Đảm bảo z-index
            }
        });

        if (!result.isConfirmed) {
            console.log('Bulk activate cancelled'); // Debug
            return;
        }

        setTogglingIds(prev => [...prev, ...selectedProducts]);
        try {
            const promises = selectedProducts.map(productId => activateProduct(productId));
            await Promise.all(promises);
            toast.success(`Đã kích hoạt ${selectedProducts.length} sản phẩm thành công!`);
            setSelectedProducts([]);
            await fetchProducts();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi kích hoạt sản phẩm';
            toast.error(errorMessage);
        } finally {
            setTogglingIds(prev => prev.filter(id => !selectedProducts.includes(id)));
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedProducts.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        console.log('Showing SweetAlert2 for bulk deactivate'); // Debug
        const result = await MySwal.fire({
            title: `Vô hiệu hóa ${selectedProducts.length} sản phẩm?`,
            text: 'Bạn có chắc muốn vô hiệu hóa các sản phẩm đã chọn?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Vô hiệu hóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#dc2626',
            customClass: {
                container: 'swal2-zindex-fix' // Đảm bảo z-index
            }
        });

        if (!result.isConfirmed) {
            console.log('Bulk deactivate cancelled'); // Debug
            return;
        }

        setTogglingIds(prev => [...prev, ...selectedProducts]);
        try {
            const promises = selectedProducts.map(productId => deactivateProduct(productId));
            await Promise.all(promises);
            toast.success(`Đã vô hiệu hóa ${selectedProducts.length} sản phẩm thành công!`);
            setSelectedProducts([]);
            await fetchProducts();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi vô hiệu hóa sản phẩm';
            toast.error(errorMessage);
        } finally {
            setTogglingIds(prev => prev.filter(id => !selectedProducts.includes(id)));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.itemType.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && product.status) ||
            (statusFilter === 'inactive' && !product.status);

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleCheckboxChange = (id: string) => {
        setSelectedProducts((prev) =>
            prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProducts(paginatedProducts.map((product) => product.id.toString()));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleStatusFilterChange = (filter: 'all' | 'active' | 'inactive') => {
        setStatusFilter(filter);
        setCurrentPage(1);
        setSelectedProducts([]);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Products</h2>
                    <div className="text-sm text-gray-600">
                        Hiển thị {filteredProducts.length} sản phẩm
                        {statusFilter === 'active' && ' (Đang hoạt động)'}
                        {statusFilter === 'inactive' && ' (Đã vô hiệu hóa)'}
                        {statusFilter === 'all' && ' (Tất cả)'}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Đã vô hiệu hóa</option>
                    </select>

                    <div className="relative w-full sm:w-64">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                            <FiDownload className="text-gray-500" /> Export
                        </button>

                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                            <FiPlus /> Add Product
                        </button>

                        {selectedProducts.length > 0 && (
                            <>
                                <button
                                    onClick={handleBulkActivate}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                                    disabled={togglingIds.length > 0}
                                >
                                    <FiToggleRight /> Kích hoạt ({selectedProducts.length})
                                </button>

                                <button
                                    onClick={handleBulkDeactivate}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                                    disabled={togglingIds.length > 0}
                                >
                                    <FiToggleLeft /> Vô hiệu hóa ({selectedProducts.length})
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium">
                    <tr>
                        <th className="py-3 px-4 text-left">
                            <input
                                type="checkbox"
                                checked={paginatedProducts.length > 0 && selectedProducts.length === paginatedProducts.length}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </th>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Slug</th>
                        <th className="py-3 px-4 text-left">Image</th>
                        <th className="py-3 px-4 text-left">Stock</th>
                        <th className="py-3 px-4 text-left">Type</th>
                        <th className="py-3 px-4 text-left">Min Price</th>
                        <th className="py-3 px-4 text-left">Max Price</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedProducts.length === 0 ? (
                        <tr>
                            <td colSpan={11} className="py-8 px-4 text-center text-gray-500">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại'
                                    : 'Chưa có sản phẩm nào'
                                }
                            </td>
                        </tr>
                    ) : (
                        paginatedProducts.map((product) => (
                            <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id.toString())}
                                        onChange={() => handleCheckboxChange(product.id.toString())}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </td>
                                <td className="py-3 px-4">{product.id}</td>
                                <td className={`py-3 px-4 font-medium ${product.status ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {product.name}
                                </td>
                                <td className={`py-3 px-4 ${product.status ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {product.slug}
                                </td>
                                <td className="py-3 px-4">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={`w-12 h-12 object-cover rounded-md ${!product.status ? 'opacity-50' : ''}`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-image.png';
                                        }}
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            product.status
                                                ? product.totalStock > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {product.totalStock}
                                    </span>
                                </td>
                                <td className={`py-3 px-4 ${product.status ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {product.itemType}
                                </td>
                                <td className={`py-3 px-4 font-medium ${product.status ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {product.minPrice.toLocaleString()} VND
                                </td>
                                <td className={`py-3 px-4 font-medium ${product.status ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {product.maxPrice.toLocaleString()} VND
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                product.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {product.status ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => handleStatusToggle(product.id.toString(), product.status)}
                                            disabled={togglingIds.includes(product.id.toString())}
                                            className={`p-1 rounded-md transition-colors ${
                                                product.status
                                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                            } ${togglingIds.includes(product.id.toString()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={product.status ? 'Vô hiệu hóa sản phẩm' : 'Kích hoạt sản phẩm'}
                                        >
                                            {togglingIds.includes(product.id.toString()) ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                            ) : (
                                                product.status ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => onEdit(product.id.toString())}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Chỉnh sửa sản phẩm"
                                    >
                                        <FiEdit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                    <div>
                        Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to{' '}
                        {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <FiChevronLeft />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;