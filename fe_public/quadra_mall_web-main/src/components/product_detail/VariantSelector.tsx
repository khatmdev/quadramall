import React, { useState, useEffect, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { AttributeDTO, VariantDTO, VariantAttributeDTO } from '@/types/product/product_Detail';

interface VariantSelectorProps {
  productId: number;
  attributes: AttributeDTO[] | null;
  variants: VariantDTO[] | null;
  variantDetails: VariantAttributeDTO[] | null;
  selectedVariantId: number | null;
  onSelectVariant: (variantId: number | null) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
                                                           attributes,
                                                           variants,
                                                           variantDetails,
                                                           selectedVariantId,
                                                           onSelectVariant,
                                                         }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    console.log('Selected Attributes:', selectedAttributes);
  }, [selectedAttributes]);

  const variantAttributeMap = useMemo(() => {
    const map: { [variantId: number]: { [attrName: string]: string } } = {};
    variantDetails?.forEach((detail) => {
      if (detail) {
        const variantId = detail.variantId;
        const attrName = detail.attributeName;
        const attrValue = detail.attributeValue;
        if (!map[variantId]) {
          map[variantId] = {};
        }
        map[variantId][attrName] = attrValue;
      }
    });
    console.log('Variant Attribute Map:', map);
    return map;
  }, [variantDetails]);

  const availableValues = useMemo(() => {
    const availability: { [attrName: string]: Set<string> } = {};

    attributes?.forEach((attr) => {
      if (attr) availability[attr.name] = new Set();
    });

    if (!variantDetails || !attributes) return availability;

    attributes.forEach((attribute) => {
      const attrName = attribute.name;

      const matchingVariants = Object.entries(variantAttributeMap).filter(([, attrMap]) => {
        return Object.entries(selectedAttributes).every(([key, value]) => {
          if (key === attrName) return true;
          return attrMap[key] === value;
        });
      });

      matchingVariants.forEach(([, attrMap]) => {
        const attrValue = attrMap[attrName];
        if (attrValue) {
          availability[attrName]?.add(attrValue);
        }
      });

      const selectedValue = selectedAttributes[attrName];
      if (selectedValue) {
        availability[attrName]?.add(selectedValue);
      }
    });

    return availability;
  }, [selectedAttributes, variantAttributeMap, attributes]);

  useEffect(() => {
    if (!attributes || !variants || variants.length === 0) return;

    const allAttributesSelected = attributes.every(
      (attr) => attr && (selectedAttributes[attr.name] || !attr.values?.length)
    );

    if (!allAttributesSelected) {
      if (selectedVariantId !== null) {
        onSelectVariant(null);
      }
      return;
    }

    const matchingVariantId = Object.keys(variantAttributeMap).find((variantId) => {
      return attributes.every((attr) => {
        if (!attr) return true;
        const selectedValue = selectedAttributes[attr.name];
        const variantValue = variantAttributeMap[Number(variantId)]?.[attr.name];
        return !selectedValue || (variantValue !== undefined && selectedValue === variantValue);
      });
    });

    if (matchingVariantId) {
      const matchedId = Number(matchingVariantId);
      if (matchedId !== selectedVariantId) {
        onSelectVariant(matchedId);
      }
    } else if (variants.length > 0 && selectedVariantId !== null) {
      onSelectVariant(null);
    }
    console.log('Matching Variant ID:', matchingVariantId);
  }, [selectedAttributes, attributes, variantAttributeMap, selectedVariantId, onSelectVariant, variants]);

  const handleSelectAttribute = (attrName: string, value: string) => {
    setSelectedAttributes((prev) => {
      const newAttrs = { ...prev };
      if (prev[attrName] === value) {
        delete newAttrs[attrName];
      } else {
        newAttrs[attrName] = value;
      }
      return newAttrs;
    });
  };

  if (!attributes || attributes.length === 0) {
    return <p className="text-gray-500 text-sm">Không có biến thể sản phẩm.</p>;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium">Chọn biến thể:</h3>
      {attributes.map((attribute) => (
        <div key={attribute.name} className="mt-2">
          <p className="text-sm font-medium">{attribute.name}:</p>
          <div className="flex gap-2 flex-wrap mt-1">
            {attribute.values?.map((value) => {
              const isSelected = selectedAttributes[attribute.name] === value;
              const isDisabled =
                !isSelected &&
                Object.keys(selectedAttributes).length > 0 &&
                !availableValues[attribute.name]?.has(value);

              return (
                <Button
                  key={`${attribute.name}-${value}`}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectAttribute(attribute.name, value)}
                  disabled={isDisabled}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(VariantSelector);
