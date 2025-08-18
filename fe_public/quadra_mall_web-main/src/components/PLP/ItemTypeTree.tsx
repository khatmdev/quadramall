import React, { useState } from "react";
import { ChevronRight, ChevronDown, Truck } from "lucide-react";

interface ItemTypesTreeDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  children: ItemTypesTreeDTO[];
}

interface ItemTypeTreeProps {
  itemTypes: ItemTypesTreeDTO[];
  onSelect: (item: ItemTypesTreeDTO) => void;
  onClose: () => void;
}

const ItemTypeTree: React.FC<ItemTypeTreeProps> = ({ itemTypes, onSelect }) => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderTree = (items: ItemTypesTreeDTO[], depth = 0) => {
    return items.map((item) => {
      const isExpanded = expandedIds.includes(item.id);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.id}>
          <div
            className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded transition`}
            style={{ paddingLeft: `${depth * 16}px` }}
            onClick={() => onSelect(item)}
          >
            {/* Toggle icon for children */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(item.id);
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {!hasChildren && <span className="w-4" />} {/* Placeholder for alignment */}

            {/* Icon image or fallback */}
            <div className="w-6 h-6 flex items-center justify-center">
              {item.iconUrl ? (
                <img
                  src={item.iconUrl}
                  alt={item.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    (e.currentTarget.parentNode as HTMLElement).innerHTML =
                      '<svg class="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M9 6h6m-6 8h6" /></svg>';
                  }}
                />
              ) : (
                <Truck size={18} className="text-gray-500" />
              )}
            </div>

            {/* Name */}
            <span className="text-gray-800 font-medium">{item.name}</span>
          </div>

          {/* Render children */}
          {hasChildren && isExpanded && (
            <div>{renderTree(item.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return <div>{renderTree(itemTypes)}</div>;
};

export default ItemTypeTree;
