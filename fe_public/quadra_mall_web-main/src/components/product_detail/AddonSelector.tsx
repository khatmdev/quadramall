import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { AddonGroupDTO, AddonDTO } from '@/types/product/product_Detail';

interface AddonSelectorProps {
  variantId: number | null;
  addonGroups: AddonGroupDTO[] | null;
  selectedAddons: number[];
  onToggleAddon: (addonId: number) => void;
}

const AddonSelector: React.FC<AddonSelectorProps> = ({ variantId, addonGroups, selectedAddons, onToggleAddon }) => {
  if (!addonGroups || addonGroups.length === 0) {
    return <p className="text-gray-500 text-sm">Không có topping khả dụng.</p>;
  }

  return (
    <div className="mb-4">
      {addonGroups.map((group) => {
        if (!group || !group.addons || group.addons.length === 0) {
          return null;
        }

        const groupAddons = group.addons.filter((addon): addon is AddonDTO => !!addon);
        const maxChoice = group.maxChoice ?? 1;
        const selectedInGroup = selectedAddons.filter((id) => groupAddons.some((addon) => addon.id === id));
        const selectedCountInGroup = selectedInGroup.length;

        return (
          <div key={group.id} className="mb-4">
            <h3 className="text-sm font-medium">{group.name}:</h3>
            <h4 className="text-sm font-medium">Tối đa có thể chọn {maxChoice} sản phẩm thêm</h4>
            <div className="flex gap-2 flex-wrap mt-2">
              {groupAddons.map((addon) => (
                <Button
                  key={addon.id}
                  variant={selectedAddons.includes(addon.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (selectedAddons.includes(addon.id)) {
                      onToggleAddon(addon.id);
                    } else if (selectedCountInGroup < maxChoice) {
                      onToggleAddon(addon.id);
                    }
                  }}
                  disabled={!selectedAddons.includes(addon.id) && selectedCountInGroup >= maxChoice}
                >
                  {addon.name} (+{addon.priceAdjust?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '0 VND'})
                </Button>
              ))}
            </div>
            {maxChoice > 0 && selectedCountInGroup >= maxChoice && (
              <p className="text-xs text-gray-500 mt-1">Đã đạt tối đa {maxChoice} lựa chọn cho nhóm này</p>
            )}
          </div>
        );
      })}
      {(!addonGroups || addonGroups.every((group) => !group?.addons?.length)) && (
        <p className="text-gray-500 text-sm">Không có topping khả dụng.</p>
      )}
    </div>
  );
};

export default memo(AddonSelector);
