import React, { useState } from 'react';
import MediaUpload from '@/components/layout/Product/ProductForm/MediaUpload';
import BasicInfo from '@/components/layout/Product/ProductForm/BasicInfo';
import ProductDescription from '@/components/layout/Product/ProductForm/ProductDescription';
import SpecificationsSection from '@/components/layout/Product/ProductForm/SpecificationsSection';
import AttributesSection from '@/components/layout/Product/ProductForm/AttributesSection';
import AddonGroupsSection from '@/components/layout/Product/ProductForm/AddonGroupsSection';
import LoadingOverlay from './LoadingOverlay';
import { useProductFormLogic } from './useProductFormLogic';
import { ProductCreateDto } from '@/types/ProductCreate';
import { ProductUpdateDto } from '@/types/ProductUpdateDto';
import { Specification as SpecificationEdit } from '@/types/ProductEdit';
import { Attribute } from '@/types/api'; // Nhập kiểu Attribute từ @/types/api

interface ProductFormProps {
    onSave: (productData: ProductCreateDto | ProductUpdateDto) => Promise<void>;
    editProductId: string | null;
    storeId: string | undefined;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, editProductId, storeId }) => {
    const {
        productImages,
        setProductImages,
        productVideo,
        setProductVideo,
        thumbnailImage,
        setThumbnailImage,
        productName,
        setProductName,
        selectedItemType,
        setSelectedItemType,
        description,
        setDescription,
        specifications,
        setSpecifications,
        attributes,
        setAttributes,
        productVariants,
        setProductVariants,
        addonGroups,
        setAddonGroups,
        defaultValues,
        setDefaultValues,
        isLoading,
        progress,
        collectDescriptionFiles,
        handleSubmit,
    } = useProductFormLogic({ onSave, editProductId, storeId });

    // Thêm trạng thái suggestions để nhận từ BasicInfo
    const [suggestions, setSuggestions] = useState<Attribute[]>([]);

    const handleSubmitWithValidation = async () => {
        if (!thumbnailImage) {
            alert('Vui lòng thêm ảnh bìa cho sản phẩm.');
            return;
        }
        await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    };

    return (
        <>
            <LoadingOverlay isVisible={isLoading} progress={progress} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {editProductId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                                    </h1>
                                    <p className="text-sm text-gray-500">Điền đầy đủ thông tin để đăng bán sản phẩm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">

                        <BasicInfo
                            productName={productName}
                            setProductName={setProductName}
                            selectedItemType={selectedItemType}
                            setSelectedItemType={setSelectedItemType}
                            suggestions={suggestions}
                            setSuggestions={setSuggestions}
                        />
                        <MediaUpload
                            productImages={productImages}
                            setProductImages={setProductImages}
                            productVideo={productVideo}
                            setProductVideo={setProductVideo}
                            thumbnailImage={thumbnailImage}
                            setThumbnailImage={setThumbnailImage}
                        />
                        <SpecificationsSection
                            specifications={specifications as SpecificationEdit[]}
                            setSpecifications={setSpecifications}
                        />
                        <ProductDescription
                            setDescription={setDescription}
                            collectDescriptionFiles={collectDescriptionFiles}
                            initialDescription={description}
                        />
                        <AttributesSection
                            attributes={attributes}
                            setAttributes={setAttributes}
                            productVariants={productVariants}
                            setProductVariants={setProductVariants}
                            defaultValues={defaultValues}
                            setDefaultValues={setDefaultValues}
                            isEditing={!!editProductId}
                            suggestions={suggestions} // Truyền suggestions vào AttributesSection
                        />
                        <AddonGroupsSection
                            addonGroups={addonGroups}
                            setAddonGroups={setAddonGroups}
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                                onClick={() => window.history.back()}
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                onClick={handleSubmitWithValidation}
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                )}
                                {isLoading ? 'Đang lưu...' : editProductId ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductForm;