import React from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { CategoryDetailData } from '@/types/Category';

interface ProductListModalProps {
  category: CategoryDetailData;
  onClose: () => void;
  onRemoveProduct: (categoryId: number, productId: number) => void;
}

const ProductListModal: React.FC<ProductListModalProps> = ({ category, onClose, onRemoveProduct }) => {
  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Sản phẩm trong danh mục: {category.name}
            </h3>
            <button
                className="p-4 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 transition-colors"
                onClick={onClose}
            >
              <FiX className="text-gray-600" />
            </button>
          </div>
          {category.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.products.map((product) => (
                    <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm"
                    >
                      <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </p>
                      </div>
                      <button
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          onClick={() => onRemoveProduct(category.id, product.id)}
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                ))}
              </div>
          ) : (
              <p className="text-gray-600 text-center">Chưa có sản phẩm trong danh mục này.</p>
          )}
        </div>
      </div>
  );
};

export default ProductListModal;