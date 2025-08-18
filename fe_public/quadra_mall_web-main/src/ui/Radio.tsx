import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
    description?: string;
}

export const Radio: React.FC<RadioProps> = ({ label, description, className = '', ...props }) => {
    return (
        <label className="flex items-start space-x-3 cursor-pointer">
            <input
                type="radio"
                className={`mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 ${className}`}
                {...props}
            />
            <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{label}</div>
                {description && (
                    <div className="text-sm text-gray-500">{description}</div>
                )}
            </div>
        </label>
    );
};