import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';  

interface Category {
  id: string;
  name: string;
  hasSubcategories?: boolean;
  isExpanded?: boolean;
}

const SidebarCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Dây tủ doanh mục', hasSubcategories: true, isExpanded: false },
    { id: '2', name: 'Dây tủ doanh mục', hasSubcategories: true, isExpanded: false },
    { id: '3', name: 'Dây tủ doanh mục', hasSubcategories: true, isExpanded: false },
    { id: '4', name: 'Dây tủ doanh mục', hasSubcategories: true, isExpanded: false },
    { id: '5', name: 'Dây tủ doanh mục', hasSubcategories: true, isExpanded: false },
    { id: '6', name: 'Dây tủ doanh mục ...', hasSubcategories: true, isExpanded: false }
  ]);

  const toggleCategory = (id: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    );
  };

  return (
    <div className="w-64 bg-white p-4 rounded-lg shadow-sm">
      <div className="space-y-1">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span>{category.name}</span>
              {category.hasSubcategories && (
                category.isExpanded ? 
                  <FiChevronDown size={16} className="text-gray-400" /> :
                  <FiChevronRight size={16} className="text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarCategories;
