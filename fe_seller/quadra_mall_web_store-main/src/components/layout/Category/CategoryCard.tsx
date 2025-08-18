import React, { useState } from 'react';
import { FiMoreVertical, FiEdit, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { CategoryDetailData } from '@/types/Category';

interface CategoryCardProps {
    category: CategoryDetailData;
    onClick: () => void;
    onEdit: (categoryId: number, newName: string) => void;
    onDelete: (categoryId: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(category.name);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setShowMenu(false);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(category.id);
        setShowMenu(false);
    };

    const handleSaveEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editName.trim()) {
            onEdit(category.id, editName.trim());
            setIsEditing(false);
        }
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditName(category.name);
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit(e as any);
        } else if (e.key === 'Escape') {
            handleCancelEdit(e as any);
        }
    };

    return (
        <div
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-md relative"
            onClick={!isEditing ? onClick : undefined}
        >
            <div className="relative">
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {category.products.length} Sản phẩm
        </span>

                {/* Menu Button */}
                <div className="absolute top-2 left-2">
                    <button
                        onClick={handleMenuClick}
                        className="p-1 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                    >
                        <FiMoreVertical className="text-gray-600 text-sm" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute top-8 left-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[120px]">
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                            >
                                <FiEdit className="text-blue-500" />
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                            >
                                <FiTrash2 className="text-red-500" />
                                Xóa
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                            <FiCheck className="text-sm" />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                            <FiX className="text-sm" />
                        </button>
                    </div>
                ) : (
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{category.name}</h3>
                )}
            </div>

            {/* Overlay khi đang edit để tránh click vào card */}
            {isEditing && (
                <div
                    className="absolute inset-0 bg-transparent z-5"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
};

export default CategoryCard;