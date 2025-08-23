import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Play } from 'lucide-react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { ImageFile, VideoFile } from '@/types/product';

interface MediaUploadProps {
    productImages: ImageFile[];
    setProductImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
    productVideo: VideoFile | null;
    setProductVideo: React.Dispatch<React.SetStateAction<VideoFile | null>>;
    thumbnailImage: ImageFile | null;
    setThumbnailImage: React.Dispatch<React.SetStateAction<ImageFile | null>>;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
                                                     productImages,
                                                     setProductImages,
                                                     productVideo,
                                                     setProductVideo,
                                                     thumbnailImage,
                                                     setThumbnailImage
                                                 }) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [selectedImageType, setSelectedImageType] = useState<'thumbnail' | 'product'>('product');
    const [zoomLevel, setZoomLevel] = useState(100);
    const [, setRotation] = useState(0);
    const [videoError, setVideoError] = useState<string | null>(null);

    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);

    useEffect(() => {
        if (showImageModal && imageRef.current && selectedImageIndex !== null) {
            cropperRef.current = new Cropper(imageRef.current, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 0.8,
                responsive: true,
                zoomable: true,
                rotatable: true,
            });

            return () => {
                if (cropperRef.current) {
                    cropperRef.current.destroy();
                    cropperRef.current = null;
                }
            };
        }
    }, [showImageModal, selectedImageIndex]);

    const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const newThumbnail: ImageFile = {
            id: null,
            file,
            url: URL.createObjectURL(file),
        };
        setThumbnailImage(newThumbnail);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        const newImages = Array.from(files)
            .slice(0, 9 - productImages.length)
            .map((file) => ({
                id: null,
                file,
                url: URL.createObjectURL(file),
            }));
        setProductImages((prev) => [...prev, ...newImages]);
    };

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            const duration = video.duration;
            if (duration < 10 || duration > 60) {
                setVideoError('Video phải có độ dài từ 10 đến 60 giây.');
                return;
            }
            const newVideo: VideoFile = {
                id: null,
                file,
                url: URL.createObjectURL(file),
            };
            setProductVideo(newVideo);
            setVideoError(null);
        };
        video.src = URL.createObjectURL(file);
    };

    const removeImage = (index: number) => {
        setProductImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeThumbnail = () => {
        if (thumbnailImage?.url.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnailImage.url);
        }
        setThumbnailImage(null);
    };

    const removeVideo = () => {
        setProductVideo(null);
        setVideoError(null);
    };

    const handleCrop = (aspectRatio: number) => {
        if (cropperRef.current) {
            cropperRef.current.setAspectRatio(aspectRatio);
        }
    };

    const handleZoom = (delta: number) => {
        if (cropperRef.current) {
            const newZoom = Math.min(Math.max(zoomLevel + delta, 10), 200);
            setZoomLevel(newZoom);
            cropperRef.current.zoomTo(newZoom / 100);
        }
    };

    const handleRotate = (degrees: number) => {
        if (cropperRef.current) {
            setRotation((prev) => prev + degrees);
            cropperRef.current.rotate(degrees);
        }
    };

    const handleApplyChanges = () => {
        if (cropperRef.current && selectedImageIndex !== null) {
            const canvas = cropperRef.current.getCroppedCanvas();
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const url = URL.createObjectURL(file);

                    if (selectedImageType === 'thumbnail') {
                        setThumbnailImage({ id: null, file, url });
                    } else {
                        setProductImages((prev) => {
                            const newImages = [...prev];
                            newImages[selectedImageIndex] = { id: null, file, url };
                            return newImages;
                        });
                    }
                }
                setShowImageModal(false);
                setZoomLevel(100);
                setRotation(0);
            }, 'image/jpeg');
        }
    };

    const openImageEditor = (index: number, type: 'thumbnail' | 'product') => {
        setSelectedImageIndex(index);
        setSelectedImageType(type);
        setShowImageModal(true);
    };

    const getCurrentEditingImage = () => {
        if (selectedImageType === 'thumbnail' && thumbnailImage) {
            return thumbnailImage;
        }
        if (selectedImageType === 'product' && selectedImageIndex !== null) {
            return productImages[selectedImageIndex];
        }
        return null;
    };

    return (
        <>
            {/* Thumbnail Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Ảnh bìa sản phẩm</h2>
                        <p className="text-sm text-gray-500">Ảnh đại diện chính của sản phẩm • Tỷ lệ 1:1</p>
                    </div>
                    <span className="ml-auto text-red-500 text-sm font-medium">Bắt buộc</span>
                </div>
                <div className="flex gap-2">
                    {thumbnailImage ? (
                        <div
                            className="group relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-colors cursor-pointer"
                            onClick={() => {
                                if (thumbnailImage.file) {
                                    openImageEditor(0, 'thumbnail');
                                }
                            }}
                        >
                            <img src={thumbnailImage.url} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeThumbnail();
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                            >
                                <X size={10} />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-white bg-opacity-90 text-xs px-1 py-0.5 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                Ảnh bìa
                            </div>
                        </div>
                    ) : (
                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                                <Upload size={14} className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Thêm ảnh bìa</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailUpload}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Product Images Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Hình ảnh sản phẩm</h2>
                        <p className="text-sm text-gray-500">Hình ảnh tỷ lệ 1:1 hoặc 3:4 • Tối thiểu 3 ảnh • Tối đa 9 ảnh</p>
                    </div>
                    <span className="ml-auto text-red-500 text-sm font-medium">Bắt buộc</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {productImages.map((image, index) => (
                        <div
                            key={index}
                            className="group relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-colors cursor-pointer"
                            onClick={() => {
                                if (image.file) {
                                    openImageEditor(index, 'product');
                                }
                            }}
                        >
                            <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                            >
                                <X size={10} />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-white bg-opacity-90 text-xs px-1 py-0.5 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                Ảnh {index + 1}
                            </div>
                        </div>
                    ))}
                    {productImages.length < 9 && (
                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                                <Upload size={14} className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Thêm ảnh ({productImages.length}/9)</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    )}
                </div>
            </div>

            {/* Video Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Video sản phẩm</h2>
                        <p className="text-sm text-gray-500">Video giới thiệu sản phẩm của bạn</p>
                    </div>
                    <span className="ml-auto text-gray-500 text-sm font-medium">Tùy chọn</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {productVideo ? (
                        <div className="group relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-colors cursor-pointer">
                            <video src={productVideo.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeVideo();
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                            >
                                <X size={10} />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-white bg-opacity-90 text-xs px-1 py-0.5 rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                Video
                            </div>
                        </div>
                    ) : (
                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                                <Play size={14} className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Thêm video (0/1)</span>
                            <input
                                type="file"
                                accept="video/mp4"
                                className="hidden"
                                onChange={handleVideoUpload}
                            />
                        </label>
                    )}
                </div>
                {videoError && (
                    <div className="mt-2 text-sm text-red-500">{videoError}</div>
                )}
                <div className="mt-4 text-sm text-gray-600">
                    <ul className="list-disc pl-5">
                        <li>Kích thước tối đa 30Mb, độ phân giải không vượt quá 1280x1280px</li>
                        <li>Độ dài: 10s-60s</li>
                        <li>Định dạng: MP4</li>
                        <li>Lưu ý: Sản phẩm sẽ được ẩn trong thời gian video đang được xử lý. Video sẽ tự động hiển thị sau khi đã xử lý thành công.</li>
                    </ul>
                </div>
            </div>

            {/* Image Editing Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-800">
                                Chỉnh sửa {selectedImageType === 'thumbnail' ? 'ảnh bìa' : 'hình ảnh sản phẩm'}
                            </h2>
                            <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex h-[calc(90vh-140px)]">
                            <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                                {getCurrentEditingImage() && (
                                    <img
                                        ref={imageRef}
                                        src={getCurrentEditingImage()!.url}
                                        alt="Edit Image"
                                        className="max-w-full max-h-full object-contain"
                                        style={{ maxWidth: '600px', maxHeight: '400px' }}
                                    />
                                )}
                            </div>
                            <div className="w-80 border-l border-gray-200 bg-white">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-sm font-medium text-gray-700">Xem trước</span>
                                    </div>
                                    <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden">
                                        {getCurrentEditingImage() && (
                                            <img
                                                src={getCurrentEditingImage()!.url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Cắt ảnh</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleCrop(1)}
                                                className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                            >
                                                1:1
                                            </button>
                                            <button
                                                onClick={() => handleCrop(3 / 4)}
                                                className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                            >
                                                3:4
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Thu phóng</h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleZoom(-10)}
                                                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            </button>
                                            <input
                                                type="range"
                                                min="10"
                                                max="200"
                                                value={zoomLevel}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    setZoomLevel(value);
                                                    if (cropperRef.current) {
                                                        cropperRef.current.zoomTo(value / 100);
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <button
                                                onClick={() => handleZoom(10)}
                                                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 text-center mt-1">{zoomLevel}%</div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Xoay</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRotate(-90)}
                                                className="flex-1 p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 0l4-4m-4 4L8 3m11.364 5.636l-2.828 2.828m0 0l2.828 2.828m-2.828-2.828l-2.829-2.828m0 5.657l2.829 2.828M12 23v-6m0 0l-4 4m4-4l4 4M2.636 17.364l2.828-2.828m0 0l-2.828-2.829m2.828 2.829l2.829 2.828m0-5.657l-2.829-2.828" />
                                                </svg>
                                                Trái 90°
                                            </button>
                                            <button
                                                onClick={() => handleRotate(90)}
                                                className="flex-1 p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 0l4-4m-4 4L8 3m11.364 5.636l-2.828 2.828m0 0l2.828 2.828m-2.828-2.828l-2.829-2.828m0 5.657l2.829 2.828M12 23v-6m0 0l-4 4m4-4l4 4M2.636 17.364l2.828-2.828m0 0l-2.828-2.829m2.828 2.829l2.829 2.828m0-5.657l-2.829-2.828" />
                                                </svg>
                                                Phải 90°
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block w-full p-2 text-sm text-center border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                                            <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Thay ảnh
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        if (selectedImageType === 'thumbnail') {
                                                            setThumbnailImage({ id: null, file, url });
                                                        } else if (selectedImageIndex !== null) {
                                                            setProductImages((prev) => {
                                                                const newImages = [...prev];
                                                                newImages[selectedImageIndex] = { id: null, file, url };
                                                                return newImages;
                                                            });
                                                        }
                                                        setShowImageModal(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setZoomLevel(100);
                                    setRotation(0);
                                    if (cropperRef.current) {
                                        cropperRef.current.reset();
                                    }
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleApplyChanges}
                                    className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    disabled={!getCurrentEditingImage()?.file}
                                >
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MediaUpload;