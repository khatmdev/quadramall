import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiDownload, FiChevronLeft, FiChevronRight, FiEdit, FiTrash2 } from 'react-icons/fi';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/product';

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
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedStoreId) {
                setError('Please select a store from the list.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getProducts(selectedStoreId);
                setProducts(data);
                setRefresh(false); // Reset refresh sau khi tải
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [selectedStoreId, refresh]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.itemType.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleDelete = (id: string) => {
        if (window.confirm(`Are you sure you want to delete product #${id}?`)) {
            console.log('Delete product:', id);
            // TODO: Thêm logic xóa sản phẩm
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Products</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option>Filter</option>
                        <option>In Stock</option>
                        <option>Out of Stock</option>
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

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                            <FiDownload className="text-gray-500" /> Export
                        </button>
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                            <FiPlus /> Add Product
                        </button>
                        <button
                            onClick={() => selectedProducts.forEach((id) => handleDelete(id))}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                            disabled={selectedProducts.length === 0}
                        >
                            <FiTrash2 /> Delete
                        </button>
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
                    {paginatedProducts.map((product) => (
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
                            <td className="py-3 px-4 text-blue-600 font-medium">{product.name}</td>
                            <td className="py-3 px-4">{product.slug}</td>
                            <td className="py-3 px-4">
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                            </td>
                            <td className="py-3 px-4">{product.totalStock}</td>
                            <td className="py-3 px-4">{product.itemType}</td>
                            <td className="py-3 px-4">{product.minPrice.toLocaleString()} VND</td>
                            <td className="py-3 px-4">{product.maxPrice.toLocaleString()} VND</td>
                            <td className="py-3 px-4">{product.status ? 'Active' : 'Inactive'}</td>
                            <td className="py-3 px-4 flex gap-2">
                                <button
                                    onClick={() => onEdit(product.id.toString())}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id.toString())}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <FiTrash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <div>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries</div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                    >
                        <FiChevronLeft />
                    </button>
                    <button className="px-3 py-1 rounded-md bg-blue-600 text-white">{currentPage}</button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductList;