import React, { useState, useEffect } from "react";
import ItemTypeTree from "./ItemTypeTree";

interface ItemTypesTreeDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  children: ItemTypesTreeDTO[];
}

interface SidebarFilterProps {
  itemTypes: ItemTypesTreeDTO[];
  provinces: string[];
  onFilterChange: (filterName: string, value: string) => void;
  onApplyPrice: (min: string, max: string) => void;
  initialPriceMin: string;
  initialPriceMax: string;
  selectedItemTypeId: string; // ✅ new
}

const SidebarFilter: React.FC<SidebarFilterProps> = React.memo(
  ({
    itemTypes,
    provinces,
    onFilterChange,
    onApplyPrice,
    initialPriceMin,
    initialPriceMax,
    selectedItemTypeId,
  }) => {
    const [selectedItemType, setSelectedItemType] = useState<ItemTypesTreeDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [localMin, setLocalMin] = useState(initialPriceMin);
    const [localMax, setLocalMax] = useState(initialPriceMax);

    useEffect(() => {
      setLocalMin(initialPriceMin);
      setLocalMax(initialPriceMax);
    }, [initialPriceMin, initialPriceMax]);

    // ✅ Đồng bộ selectedItemType khi URL hoặc itemTypes thay đổi
    useEffect(() => {
      if (selectedItemTypeId && itemTypes.length > 0) {
        const findItem = (items: ItemTypesTreeDTO[], id: number): ItemTypesTreeDTO | null => {
          for (const item of items) {
            if (item.id === id) return item;
            if (item.children?.length) {
              const found = findItem(item.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        const foundItem = findItem(itemTypes, parseInt(selectedItemTypeId));
        setSelectedItemType(foundItem);
      } else {
        setSelectedItemType(null);
      }
    }, [selectedItemTypeId, itemTypes]);

    const handleItemTypeSelect = (item: ItemTypesTreeDTO) => {
      setSelectedItemType(item);
      onFilterChange("itemTypeId", String(item.id));
      setIsModalOpen(false);
    };

    const handleApplyPrice = () => {
      onApplyPrice(localMin, localMax);
    };

    return (
      <div className="w-full md:w-64 bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-2 text-lg text-gray-800">Ngành hàng</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full text-left px-2 py-1 bg-white border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          {selectedItemType?.name || "Chọn ngành hàng"}
        </button>

        {/* Giá */}
        <h3 className="font-bold mt-4 mb-2 text-lg text-gray-800">Giá</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Từ"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-1/2 p-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Đến"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-1/2 p-2 border rounded-lg"
          />
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Áp dụng
        </button>

        {/* Rating */}
        <h3 className="font-bold mt-4 mb-2 text-lg text-gray-800">Rating</h3>
        <select
          className="w-full p-2 border rounded-lg"
          onChange={(e) => onFilterChange("rating", e.target.value)}
        >
          <option value="">Tất cả</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r.toString()}>
              {r} sao trở lên
            </option>
          ))}
        </select>

        {/* Nơi bán */}
        <h3 className="font-bold mt-4 mb-2 text-lg text-gray-800">Nơi bán</h3>
        <select
          className="w-full p-2 border rounded-lg"
          onChange={(e) => onFilterChange("province", e.target.value)}
        >
          <option value="">Tất cả</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Chọn ngành hàng</h2>
              <ItemTypeTree
                itemTypes={itemTypes}
                onSelect={handleItemTypeSelect}
                onClose={() => setIsModalOpen(false)}
              />
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default SidebarFilter;

