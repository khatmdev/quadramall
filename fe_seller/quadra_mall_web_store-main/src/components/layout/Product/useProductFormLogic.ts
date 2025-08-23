import {useState, useEffect} from 'react';
import {uploadImage, uploadVideo} from '@/services/uploadService';
import {getProductById} from '@/services/productService';
import {
    ItemType,
    ImageFile,
    VideoFile,
    Attribute,
    ProductVariant,
    AddonGroup as AddonGroupCreate,
    DefaultValues,
    ProductCreateDto,
    DescriptionItem,
} from '@/types/ProductCreate';
import {ProductUpdateDto} from '@/types/ProductUpdateDto';
import {ProductEditDto, Specification as SpecificationEdit} from '@/types/ProductEdit';
import {AxiosError} from 'axios';

interface ErrorResponse {
    message?: string;
}

enum LoadingStage {
    IDLE = 'IDLE',
    VALIDATING = 'VALIDATING',
    UPLOADING_THUMBNAIL = 'UPLOADING_THUMBNAIL',
    UPLOADING_VIDEO = 'UPLOADING_VIDEO',
    UPLOADING_IMAGES = 'UPLOADING_IMAGES',
    UPLOADING_VARIANT_IMAGES = 'UPLOADING_VARIANT_IMAGES',
    UPLOADING_DESCRIPTION_IMAGES = 'UPLOADING_DESCRIPTION_IMAGES',
    PROCESSING_DATA = 'PROCESSING_DATA',
    SAVING_PRODUCT = 'SAVING_PRODUCT',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR',
}

interface ProgressInfo {
    current: number;
    total: number;
    stage: LoadingStage;
    message: string;
    percentage: number;
    error?: string;
}

interface UseProductFormLogicProps {
    editProductId: string | null;
    storeId: string | undefined;
    onSave: (productData: ProductCreateDto | ProductUpdateDto) => Promise<void>;
}

export const useProductFormLogic = ({editProductId, storeId, onSave}: UseProductFormLogicProps) => {
    const [productImages, setProductImages] = useState<ImageFile[]>([]);
    const [productVideo, setProductVideo] = useState<VideoFile | null>(null);
    const [thumbnailImage, setThumbnailImage] = useState<ImageFile | null>(null);
    const [productName, setProductName] = useState<string>('');
    const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
    const [description, setDescription] = useState<string>('');
    const [specifications, setSpecifications] = useState<SpecificationEdit[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const [addonGroups, setAddonGroups] = useState<AddonGroupCreate[]>([]);
    const [descriptionFiles, setDescriptionFiles] = useState<File[]>([]);
    const [defaultValues, setDefaultValues] = useState<DefaultValues>({
        price: 0,
        stock: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<ProgressInfo>({
        current: 0,
        total: 0,
        stage: LoadingStage.IDLE,
        message: '',
        percentage: 0,
    });

    const updateProgress = (stage: LoadingStage, current: number = 0, total: number = 0, message: string = '', error?: string) => {
        const stageWeights: { [key in LoadingStage]: number } = {
            [LoadingStage.IDLE]: 0,
            [LoadingStage.VALIDATING]: 5,
            [LoadingStage.UPLOADING_THUMBNAIL]: 10,
            [LoadingStage.UPLOADING_VIDEO]: 15,
            [LoadingStage.UPLOADING_IMAGES]: 25,
            [LoadingStage.UPLOADING_VARIANT_IMAGES]: 15,
            [LoadingStage.UPLOADING_DESCRIPTION_IMAGES]: 15,
            [LoadingStage.PROCESSING_DATA]: 5,
            [LoadingStage.SAVING_PRODUCT]: 10,
            [LoadingStage.COMPLETED]: 5,
            [LoadingStage.ERROR]: 0,
        };

        const completedStages = Object.values(LoadingStage)
            .slice(0, Object.values(LoadingStage).indexOf(stage))
            .filter((s) => s !== LoadingStage.IDLE && s !== LoadingStage.ERROR);
        const completedWeight = completedStages.reduce((sum, s) => sum + stageWeights[s], 0);

        const currentStageProgress = total > 0 ? (current / total) * stageWeights[stage] : stageWeights[stage];
        const totalPercentage = Math.min(completedWeight + currentStageProgress, 100);

        const safePercentage = isNaN(totalPercentage) ? 0 : totalPercentage;

        setProgress({
            current,
            total,
            stage,
            message,
            percentage: safePercentage,
            error,
        });
    };

    useEffect(() => {
        if (editProductId) {
            const fetchProductData = async () => {
                try {
                    setIsLoading(true);
                    updateProgress(LoadingStage.PROCESSING_DATA, 0, 0, 'Đang tải dữ liệu sản phẩm...');
                    const productData: ProductEditDto = await getProductById(editProductId);

                    setProductName(productData.name);
                    setSelectedItemType({id: productData.itemTypeId, name: productData.itemTypeName, parent_id: null});
                    setDescription(productData.description);
                    setSpecifications(
                        productData.specifications.map((spec) => ({
                            id: spec.id,
                            specificationId: spec.specificationId,
                            specificationName: spec.specificationName,
                            value: spec.value,
                        }))
                    );

                    // Set thumbnail image separately
                    if (productData.thumbnailUrl) {
                        setThumbnailImage({
                            id: null,
                            file: null,
                            url: productData.thumbnailUrl,
                        });
                    }

                    // Set product images (excluding thumbnail)
                    if (productData.images && productData.images.length > 0) {
                        const productImagesOnly = productData.images
                            .filter((img) => img.url !== productData.thumbnailUrl)
                            .map((img) => ({
                                id: img.id,
                                file: null,
                                url: img.url,
                            }));
                        setProductImages(productImagesOnly);
                    }

                    setProductVariants(
                        productData.variants.map((variant) => ({
                            id: variant.id,
                            combination: variant.productDetails.map((detail) => ({
                                attributeName: detail.attributeName,
                                value: detail.value,
                            })),
                            price: variant.price,
                            stock: variant.stockQuantity,
                            sku: variant.sku,
                            image: variant.imageUrl ? {file: null, url: variant.imageUrl} : null,
                            altText: '',
                            isActive: variant.isActive,
                            isSelected: true,
                        }))
                    );
                    setDefaultValues({
                        price: productData.variants.length > 0 ? productData.variants[0].price : 0,
                        stock: productData.variants.length > 0 ? productData.variants[0].stockQuantity : 0,
                    });

                    if (productData.videoUrl) {
                        setProductVideo({
                            id: null,
                            file: null,
                            url: productData.videoUrl,
                        });
                    }
                    const uniqueAttributes: { [key: string]: Attribute } = {};
                    productData.variants.forEach((variant) => {
                        variant.productDetails.forEach((detail) => {
                            if (!uniqueAttributes[detail.attributeName]) {
                                uniqueAttributes[detail.attributeName] = {
                                    id: detail.attributeValueId,
                                    name: detail.attributeName,
                                    typesValue: detail.typesValue,
                                    values: [],
                                };
                            }
                            if (
                                !uniqueAttributes[detail.attributeName].values.some(
                                    (v) => v.value === detail.value
                                )
                            ) {
                                uniqueAttributes[detail.attributeName].values.push({
                                    attributeName: detail.attributeName,
                                    value: detail.value,
                                });
                            }
                        });
                    });
                    setAttributes(Object.values(uniqueAttributes));
                    setAddonGroups(
                        productData.addonGroups.map((group) => ({
                            id: group.id,
                            name: group.name,
                            maxChoice: group.maxChoice || 1,
                            addons: group.addons.map((addon) => ({
                                id: addon.id,
                                name: addon.name,
                                priceAdjust: addon.price,
                                active: addon.active,
                            })),
                        }))
                    );

                    updateProgress(LoadingStage.COMPLETED, 0, 0, 'Dữ liệu sản phẩm đã được tải thành công!');
                    setTimeout(() => {
                        setIsLoading(false);
                        setProgress({
                            current: 0,
                            total: 0,
                            stage: LoadingStage.IDLE,
                            message: '',
                            percentage: 0,
                        });
                    }, 1500);
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Không thể tải dữ liệu sản phẩm.';
                    console.error('Error loading product data:', error, errorMessage);
                    updateProgress(LoadingStage.ERROR, 0, 0, '', errorMessage);
                    setTimeout(() => {
                        setIsLoading(false);
                        setProgress({
                            current: 0,
                            total: 0,
                            stage: LoadingStage.IDLE,
                            message: '',
                            percentage: 0,
                        });
                    }, 3000);
                }
            };
            fetchProductData();
        }
    }, [editProductId]);

    const collectDescriptionFiles = (files: File[]) => {
        setDescriptionFiles(files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        try {
            setIsLoading(true);
            updateProgress(LoadingStage.VALIDATING, 0, 0, 'Đang kiểm tra tính hợp lệ của dữ liệu...');

            if (!productName.trim()) throw new Error('Vui lòng nhập tên sản phẩm');
            if (!selectedItemType) throw new Error('Vui lòng chọn ngành hàng');
            if (!description.trim()) throw new Error('Vui lòng nhập mô tả sản phẩm');
            if (productImages.length < 3) throw new Error('Vui lòng tải lên ít nhất 3 hình ảnh sản phẩm');
            if (!thumbnailImage) throw new Error('Vui lòng thêm ảnh bìa cho sản phẩm');
            if (!storeId) throw new Error('Vui lòng chọn cửa hàng trước khi tạo sản phẩm.');
            if (!localStorage.getItem('token')) {
                throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            }

            if (attributes.length > 0) {
                const selectedVariants = productVariants.filter((v) => v.isSelected);
                if (selectedVariants.length === 0) {
                    throw new Error('Vui lòng chọn ít nhất một biến thể sản phẩm để lưu.');
                }
                const invalidVariants = selectedVariants.filter(
                    (variant) => variant.price < 0 || variant.stock < 0
                );
                if (invalidVariants.length > 0) {
                    throw new Error('Vui lòng kiểm tra giá và số lượng kho của các biến thể được chọn.');
                }
                const invalidCombinations = selectedVariants.filter(
                    (variant) =>
                        !variant.combination ||
                        variant.combination.some(
                            (comb) => !comb.attributeName.trim() || !comb.value.trim()
                        )
                );
                if (invalidCombinations.length > 0) {
                    throw new Error('Vui lòng điền đầy đủ tên và giá trị cho tất cả thuộc tính của biến thể được chọn.');
                }

                selectedVariants.forEach((variant) => {
                    const attributeNames = new Set<string>();
                    variant.combination.forEach((comb) => {
                        if (attributeNames.has(comb.attributeName)) {
                            throw new Error(`Biến thể có thuộc tính trùng lặp: ${comb.attributeName}`);
                        }
                        attributeNames.add(comb.attributeName);
                    });
                });

                const variantCombinationSet = new Set<string>();
                selectedVariants.forEach((variant) => {
                    const combinationKey = variant.combination
                        .sort((a, b) => a.attributeName.localeCompare(b.attributeName))
                        .map((comb) => `${comb.attributeName}:${comb.value}`)
                        .join('|');
                    if (variantCombinationSet.has(combinationKey)) {
                        throw new Error(`Tồn tại biến thể trùng lặp với tổ hợp: ${combinationKey.replace(/\|/g, ', ')}`);
                    }
                    variantCombinationSet.add(combinationKey);
                });
            } else {
                if (defaultValues.price <= 0) throw new Error('Vui lòng nhập giá bán hợp lệ');
                if (defaultValues.stock < 0) throw new Error('Vui lòng nhập số lượng kho hợp lệ');
            }

            const invalidSpecs = specifications.filter(
                (spec) => !spec.specificationName.trim() || !spec.value.trim()
            );
            if (invalidSpecs.length > 0) {
                throw new Error('Vui lòng điền đầy đủ tên và giá trị cho tất cả thông số kỹ thuật.');
            }

            // Upload thumbnail image
            updateProgress(LoadingStage.UPLOADING_THUMBNAIL, 0, 1, 'Đang tải ảnh bìa lên cloud...');
            let thumbnailUrl = thumbnailImage?.url || '';
            if (thumbnailImage?.file) {
                thumbnailUrl = await uploadImage(thumbnailImage.file);
                URL.revokeObjectURL(thumbnailImage.url);
                setThumbnailImage({...thumbnailImage, url: thumbnailUrl, file: null});
            }
            updateProgress(LoadingStage.UPLOADING_THUMBNAIL, 1, 1, 'Ảnh bìa đã được tải lên thành công');

            // Upload product images
            updateProgress(LoadingStage.UPLOADING_IMAGES, 0, productImages.length, 'Bắt đầu tải hình ảnh sản phẩm...');
            const imageUrls: string[] = [];
            const updatedImages: ImageFile[] = [...productImages];
            for (let i = 0; i < productImages.length; i++) {
                const image = productImages[i];
                const url = image.file ? await uploadImage(image.file) : image.url;
                if (image.file) {
                    URL.revokeObjectURL(image.url);
                }
                imageUrls.push(url);
                updatedImages[i] = {...updatedImages[i], url, file: null};
                updateProgress(LoadingStage.UPLOADING_IMAGES, i + 1, productImages.length, `Đã tải ${i + 1}/${productImages.length} hình ảnh`);
            }
            setProductImages(updatedImages);

            // Upload video
            let videoUrl = productVideo?.url || '';
            if (productVideo?.file) {
                updateProgress(LoadingStage.UPLOADING_VIDEO, 0, 1, 'Đang tải video sản phẩm lên cloud...');
                videoUrl = await uploadVideo(productVideo.file);
                URL.revokeObjectURL(productVideo.url);
                setProductVideo({...productVideo, url: videoUrl, file: null});
                updateProgress(LoadingStage.UPLOADING_VIDEO, 1, 1, 'Video đã được tải lên thành công');
            }

            const selectedVariants = productVariants.filter((v) => v.isSelected);
            const variantImagesCount = selectedVariants.filter((v) => v.image?.file).length;
            const variantImageUrls: string[] = [];
            if (variantImagesCount > 0) {
                updateProgress(LoadingStage.UPLOADING_VARIANT_IMAGES, 0, variantImagesCount, 'Bắt đầu tải hình ảnh biến thể...');
                let uploadedCount = 0;

                for (const variant of selectedVariants) {
                    if (variant.image?.file) {
                        const url = await uploadImage(variant.image.file);
                        variantImageUrls.push(url);
                        uploadedCount++;
                        updateProgress(
                            LoadingStage.UPLOADING_VARIANT_IMAGES,
                            uploadedCount,
                            variantImagesCount,
                            `Đã tải ${uploadedCount}/${variantImagesCount} hình ảnh biến thể`
                        );
                    } else {
                        variantImageUrls.push(variant.image?.url || '');
                    }
                }
            } else {
                variantImageUrls.push(...selectedVariants.map((v) => v.image?.url || ''));
            }

            let finalDescription = description;
            if (descriptionFiles.length > 0) {
                updateProgress(LoadingStage.UPLOADING_DESCRIPTION_IMAGES, 0, descriptionFiles.length, 'Bắt đầu tải hình ảnh mô tả...');
                const descriptionImageUrls: string[] = [];

                for (let i = 0; i < descriptionFiles.length; i++) {
                    const file = descriptionFiles[i];
                    const url = await uploadImage(file);
                    descriptionImageUrls.push(url);
                    updateProgress(
                        LoadingStage.UPLOADING_DESCRIPTION_IMAGES,
                        i + 1,
                        descriptionFiles.length,
                        `Đã tải ${i + 1}/${descriptionFiles.length} hình ảnh mô tả`
                    );
                }

                updateProgress(LoadingStage.PROCESSING_DATA, 0, 0, 'Đang xử lý dữ liệu mô tả...');

                try {
                    const parsedDescription: DescriptionItem[] = JSON.parse(description);
                    let imageIndex = 0;
                    const updatedDescription = parsedDescription.map((item) => {
                        if (item.type === 'image' && item.url && item.url.startsWith('blob:')) {
                            if (imageIndex >= descriptionImageUrls.length) {
                                throw new Error('Số lượng hình ảnh mô tả không khớp.');
                            }
                            return { type: 'image', url: descriptionImageUrls[imageIndex++] };
                        }
                        return item;
                    });
                    finalDescription = JSON.stringify(updatedDescription);
                } catch (error) {
                    console.error('Lỗi xử lý mô tả:', error);
                    throw new Error((error as Error).message || 'Không thể xử lý dữ liệu mô tả sản phẩm');
                }
            }

            updateProgress(LoadingStage.PROCESSING_DATA, 0, 0, 'Đang chuẩn bị dữ liệu sản phẩm...');

            const slug = productName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

            const productData: ProductUpdateDto = {
                id: editProductId ? parseInt(editProductId) : 0,
                name: productName,
                slug,
                description: finalDescription,
                thumbnailUrl,
                videoUrl,
                storeId: parseInt(storeId),
                itemTypeId: selectedItemType.id,
                variants: selectedVariants.length > 0
                    ? selectedVariants.map((variant, index) => ({
                        id: variant.id,
                        sku: variant.sku || `P${editProductId || 'NEW'}-V${index + 1}`,
                        price: variant.price,
                        stockQuantity: variant.stock,
                        imageUrl: variantImageUrls[index] || '',
                        isActive: variant.isActive,
                        productDetails: variant.combination.map((comb) => ({
                            attributeValue: {
                                attributeName: comb.attributeName,
                                value: comb.value,
                                typesValue: attributes.find((attr) => attr.name === comb.attributeName)?.typesValue || 'ALL',
                            },
                        })),
                    }))
                    : [{
                        sku: `P${editProductId || 'NEW'}-DEFAULT`,
                        price: defaultValues.price,
                        stockQuantity: defaultValues.stock,
                        imageUrl: '',
                        isActive: true,
                        productDetails: [],
                    }],
                addonGroups: addonGroups.map((group) => ({
                    id: group.id,
                    name: group.name,
                    maxChoice: group.maxChoice,
                    addons: group.addons.map((addon) => ({
                        id: addon.id,
                        name: addon.name,
                        priceAdjust: addon.priceAdjust,
                        active: addon.active,
                    })),
                })),
                specifications: specifications.map((spec) => ({
                    id: spec.id ?? undefined,
                    specificationName: spec.specificationName,
                    value: spec.value,
                })),
                images: productImages.map((image, index) => ({
                    id: image.file ? null : image.id,
                    imageUrl: imageUrls[index] || image.url,
                })),
            };

            updateProgress(LoadingStage.SAVING_PRODUCT, 0, 0, 'Đang lưu sản phẩm vào hệ thống...');

            await onSave(productData);

            updateProgress(LoadingStage.COMPLETED, 0, 0, editProductId ? 'Sản phẩm đã được cập nhật thành công!' : 'Sản phẩm đã được tạo thành công!');

            setTimeout(() => {
                setIsLoading(false);
                setProgress({
                    current: 0,
                    total: 0,
                    stage: LoadingStage.IDLE,
                    message: '',
                    percentage: 0,
                });
            }, 1500);
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ErrorResponse>;
            let errorMessage = axiosError.message || 'Không thể lưu sản phẩm. Vui lòng thử lại.';
            if (axiosError.response?.status === 409) {
                errorMessage = 'Xung đột dữ liệu: Sản phẩm đã bị thay đổi. Vui lòng tải lại trang và thử lại.';
            } else if (axiosError.response?.status === 403) {
                errorMessage = 'Bạn không có quyền cập nhật sản phẩm này.';
            } else if (axiosError.response?.status === 400) {
                errorMessage = axiosError.response.data?.message || 'Dữ liệu không hợp lệ.';
            }
            console.error('Error submitting product:', error, errorMessage);
            updateProgress(LoadingStage.ERROR, 0, 0, '', errorMessage);
            setTimeout(() => {
                setIsLoading(false);
                setProgress({
                    current: 0,
                    total: 0,
                    stage: LoadingStage.IDLE,
                    message: '',
                    percentage: 0,
                });
            }, 3000);
        }
    };

    return {
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
        descriptionFiles,
        setDescriptionFiles,
        defaultValues,
        setDefaultValues,
        isLoading,
        progress,
        collectDescriptionFiles,
        handleSubmit,
    };
};