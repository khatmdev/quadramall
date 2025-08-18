import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    label: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept?: string;
    required?: boolean;
    error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, file, onFileChange, accept, required, error }) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
            alert('Kích thước file vượt quá 5MB');
            return;
        }
        onFileChange(selectedFile);
    };

    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {required && <span className="text-red-500 mr-1">*</span>}
                {label}
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors duration-200 bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                {file ? (
                    <div>
                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={() => onFileChange(null)}
                            className="mt-2 text-sm text-red-500 hover:text-red-600"
                        >
                            Xóa file
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Kéo thả hoặc chọn file</p>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF (tối đa 5MB)</p>
                    </div>
                )}
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default FileUpload;