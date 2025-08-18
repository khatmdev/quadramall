import { api } from '@/main';
import { AxiosError } from 'axios';
import { Category, CategoryDetailData, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/Category';

// Interface cho error response từ backend
interface ErrorResponse {
    message?: string;
}

// Lấy danh sách danh mục theo storeId
export const fetchCategoriesByStoreId = async (storeId: number): Promise<Category[]> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get(`/seller/stores/${storeId}/categories`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data; // Giả định ApiResponse có trường data chứa danh sách danh mục
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching categories:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải danh sách danh mục. Vui lòng thử lại sau.'
        );
    }
};

// Lấy chi tiết danh mục theo storeId và categoryId
export const fetchCategoryDetail = async (storeId: number, categoryId: number): Promise<CategoryDetailData> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.get(`/seller/stores/${storeId}/categories/${categoryId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data; // Giả định ApiResponse có trường data chứa chi tiết danh mục
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching category detail:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tải chi tiết danh mục. Vui lòng thử lại sau.'
        );
    }
};

// Tạo danh mục mới
export const createCategory = async (storeId: number, request: CreateCategoryRequest): Promise<Category> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.post(`/seller/stores/${storeId}/categories`, request, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data; // Giả định ApiResponse có trường data chứa danh mục
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error creating category:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể tạo danh mục. Vui lòng thử lại sau.'
        );
    }
};

// Cập nhật danh mục
export const updateCategory = async (storeId: number, categoryId: number, request: UpdateCategoryRequest): Promise<Category> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        const response = await api.put(`/seller/stores/${storeId}/categories/${categoryId}`, request, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data; // Giả định ApiResponse có trường data chứa danh mục
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error updating category:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể cập nhật danh mục. Vui lòng thử lại sau.'
        );
    }
};

// Xóa danh mục
export const deleteCategory = async (storeId: number, categoryId: number): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        await api.delete(`/seller/stores/${storeId}/categories/${categoryId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error deleting category:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể xóa danh mục. Vui lòng thử lại sau.'
        );
    }
};

// Thêm sản phẩm vào danh mục
export const addProductToCategory = async (storeId: number, categoryId: number, productId: number): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        await api.post(`/seller/stores/${storeId}/categories/${categoryId}/products/${productId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error adding product to category:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể thêm sản phẩm vào danh mục. Vui lòng thử lại sau.'
        );
    }
};

// Xóa sản phẩm khỏi danh mục
export const removeProductFromCategory = async (storeId: number, categoryId: number, productId: number): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        }
        await api.delete(`/seller/stores/${storeId}/categories/${categoryId}/products/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error removing product from category:', axiosError.response?.data || axiosError.message);
        throw new Error(
            axiosError.response?.data?.message || 'Không thể xóa sản phẩm khỏi danh mục. Vui lòng thử lại sau.'
        );
    }
};