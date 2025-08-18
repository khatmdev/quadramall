import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { CategoryDto } from '@/types/store_detail/interfaces';

interface CategoryWithState extends CategoryDto {
  isExpanded?: boolean;
}

interface SidebarCategoriesProps {
  categories: CategoryDto[];
  selectedCategoryId?: number;
  onSelectCategory: (categoryId: number | null) => void;
}

const SidebarCategories: React.FC<SidebarCategoriesProps> = ({
                                                               categories,
                                                               selectedCategoryId,
                                                               onSelectCategory,
                                                             }) => {
  const initializeCategoryState = (cats: CategoryDto[]): CategoryWithState[] => {
    return cats.map(cat => ({
      ...cat,
      isExpanded: false,
      children: cat.children ? initializeCategoryState(cat.children) : [],
    }));
  };

  const [categoryState, setCategoryState] = useState<CategoryWithState[]>(() =>
    initializeCategoryState(categories)
  );

  const toggleCategory = (id: number) => {
    setCategoryState(prev => {
      const updateExpanded = (cats: CategoryWithState[]): CategoryWithState[] => {
        return cats.map(cat => ({
          ...cat,
          isExpanded: cat.id === id ? !cat.isExpanded : cat.isExpanded,
          children: cat.children ? updateExpanded(cat.children) : [],
        }));
      };
      return updateExpanded(prev);
    });
  };

  const renderCategory = (category: CategoryWithState, level: number = 0) => {
    const isSelected = category.id === selectedCategoryId;
    return (
      <div key={category.id} className={`ml-${level * 3}`}>
        <button
          onClick={() => {
            toggleCategory(category.id);
            onSelectCategory(category.id);
          }}
          className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
            isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <span>{category.name}</span>
          {category.children && category.children.length > 0 && (
            category.isExpanded ? (
              <FiChevronDown size={18} className="text-gray-500" />
            ) : (
              <FiChevronRight size={18} className="text-gray-500" />
            )
          )}
        </button>
        {category.children && category.children.length > 0 && (
          <div
            className={`ml-3 pl-3 border-l border-gray-200 transition-all overflow-hidden ${
              category.isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
            } duration-300 ease-in-out`}
          >
            <div className="py-1 space-y-1">
              {category.children.map(child => renderCategory({ ...child, isExpanded: child.isExpanded }, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <div className="space-y-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
            !selectedCategoryId ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <span>Sản Phẩm</span>
        </button>
        {categoryState.map(category => renderCategory(category))}
      </div>
    </div>
  );
};

export default SidebarCategories;
