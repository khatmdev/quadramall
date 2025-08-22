import { api } from '@/main';
import { ProductCreateDto, ProductCreatedResponse } from '@/types/ProductCreate';
import { Product } from '@/types/product';
import { ItemTypeDTO } from '@/types/ItemType';
import { AxiosError } from 'axios';
import {ProductEditDto} from "@/types/ProductEdit";
import {ProductUpdateDto} from "@/types/ProductUpdateDto";

// Interface cho error response từ backend
interface ErrorResponse {
    message?: string;
}


/**
 * Lấy danh sách sản phẩm ACTIVE của cửa hàng
 */
export const getActiveProducts = async (storeId: string): Promise<Product[]> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get(`/seller/products/${storeId}/active`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching active products:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải danh sách sản phẩm đang hoạt động. Vui lòng thử lại sau.'
        );
    }
};

/**
 * Lấy danh sách sản phẩm INACTIVE của cửa hàng
 */
export const getInactiveProducts = async (storeId: string): Promise<Product[]> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get(`/seller/products/${storeId}/inactive`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching inactive products:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải danh sách sản phẩm đã vô hiệu hóa. Vui lòng thử lại sau.'
        );
    }
};

/**
 * Lấy TẤT CẢ sản phẩm của cửa hàng (cả active và inactive)
 */
export const getAllProducts = async (storeId: string): Promise<Product[]> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get(`/seller/products/${storeId}/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching all products:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.'
        );
    }
};


export const getProducts = async (storeId: string): Promise<Product[]> => {
    console.warn('getProducts() is deprecated. Use getActiveProducts(), getInactiveProducts(), or getAllProducts() instead.');
    return getAllProducts(storeId);
};

export const getItemTypes = async (): Promise<ItemTypeDTO[]> => {
    try {
        console.log('Fetching item types from /api/item-types at', new Date().toLocaleString());
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get('/api/item-types/hierarchy', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Item types fetched:', response.data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching item types:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải danh mục ngành hàng. Vui lòng thử lại sau.'
        );
    }
};

export const createProduct = async (productData: ProductCreateDto): Promise<ProductCreatedResponse> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực trong productService. Vui lòng đăng nhập lại.');
        }
        console.log('Creating product with data:', productData);
        const response = await api.post('/seller/products', productData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Product created response:', response.data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error creating product:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tạo sản phẩm. Vui lòng kiểm tra dữ liệu và thử lại.'
        );
    }
};

export const getProductById = async (productId: string): Promise<ProductEditDto> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get(`/seller/products/edit/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching product:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.'
        );
    }
};


export const updateProduct = async (productId: string, productData: ProductUpdateDto): Promise<ProductEditDto> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        console.log('Updating product with ID:', productId, 'and data:', productData);
        const response = await api.put(`/seller/products/${productId}`, productData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Product updated response:', response.data);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error updating product:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại sau.'
        );
    }
};


/**
 * Kích hoạt sản phẩm
 */
export const activateProduct = async (productId: string): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        console.log('Activating product with ID:', productId);
        await api.patch(`/seller/products/${productId}/activate`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Product activated successfully');
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error activating product:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể kích hoạt sản phẩm. Vui lòng thử lại sau.'
        );
    }
};

/**
 * Vô hiệu hóa sản phẩm
 */
export const deactivateProduct = async (productId: string): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        console.log('Deactivating product with ID:', productId);
        await api.patch(`/seller/products/${productId}/deactivate`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Product deactivated successfully');
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error deactivating product:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể vô hiệu hóa sản phẩm. Vui lòng thử lại sau.'
        );
    }
};
