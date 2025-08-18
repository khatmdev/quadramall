import React, { type ReactNode } from 'react';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';
import type { ItemType } from '@/types/itemType';

interface CategoryItemProps {
    category: ItemType;
    depth?: number;
    expandedCategories: number[];
    toggleExpand: (categoryId: number) => void;
    onAddChild: (parentId: number) => void;
    onEdit: (category: ItemType, depth: number) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
                                                       category,
                                                       depth = 0,
                                                       expandedCategories,
                                                       toggleExpand,
                                                       onAddChild,
                                                       onEdit,
                                                   }) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;

    const renderCategory = (cat: ItemType, currentDepth: number): ReactNode => {
        // Debug iconUrl
        if (cat.iconUrl && !cat.parent) {
            console.log(`Rendering image for root category ${cat.name}: ${cat.iconUrl}`);
        }

        return (
            <div key={cat.id} className="mb-2">
                <div
                    className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 ${
                        currentDepth === 0 ? 'bg-green-50 border-green-200' :
                            currentDepth === 1 ? 'bg-blue-50 border-blue-200 ml-6' :
                                'bg-gray-50 border-gray-200 ml-12'
                    }`}
                    onClick={() => hasChildren && toggleExpand(cat.id)}
                >
                    <div className="flex items-center cursor-pointer">
                        {hasChildren && (
                            <span className="mr-2">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
                        )}
                        {cat.iconUrl && !cat.parent ? (
                            <>
                                <img
                                    src={cat.iconUrl}
                                    alt={cat.name}
                                    className="w-6 h-6 mr-2"
                                    onError={(e) => {
                                        console.warn(`Failed to load image for ${cat.name}: ${cat.iconUrl}`);
                                        e.currentTarget.style.display = 'none';
                                        const nextSibling = e.currentTarget.nextElementSibling;
                                        if (nextSibling instanceof HTMLElement) {
                                            nextSibling.style.display = 'block';
                                        }
                                    }}
                                />
                                <Package
                                    size={16}
                                    className="mr-2 text-gray-600 hidden"
                                />
                            </>
                        ) : (
                            <Package
                                size={16}
                                className="mr-2 text-gray-600"
                            />
                        )}
                        <span className="font-medium">{cat.name}</span>
                        <span className="ml-2 text-xs px-2 py-1 bg-gray-200 rounded-full">
              Level {currentDepth + 1}
            </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild(cat.id);
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                            Thêm con
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(cat, currentDepth);
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Sửa
                        </button>
                    </div>
                </div>
                {isExpanded && cat.children && cat.children.map(child => renderCategory(child, currentDepth + 1))}
            </div>
        );
    };

    return renderCategory(category, depth);
};

export default CategoryItem;