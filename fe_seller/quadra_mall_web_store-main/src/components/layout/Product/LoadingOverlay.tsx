import React from 'react';

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
    ERROR = 'ERROR'
}

interface ProgressInfo {
    current: number;
    total: number;
    stage: LoadingStage;
    message: string;
    percentage: number;
    error?: string;
}

const LoadingOverlay: React.FC<{
    isVisible: boolean;
    progress: ProgressInfo;
}> = ({ isVisible, progress }) => {
    const getStageMessage = (stage: LoadingStage) => {
        switch (stage) {
            case LoadingStage.VALIDATING:
                return 'Đang kiểm tra thông tin...';
            case LoadingStage.UPLOADING_THUMBNAIL:
                return 'Đang tải ảnh đại diện...';
            case LoadingStage.UPLOADING_VIDEO:
                return 'Đang tải video sản phẩm...';
            case LoadingStage.UPLOADING_IMAGES:
                return `Đang tải hình ảnh... (${progress.current}/${progress.total})`;
            case LoadingStage.UPLOADING_VARIANT_IMAGES:
                return `Đang tải hình ảnh biến thể... (${progress.current}/${progress.total})`;
            case LoadingStage.UPLOADING_DESCRIPTION_IMAGES:
                return `Đang tải hình ảnh mô tả... (${progress.current}/${progress.total})`;
            case LoadingStage.PROCESSING_DATA:
                return 'Đang xử lý dữ liệu...';
            case LoadingStage.SAVING_PRODUCT:
                return 'Đang lưu sản phẩm...';
            case LoadingStage.COMPLETED:
                return 'Hoàn thành!';
            case LoadingStage.ERROR:
                return 'Đã xảy ra lỗi';
            default:
                return 'Đang xử lý...';
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress.percentage / 100)}`}
                                className="text-blue-500 transition-all duration-500 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">
                                {Math.round(progress.percentage)}%
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {getStageMessage(progress.stage)}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {progress.error || progress.message}
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                    {progress.stage !== LoadingStage.ERROR && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500 flex items-center justify-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Vui lòng không tắt trang web trong quá trình tải lên
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;