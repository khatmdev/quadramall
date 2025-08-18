import React, { useState, useEffect } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    type: 'success' | 'error' | 'warning' | 'info' | 'input' | 'loading';
    title: string;
    message: string;
    onConfirm: (inputValue?: string) => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    errorMessage?: string;
}

const Modal: React.FC<ModalProps> = ({
                                         open,
                                         onClose,
                                         type,
                                         title,
                                         message,
                                         onConfirm,
                                         onCancel,
                                         confirmText = 'Xác nhận',
                                         cancelText = 'Hủy',
                                         errorMessage,
                                     }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!open) {
            setInputValue('');
        }
    }, [open]);

    if (!open) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success': return 'bg-green-100 border-green-600 text-green-700';
            case 'error': return 'bg-red-100 border-red-600 text-red-700';
            case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'input': return 'bg-gray-100 border-gray-600 text-gray-700';
            case 'loading': return 'bg-blue-100 border-blue-600 text-blue-700';
            default: return 'bg-blue-100 border-blue-600 text-blue-700';
        }
    };

    const getButtonStyles = () => {
        switch (type) {
            case 'success': return 'bg-green-600 hover:bg-green-700';
            case 'error': return 'bg-red-600 hover:bg-red-700';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
            case 'input': return 'bg-gray-600 hover:bg-gray-700';
            case 'loading': return 'bg-blue-600 hover:bg-blue-700';
            default: return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className={`border-l-4 p-4 ${getTypeStyles()}`}>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    {message && <p className="text-gray-600 mb-4">{message}</p>}
                    {type === 'input' && (
                        <>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
                        </>
                    )}
                    {type === 'loading' && (
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {type !== 'loading' && (
                    <div className="flex gap-3 justify-center mt-4">
                        {onCancel && cancelText && (
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                {cancelText}
                            </button>
                        )}
                        {confirmText && (
                            <button
                                onClick={() => onConfirm(type === 'input' ? inputValue : undefined)}
                                className={`px-4 py-2 text-white rounded ${getButtonStyles()}`}
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
