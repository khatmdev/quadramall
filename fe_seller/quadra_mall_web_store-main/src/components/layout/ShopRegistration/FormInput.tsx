import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    maxLength?: number;
    icon?: React.ReactNode;
    disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
                                                 label,
                                                 name,
                                                 type = 'text',
                                                 value,
                                                 onChange,
                                                 placeholder,
                                                 required,
                                                 error,
                                                 maxLength,
                                                 icon,
                                                 disabled
                                             }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {required && <span className="text-red-500 mr-1">*</span>}
                {label}
                {maxLength && (
                    <span className="text-gray-400 ml-2 text-xs">
                        {value.length}/{maxLength}
                    </span>
                )}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} ${
                        type === 'password' ? 'pr-12' : ''
                    } border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default FormInput;