import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, GripVertical, RefreshCw, AlertCircle, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useToggleBannerActive, useMakeIntroBanner, useReorderBanners } from '@/hooks/useBanner';
import type { Banner } from '@/types/banner';
import { bannerSchema, type BannerFormValues } from '@/schemas/bannerSchema';
import { debounce } from '@/utils/helpers'; 
import type { ApiResponse } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import Cropper, { type Area } from 'react-easy-crop';
import { useUploadImage } from '@/hooks/useUpload';

// Component cho banner có thể kéo-thả
const SortableBanner = ({ banner, onToggleActive, onEdit, onDelete, onMakeIntro, isToggling }: {
    banner: Banner;
    onToggleActive: (id: number) => void;
    onEdit: (banner: Banner) => void;
    onDelete: (id: number) => void;
    onMakeIntro: (id: number) => void;
    isToggling: boolean;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-gray-50 rounded-lg p-4 border flex items-center gap-4">
            {/* Thanh kéo (handle) */}
            <div className="cursor-grab" {...attributes} {...listeners}>
                <GripVertical size={20} className="text-gray-500 hover:text-gray-700" />
            </div>
            <div className="flex-shrink-0">
                <img
                    src={banner.image}
                    alt={banner.description}
                    className="w-32 h-20 object-cover rounded-lg border"
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{banner.description}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        banner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {banner.active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                    {banner.active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Số thứ tự: {banner.displayOrder}
                        </span>
                    )}
                    {banner.isIntro && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Intro
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-1">Liên kết: {banner.toUrl}</p>
                <p className="text-sm text-gray-500 mb-1">Emoji: {banner.emoji}</p>
                <p className="text-sm text-gray-500">ID: {banner.id}</p>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <input
                    type="radio"
                    name="introBanner"
                    checked={banner.isIntro}
                    onChange={() => onMakeIntro(banner.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <button
                    onClick={() => onToggleActive(banner.id)}
                    className={`p-2 rounded-lg ${
                        banner.active ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'
                    }`}
                >
                    {banner.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                    onClick={() => onEdit(banner)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => onDelete(banner.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

// Component chính
const BannerSliderManagement = () => {
    const { data: banners, isLoading, error } = useBanners();
    const createBanner = useCreateBanner();
    const updateBanner = useUpdateBanner();
    const deleteBanner = useDeleteBanner();
    const toggleBannerActive = useToggleBannerActive();
    const makeIntroBanner = useMakeIntroBanner();
    const reorderBanners = useReorderBanners();
    const queryClient = useQueryClient(); // Thêm queryClient để làm mới query

    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [sortedBanners, setSortedBanners] = useState<Banner[]>([]);
    const [isOrderChanged, setIsOrderChanged] = useState<boolean>(false);
    const [isToggling, setIsToggling] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false); // State cho modal xóa
    const [bannerToDelete, setBannerToDelete] = useState<number | null>(null); // ID của banner cần xóa
    const [showCropModal, setShowCropModal] = useState<boolean>(false); // Modal crop
    const [imageSrc, setImageSrc] = useState<string>(''); // Nguồn ảnh gốc để crop
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [uploadError, setUploadError] = useState<string>(''); // Lỗi upload
    const { mutateAsync: uploadImageAsync } = useUploadImage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [previewImage, setPreviewImage] = useState(''); // State riêng để hiển thị preview ảnh (cũ hoặc mới)
    const [hasNewCrop, setHasNewCrop] = useState(false); // Flag kiểm tra xem có crop ảnh mới không (chỉ upload nếu true)
    // Đồng bộ sortedBanners với banners từ API
    useEffect(() => {
        if (banners) {
            setSortedBanners(banners);
            setIsOrderChanged(false); // Reset trạng thái thay đổi khi banners được cập nhật
            setIsToggling(false);
        }
    }, [banners]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        mode: 'onBlur',
        defaultValues: {
            description: '',
            image: '',
            toUrl: '',
            emoji: '',
            active: true,
            isIntro: false,
            displayOrder: 9999 // Mặc định là cuối cùng
        }
    });

        // useEffect để load data khi mở modal chỉnh sửa (mới thêm: Set previewImage từ ảnh cũ, reset flag)
    useEffect(() => {
        if (showModal && editingBanner) {
            // Load giá trị form từ editingBanner
            setValue('description', editingBanner.description);
            setValue('toUrl', editingBanner.toUrl);
            setValue('emoji', editingBanner.emoji);
            setValue('image', editingBanner.image); // Set image cũ vào form

            // Set preview từ ảnh cũ, nhưng không flag là crop mới
            setPreviewImage(editingBanner.image);
            setHasNewCrop(false);
            setImageSrc(''); // Không load imageSrc vì không crop lại
            setCroppedAreaPixels(null);
        } else if (showModal && !editingBanner) {
            // Cho banner mới: Reset hết
            reset();
            setPreviewImage('');
            setHasNewCrop(false);
            setImageSrc('');
            setCroppedAreaPixels(null);
        }
    }, [showModal, editingBanner, setValue, reset]);

    // Hàm crop hoàn thành
    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Hàm tạo ảnh cropped từ canvas
    const createCroppedImage = async (): Promise<Blob | null> => {
        if (!croppedAreaPixels || !imageSrc) return null;
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => { image.onload = resolve; });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const targetWidth = croppedAreaPixels.width;
        const targetHeight = croppedAreaPixels.height;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            targetWidth,
            targetHeight
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95); // Chất lượng 95%
        });
    };

    // Xử lý crop và preview (chỉnh sửa: Set previewImage và flag hasNewCrop)
    const handleCropConfirm = async () => {
        const croppedBlob = await createCroppedImage();
        if (croppedBlob) {
            const previewUrl = URL.createObjectURL(croppedBlob);
            setPreviewImage(previewUrl); // Sử dụng previewImage để hiển thị
            setHasNewCrop(true); // Đánh dấu đã có crop mới (sẽ upload khi submit)
            setShowCropModal(false);
        }
    };
    // Xử lý chọn file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError('');
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
        }
    };

        const handleFinalSubmit = handleSubmit(async (data) => {
        const activeBanners = sortedBanners.filter((banner) => banner.active);
        const newDisplayOrder = activeBanners.length + 1;
        const bannerData = {
            ...data,
            active: editingBanner ? editingBanner.active : true,
            isIntro: editingBanner ? editingBanner.isIntro : false,
            displayOrder: editingBanner ? editingBanner.displayOrder : newDisplayOrder
        };
        if (editingBanner) {
            updateBanner.mutate({ id: editingBanner.id, data: bannerData });
        } else {
            createBanner.mutate(bannerData as Banner);
        }
        resetForm();
    });

    // Hàm submit chính (chỉnh sửa: Chỉ crop/upload nếu hasNewCrop = true, giữ ảnh cũ nếu chỉnh sửa mà không thay đổi ảnh)
    const onSubmit = async () => {
        setUploadError('');
        setIsSubmitting(true);
        let imageUrl = editingBanner?.image ?? ''; // Mặc định giữ URL ảnh cũ nếu đang edit

        // Kiểm tra bắt buộc ảnh cho banner mới
        if (!previewImage && !editingBanner) {
            setUploadError('Vui lòng chọn và crop ảnh');
            setIsSubmitting(false);
            return;
        }

        // Chỉ crop và upload nếu có crop mới (fix bug: Không crop nếu giữ ảnh cũ)
        if (hasNewCrop) {
            const croppedBlob = await createCroppedImage();
            if (!croppedBlob) {
                setUploadError('Lỗi khi tạo ảnh cropped');
                setIsSubmitting(false);
                return;
            }

            try {
                const uploadResult = await uploadImageAsync(croppedBlob);
                imageUrl = uploadResult.data; // Cập nhật URL mới nếu upload thành công
            } catch (err) {
                setUploadError('Upload ảnh thất bại: ' + (err as Error).message);
                setIsSubmitting(false);
                return;
            }
        } // Nếu không có crop mới (edit mà giữ ảnh cũ), giữ nguyên imageUrl cũ

        setValue('image', imageUrl); // Set giá trị image vào form để validate
        await handleFinalSubmit(); // Trigger submit form
        setIsSubmitting(false);
    };

    const resetForm = () => {
        reset({
            id: undefined,
            description: '',
            image: '',
            toUrl: '',
            emoji: '',
            active: true,
            isIntro: false,
            displayOrder: 0
        });
        setEditingBanner(null);
        setShowModal(false);
        setImageSrc('');
        setUploadError('');
        setPreviewImage(''); // Reset preview (mới thêm)
        setHasNewCrop(false); // Reset flag crop mới (mới thêm)
        setCroppedAreaPixels(null); // Reset crop pixels (mới thêm)
        setShowCropModal(false); // Đóng modal crop nếu mở (mới thêm)
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        reset({
            id: banner.id,
            description: banner.description,
            image: banner.image,
            toUrl: banner.toUrl,
            emoji: banner.emoji,
            active: banner.active,
            isIntro: banner.isIntro,
            displayOrder: banner.displayOrder
        });
        // Xóa setCroppedImage(banner.image); vì giờ dùng useEffect để load preview
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setBannerToDelete(id); // Lưu ID banner cần xóa
        setShowDeleteModal(true); // Hiển thị modal xác nhận
    };

    const confirmDelete = () => {
        if (bannerToDelete) {
            setIsToggling(true);
            deleteBanner.mutate(bannerToDelete, {
                onSuccess: () => {
                    setSortedBanners((prev) => {
                        const newBanners = prev.filter((banner) => banner.id !== bannerToDelete);
                        const activeBanners = newBanners.filter((banner) => banner.active);
                        activeBanners.forEach((banner, index) => {
                            banner.displayOrder = index + 1;
                        });
                        newBanners.forEach((banner) => {
                            if (!banner.active) {
                                banner.displayOrder = 0;
                            }
                        });
                        const orders = activeBanners.map((banner) => ({
                            id: banner.id,
                            displayOrder: banner.displayOrder
                        }));
                        debouncedReorder(orders);
                        return newBanners;
                    });
                    setShowDeleteModal(false);
                    setBannerToDelete(null);
                },
                onError: () => {
                    setIsToggling(false);
                    setShowDeleteModal(false);
                    setBannerToDelete(null);
                }
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBannerToDelete(null);
    };

    // Tạo debouncedReorder
    const debouncedReorder = debounce((orders: { id: number; displayOrder: number }[]) => {
        reorderBanners.mutate(orders, {
            onSuccess: () => {
                setIsToggling(false);
            },
            onError: () => {
                setIsToggling(false);
            }
        });
    }, 500);

    
    const toggleActive = (id: number) => {
        setIsToggling(true);
        toggleBannerActive.mutate(id, {
            onSuccess: (response: ApiResponse<Banner>) => {
                const updatedBanner = response.data;
                setSortedBanners((prev) => {
                    // Cập nhật trạng thái active của banner
                    const newBanners = prev.map((banner) =>
                        banner.id === id ? { ...banner, active: updatedBanner.active } : banner
                    );
                    // Lọc các banner active
                    const activeBanners = newBanners.filter((banner) => banner.active);
                    // Cập nhật displayOrder cho các banner active (1, 2, 3, ...)
                    activeBanners.forEach((banner, index) => {
                        banner.displayOrder = index + 1;
                    });
                    // Gán displayOrder = 0 cho các banner inactive
                    newBanners.forEach((banner) => {
                        if (!banner.active) {
                            banner.displayOrder = 0;
                        }
                    });
                    // Gửi API /reorder qua debouncedReorder
                    const orders = activeBanners.map((banner) => ({
                        id: banner.id,
                        displayOrder: banner.displayOrder
                    }));
                    debouncedReorder(orders);
                    return newBanners;
                });
            },
            onError: () => {
                setIsToggling(false);
            }
        });
    };

    const handleMakeIntro = (id: number) => {
        makeIntroBanner.mutate(id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setSortedBanners((prev) => {
                const oldIndex = prev.findIndex((banner) => banner.id === active.id);
                const newIndex = prev.findIndex((banner) => banner.id === over?.id);
                const newBanners = [...prev];
                const [movedBanner] = newBanners.splice(oldIndex, 1);
                newBanners.splice(newIndex, 0, movedBanner);
                // Cập nhật displayOrder
                return newBanners.map((banner, index) => ({
                    ...banner,
                    displayOrder: index + 1
                }));
            });
            setIsOrderChanged(true);
        }
    };

    const handleSaveOrder = () => {
        const orders = sortedBanners
            .filter((banner) => banner.active)
            .map((banner) => ({
                id: banner.id,
                displayOrder: banner.displayOrder
            }));
        reorderBanners.mutate(orders, {
            onSuccess: () => {
                setIsOrderChanged(false);
            }
        });
    };

    const handleCancelOrder = () => {
        setSortedBanners(banners || []);
        setIsOrderChanged(false);
    };

    if (isLoading) {
        return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
            <RefreshCw size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
            </div>
        </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 min-h-screen">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-gray-500 mb-4">{error.message}</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['banners'] })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                    <RefreshCw size={18} />
                    Thử lại
                </button>
            </div>
        );
    }

    const activeBanners = sortedBanners.filter((banner) => banner.active);
    const inactiveBanners = sortedBanners.filter((banner) => !banner.active);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Banner</h1>
                        <p className="text-gray-600 mt-1">Quản lý banner hiển thị trên trang chủ</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSaveOrder}
                            disabled={!isOrderChanged}
                            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                                isOrderChanged ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                            }`}
                        >
                            Lưu thứ tự
                        </button>
                        <button
                            onClick={handleCancelOrder}
                            disabled={!isOrderChanged}
                            className={`px-4 py-2 text-gray-700 rounded-lg flex items-center gap-2 ${
                                isOrderChanged ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        >
                            Hủy thay đổi
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Thêm Banner
                        </button>
                    </div>
                </div>

                {/* Banner List */}
                <div className="p-6">
                    {/* Active Banners */}
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner đang hoạt động</h2>
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={activeBanners.map((banner) => banner.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid gap-4">
                                {activeBanners.map((banner) => (
                                    <SortableBanner
                                        key={banner.id}
                                        banner={banner}
                                        onToggleActive={toggleActive}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onMakeIntro={handleMakeIntro}
                                        isToggling={isToggling}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Inactive Banners */}
                    <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Banner không hoạt động</h2>
                    <div className="grid gap-4">
                        {inactiveBanners.map((banner) => (
                            <div key={banner.id} className="bg-gray-50 rounded-lg p-4 border opacity-60">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={banner.image}
                                            alt={banner.description}
                                            className="w-32 h-20 object-cover rounded-lg border"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{banner.description}</h3>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Tạm dừng
                                            </span>
                                            {banner.isIntro && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Intro
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Liên kết: {banner.toUrl}</p>
                                        <p className="text-sm text-gray-500 mb-1">Emoji: {banner.emoji}</p>
                                        <p className="text-sm text-gray-500">ID: {banner.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="introBanner"
                                            checked={banner.isIntro}
                                            onChange={() => handleMakeIntro(banner.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <button
                                            onClick={() => toggleActive(banner.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                        >
                                            <EyeOff size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!isLoading && banners?.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Upload size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có banner nào</h3>
                            <p className="text-gray-500">Thêm banner đầu tiên để hiển thị trên trang chủ</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal thêm/sửa */}
            {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
                        </h2>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6">
                        <form className={isSubmitting ? 'pointer-events-none opacity-50' : ''}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                                    <input
                                        type="text"
                                        {...register('description')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Nhập mô tả banner"
                                    />
                                    {errors.description && (
                                        <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    {previewImage && (
                                        <div className="mt-2">
                                            <img src={previewImage} alt="Preview" className="w-64 h-16 object-cover rounded" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(''); // Xóa preview
                                                    setHasNewCrop(false); // Reset flag
                                                    setImageSrc('');
                                                    setCroppedAreaPixels(null);
                                                }}
                                                className="mt-2 text-sm text-red-600"
                                            >
                                                Đổi ảnh
                                            </button>
                                        </div>
                                    )}
                                    {errors.image && (
                                        <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>
                                    )}
                                    {uploadError && (
                                        <p className="text-red-600 text-sm mt-1">{uploadError}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Liên kết</label>
                                    <input
                                        type="text"
                                        {...register('toUrl')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="https://example.com hoặc /duong-dan-noi-bo"
                                    />
                                    {errors.toUrl && (
                                        <p className="text-red-600 text-sm mt-1">{errors.toUrl.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                                    <input
                                        type="text"
                                        {...register('emoji')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Nhập emoji (ví dụ: 🎉)"
                                    />
                                    {errors.emoji && (
                                        <p className="text-red-600 text-sm mt-1">{errors.emoji.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 rounded-lg text-white ${
                                        isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                                ></path>
                                            </svg>
                                            Đang lưu...
                                        </div>
                                    ) : editingBanner ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
        {/* Modal crop */}
            {showCropModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Cắt ảnh (tỉ lệ 4:1)</h2>
                            <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="relative w-full h-64 mb-4">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCropModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCropConfirm}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        {/* Modal xác nhận xóa */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
                            <button onClick={cancelDelete} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa banner này? Hành động này sẽ cập nhật thứ tự các banner còn lại.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerSliderManagement;