import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '@/store';
import ProductList from '@/components/layout/Product/ProductList';
import ProductForm from '@/components/layout/Product/ProductForm';
import { createProduct, updateProduct } from '@/services/productService';
import { ProductCreateDto, ProductCreatedResponse } from '@/types/ProductCreate';
import { ProductEditDto } from '@/types/ProductEdit';
import { ProductUpdateDto } from '@/types/ProductUpdateDto';

const Products: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [refreshList, setRefreshList] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);
    const storeId = useSelector((state: RootState) => state.auth.storeId) || localStorage.getItem('selectedStoreId');

    console.log('user', user, 'store id', storeId);

    useEffect(() => {
        if (!user || !user.email) {
            toast.error('Vui lòng đăng nhập để quản lý sản phẩm');
            window.location.href = '/login';
        }
    }, [user]);

    const handleAdd = () => {
        setEditProductId(null);
        setActiveTab('form');
    };

    const handleEdit = (id: string) => {
        setEditProductId(id);
        setActiveTab('form');
    };

    const handleSaveProduct = async (productData: ProductCreateDto | ProductUpdateDto) => {
        try {
            if (editProductId) {
                // Cập nhật sản phẩm
                const response: ProductEditDto = await updateProduct(editProductId, productData as ProductUpdateDto);
                console.log('Product updated at', new Date().toLocaleString(), ':', response);
                toast.success('Sản phẩm đã được cập nhật thành công!');
            } else {
                // Thêm sản phẩm mới
                const response: ProductCreatedResponse = await createProduct(productData as ProductCreateDto);
                console.log('Product created at', new Date().toLocaleString(), ':', response);
                toast.success('Sản phẩm đã được tạo thành công!');
            }
            // Delay 2-3 giây để hiển thị toast thành công trước khi chuyển tab
            setTimeout(() => {
                setRefreshList(true); // Làm mới danh sách sản phẩm
                setActiveTab('list'); // Quay lại danh sách
                setEditProductId(null); // Xóa editProductId
            }, 2500); // 2.5 giây
        } catch (error: any) {
            console.error('Error saving product at', new Date().toLocaleString(), ':', error);
            let errorMessage = error.message || 'Có lỗi xảy ra khi lưu sản phẩm!';
            if (error.message.includes('trùng lặp')) {
                errorMessage = 'Tồn tại phân loại sản phẩm trùng lặp. Vui lòng kiểm tra lại!';
            }
            toast.error(errorMessage, { autoClose: false });
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => {
                        setActiveTab('list');
                        setEditProductId(null);
                    }}
                >
                    Product List
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'form' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => {
                        setEditProductId(null);
                        setActiveTab('form');
                    }}
                >
                    {editProductId ? 'Edit Product' : 'Add Product'}
                </button>
            </div>
            {activeTab === 'list' ? (
                <ProductList onAdd={handleAdd} onEdit={handleEdit} refresh={refreshList} setRefresh={setRefreshList} />
            ) : (
                <ProductForm
                    onSave={handleSaveProduct}
                    editProductId={editProductId}
                    storeId={storeId}
                />
            )}
        </div>
    );
};

export default Products;