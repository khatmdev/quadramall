import React, { useEffect, useState } from 'react';
import { Plus, X, Upload, Info } from 'lucide-react';

interface AttributeValue {
    attributeName: string;
    value: string;
}

interface Attribute {
    id: number;
    name: string;
    typesValue: 'STRING' | 'NUMBER' | 'ALL';
    values: AttributeValue[];
}

interface ProductVariant {
    id: number;
    combination: AttributeValue[];
    price: number;
    stock: number;
    sku: string;
    image: { file: File | null; url: string } | null;
    altText: string;
    isActive: boolean;
    isSelected: boolean;
}

interface DefaultValues {
    price: number;
    stock: number;
}

interface AttributesSectionProps {
    attributes: Attribute[];
    setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
    productVariants: ProductVariant[];
    setProductVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
    defaultValues: DefaultValues;
    setDefaultValues: React.Dispatch<React.SetStateAction<DefaultValues>>;
    isEditing?: boolean;
}

const TypesValueOptions = ['STRING', 'NUMBER', 'ALL'] as const;
type TypesValue = (typeof TypesValueOptions)[number];

const AttributesSection: React.FC<AttributesSectionProps> = ({
                                                                 attributes,
                                                                 setAttributes,
                                                                 productVariants,
                                                                 setProductVariants,
                                                                 defaultValues,
                                                                 setDefaultValues,
                                                                 isEditing = false,
                                                             }) => {
    const [valueErrors, setValueErrors] = useState<{ [key: string]: string }>({});
    const [variantErrors, setVariantErrors] = useState<{ [key: number]: { price?: string; stock?: string } }>({});
    const [batchPrice, setBatchPrice] = useState(0);
    const [batchStock, setBatchStock] = useState(0);

    const validateValue = (value: string, typesValue: TypesValue): string => {
        if (!value.trim()) return 'Giá trị không được để trống';
        if (typesValue === 'STRING') {
            if (/^\d+$/.test(value) || /^[\d.]+$/.test(value)) {
                return 'Giá trị phải là chuỗi ký tự, không phải số';
            }
        } else if (typesValue === 'NUMBER') {
            if (isNaN(Number(value)) || value.trim() === '') {
                return 'Giá trị phải là một số hợp lệ';
            }
        }
        return '';
    };

    const validateVariant = (variant: ProductVariant): { price?: string; stock?: string } => {
        const errors: { price?: string; stock?: string } = {};
        if (variant.isSelected) {
            if (variant.price < 0) {
                errors.price = 'Giá phải lớn hơn hoặc bằng 0';
            }
            if (variant.stock < 0) {
                errors.stock = 'Số lượng tồn kho phải lớn hơn hoặc bằng 0';
            }
        }
        return errors;
    };

    useEffect(() => {
        const newErrors: { [key: string]: string } = {};
        attributes.forEach((attribute) => {
            attribute.values.forEach((value, valueIndex) => {
                const error = validateValue(value.value, attribute.typesValue);
                if (error) newErrors[`${attribute.id}-${valueIndex}`] = error;
            });
        });
        setValueErrors(newErrors);
    }, [attributes]);

    useEffect(() => {
        const newVariantErrors: { [key: number]: { price?: string; stock?: string } } = {};
        productVariants.forEach((variant) => {
            const errors = validateVariant(variant);
            if (Object.keys(errors).length > 0) {
                newVariantErrors[variant.id] = errors;
            }
        });
        setVariantErrors(newVariantErrors);
    }, [productVariants]);

    useEffect(() => {
        if (attributes.length === 0) {
            setProductVariants([]);
            return;
        }

        const generateVariants = (): AttributeValue[][] => {
            const validAttributes = attributes.filter((attr) =>
                attr.values.some((value) => value.value.trim() !== '')
            );
            if (validAttributes.length === 0) return [];

            const combinations: AttributeValue[][] = [];

            const generateCombinations = (index: number, current: AttributeValue[]) => {
                if (index === validAttributes.length) {
                    combinations.push([...current]);
                    return;
                }

                validAttributes[index].values.forEach((value) => {
                    if (value.value.trim() !== '') {
                        generateCombinations(index + 1, [
                            ...current,
                            { attributeName: validAttributes[index].name, value: value.value },
                        ]);
                    }
                });
            };

            generateCombinations(0, []);
            return combinations;
        };

        const generatedCombinations = generateVariants();

        setProductVariants((prevVariants) => {
            const maxId = prevVariants.reduce((max, variant) => Math.max(max, variant.id), 0);
            let nextId = maxId + 1;

            const existingCombinations = new Set(
                prevVariants.map((v) => JSON.stringify(v.combination))
            );
            const newVariants: ProductVariant[] = [...prevVariants];

            generatedCombinations.forEach((combination) => {
                const comboString = JSON.stringify(combination);
                if (!existingCombinations.has(comboString)) {
                    const isComplete = combination.every((combo) => combo.value.trim() !== '');
                    if (isComplete) {
                        // Kiểm tra xem tổ hợp có trùng với biến thể hiện có
                        const existingVariant = prevVariants.find((variant) => {
                            if (variant.combination.length !== combination.length) return false;
                            return combination.every((combo, i) =>
                                variant.combination[i] &&
                                combo.attributeName === variant.combination[i].attributeName &&
                                combo.value === variant.combination[i].value
                            );
                        });

                        if (!existingVariant) {
                            newVariants.push({
                                id: nextId++,
                                combination,
                                price: 0, // Giá trị mặc định, không dùng defaultValues
                                stock: 0, // Giá trị mặc định, không dùng defaultValues
                                sku: '',
                                image: null,
                                altText: '',
                                isActive: true,
                                isSelected: isEditing ? false : true, // Khi edit, variant mới không được chọn mặc định
                            });
                            existingCombinations.add(comboString);
                        }
                    }
                }
            });

            // Loại bỏ biến thể không còn khớp với tổ hợp
            let updatedVariants = newVariants.filter((variant) => {
                const variantComboString = JSON.stringify(variant.combination);
                return generatedCombinations.some(
                    (combo) => JSON.stringify(combo) === variantComboString
                );
            });

            // Nếu đang edit, set isSelected dựa trên việc có dữ liệu hay không
            if (isEditing) {
                updatedVariants = updatedVariants.map((variant) => {
                    const hasData = variant.price > 0 || variant.stock > 0 || variant.sku !== '' || variant.altText !== '' || variant.image !== null;
                    return { ...variant, isSelected: hasData };
                });
            }

            return updatedVariants;
        });
    }, [attributes, isEditing]); // Loại bỏ defaultValues khỏi dependencies

    const addAttribute = () =>
        setAttributes((prev) => [...prev, { id: Date.now(), name: '', typesValue: 'ALL', values: [] }]);

    const updateAttributeName = (id: number, name: string) =>
        setAttributes((prev) =>
            prev.map((attr) =>
                attr.id === id
                    ? {
                        ...attr,
                        name,
                        values: attr.values.map((val) => ({ ...val, attributeName: name })),
                    }
                    : attr
            )
        );

    const updateAttributeTypesValue = (id: number, typesValue: TypesValue) => {
        setAttributes((prev) =>
            prev.map((attr) => (attr.id === id ? { ...attr, typesValue } : attr))
        );
    };

    const addAttributeValue = (attributeId: number) =>
        setAttributes((prev) =>
            prev.map((attr) =>
                attr.id === attributeId
                    ? {
                        ...attr,
                        values: [...attr.values, { attributeName: attr.name, value: '' }],
                    }
                    : attr
            )
        );

    const updateAttributeValue = (attributeId: number, valueIndex: number, value: string) => {
        setAttributes((prev) =>
            prev.map((attr) =>
                attr.id === attributeId
                    ? {
                        ...attr,
                        values: attr.values.map((val, index) =>
                            index === valueIndex ? { ...val, value } : val
                        ),
                    }
                    : attr
            )
        );

        const attribute = attributes.find((attr) => attr.id === attributeId);
        if (attribute) {
            const error = validateValue(value, attribute.typesValue);
            setValueErrors((prev) => ({
                ...prev,
                [`${attributeId}-${valueIndex}`]: error,
            }));
        }
    };

    const removeAttributeValue = (attributeId: number, valueIndex: number) => {
        setAttributes((prev) =>
            prev.map((attr) =>
                attr.id === attributeId
                    ? { ...attr, values: attr.values.filter((_, index) => index !== valueIndex) }
                    : attr
            )
        );
        setValueErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`${attributeId}-${valueIndex}`];
            return newErrors;
        });
    };

    const removeAttribute = (id: number) => {
        setAttributes((prev) => prev.filter((attr) => attr.id !== id));
        setValueErrors((prev) => {
            const newErrors = { ...prev };
            Object.keys(newErrors).forEach((key) => {
                if (key.startsWith(`${id}-`)) delete newErrors[key];
            });
            return newErrors;
        });
    };

    const updateVariant = (
        variantId: number,
        field: 'price' | 'stock' | 'sku' | 'altText' | 'isActive' | 'isSelected',
        value: number | string | boolean
    ) =>
        setProductVariants((prev) =>
            prev.map((variant) => {
                if (variant.id === variantId) {
                    const updatedVariant = { ...variant, [field]: value };
                    const errors = validateVariant(updatedVariant);
                    setVariantErrors((prevErrors) => ({
                        ...prevErrors,
                        [variantId]: errors,
                    }));
                    return updatedVariant;
                }
                return variant;
            })
        );

    const handleVariantImageUpload = (variantId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setProductVariants((prev) =>
            prev.map((variant) =>
                variant.id === variantId ? { ...variant, image: { file, url: URL.createObjectURL(file) } } : variant
            )
        );
    };

    const updateDefaultValues = (field: 'price' | 'stock', value: number) => {
        setDefaultValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const applyBatchPrice = () => {
        setProductVariants((prev) =>
            prev.map((variant) => (variant.isSelected ? { ...variant, price: batchPrice } : variant))
        );
    };

    const applyBatchStock = () => {
        setProductVariants((prev) =>
            prev.map((variant) => (variant.isSelected ? { ...variant, stock: batchStock } : variant))
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Phân loại hàng</h2>
                        <p className="text-sm text-gray-500">Tạo các biến thể cho sản phẩm</p>
                    </div>
                </div>
                <button
                    onClick={addAttribute}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <Plus size={16} />
                    Thêm nhóm phân loại
                </button>
            </div>

            {attributes.length === 0 && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                            <p className="text-sm text-gray-600">Nhập giá và số lượng kho cho sản phẩm</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giá bán <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    value={defaultValues.price}
                                    onChange={(e) => updateDefaultValues('price', parseFloat(e.target.value) || 0)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nhập giá bán"
                                    min="0"
                                    step="1000"
                                />
                                <span className="ml-3 text-sm text-gray-500 font-medium">₫</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kho hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={defaultValues.stock}
                                onChange={(e) => updateDefaultValues('stock', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Nhập số lượng"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Lưu ý</p>
                                <p className="text-sm text-blue-600">
                                    Khi bạn tạo phân loại hàng, phần này sẽ tự động ẩn đi và bạn sẽ cần nhập giá, kho hàng cho từng biến thể riêng biệt.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {attributes.map((attribute, index) => (
                    <div key={attribute.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên phân loại</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Màu sắc, Kích thước..."
                                            value={attribute.name}
                                            onChange={(e) => updateAttributeName(attribute.id, e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                            maxLength={14}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-400">Tối đa 14 ký tự</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${attribute.name.length > 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {attribute.name.length}/14
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Kiểu dữ liệu</label>
                                        <select
                                            value={attribute.typesValue}
                                            onChange={(e) => updateAttributeTypesValue(attribute.id, e.target.value as TypesValue)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        >
                                            {TypesValueOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeAttribute(attribute.id)}
                                className="w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Tùy chọn</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {attribute.values.map((value, valueIndex) => (
                                    <div key={`${attribute.id}-${valueIndex}`} className="flex flex-col p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-medium">{valueIndex + 1}</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={`Tùy chọn ${valueIndex + 1}`}
                                                value={value.value}
                                                onChange={(e) => updateAttributeValue(attribute.id, valueIndex, e.target.value)}
                                                className={`flex-1 px-3 py-2 border ${valueErrors[`${attribute.id}-${valueIndex}`] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                                                maxLength={20}
                                            />
                                            <button
                                                onClick={() => removeAttributeValue(attribute.id, valueIndex)}
                                                className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        {valueErrors[`${attribute.id}-${valueIndex}`] && (
                                            <p className="text-xs text-red-500 mt-1">{valueErrors[`${attribute.id}-${valueIndex}`]}</p>
                                        )}
                                    </div>
                                ))}
                                {attribute.values.length < 20 && (
                                    <button
                                        onClick={() => addAttributeValue(attribute.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                                    >
                                        <Plus size={16} />
                                        Thêm tùy chọn
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {productVariants.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 mt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-8-8v12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Danh sách phân loại hàng</h2>
                            <p className="text-sm text-gray-500">Quản lý giá, kho hàng, hình ảnh và trạng thái cho các biến thể sản phẩm</p>
                        </div>
                        <span className="ml-auto text-red-500 text-sm font-medium">Bắt buộc</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200 rounded-xl">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                                    <div className="flex items-center gap-2">
                                        Chọn
                                        <span className="relative group">
                                            <Info size={16} className="text-gray-400" />
                                            <span className="absolute hidden group-hover:block w-64 -top-2 left-6 bg-gray-800 text-white text-xs rounded-lg p-2">
                                                Tích chọn để lưu biến thể này. Các biến thể không được chọn sẽ không được lưu vào hệ thống.
                                            </span>
                                        </span>
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Phân loại</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Hình ảnh</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Giá <span className="text-red-500">*</span></th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">Kho hàng <span className="text-red-500">*</span></th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    <div className="flex items-center gap-2">
                                        Trạng thái
                                        <span className="relative group">
                                            <Info size={16} className="text-gray-400" />
                                            <span className="absolute hidden group-hover:block w-48 -top-2 left-6 bg-gray-800 text-white text-xs rounded-lg p-2">
                                                Bật để hiển thị biến thể trên cửa hàng. Tắt để ẩn biến thể nhưng vẫn lưu trong hệ thống.
                                            </span>
                                        </span>
                                    </div>
                                </th>
                            </tr>
                            <tr className="bg-gray-100">
                                <td className="px-4 py-4 border-r border-gray-200" colSpan={3}>
                                    <span className="text-sm font-medium text-gray-700">Áp dụng cho tất cả (chỉ các biến thể được chọn)</span>
                                </td>
                                <td className="px-4 py-4 border-r border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                value={batchPrice}
                                                onChange={(e) => setBatchPrice(parseFloat(e.target.value) || 0)}
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                min="0"
                                                step="1000"
                                            />
                                            <span className="ml-2 text-sm text-gray-500">₫</span>
                                        </div>
                                        <button
                                            onClick={applyBatchPrice}
                                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-4 border-r border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={batchStock}
                                            onChange={(e) => setBatchStock(parseInt(e.target.value) || 0)}
                                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            min="0"
                                        />
                                        <button
                                            onClick={applyBatchStock}
                                            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-4"></td>
                            </tr>
                            </thead>
                            <tbody>
                            {productVariants.map((variant) => (
                                <tr key={variant.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 border-r border-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={variant.isSelected}
                                            onChange={(e) => updateVariant(variant.id, 'isSelected', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4 border-r border-gray-200">
                                        <div className="flex flex-col gap-1">
                                            {variant.combination.map((combo, index) => (
                                                <span key={`${variant.id}-${index}`} className="text-sm text-gray-600">
                                                    {combo.attributeName}: {combo.value}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-r border-gray-200">
                                        <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                                            {variant.image ? (
                                                <img src={variant.image.url} alt="Variant" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload size={20} className="text-gray-400" />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleVariantImageUpload(variant.id, e)}
                                            />
                                        </label>
                                    </td>
                                    <td className="px-4 py-4 border-r border-gray-200">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                                                    className={`w-24 px-3 py-2 border ${variantErrors[variant.id]?.price ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                    min="0"
                                                    step="1000"
                                                    disabled={!variant.isSelected}
                                                />
                                                <span className="ml-2 text-sm text-gray-500">₫</span>
                                            </div>
                                            {variantErrors[variant.id]?.price && (
                                                <p className="text-xs text-red-500">{variantErrors[variant.id].price}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 border-r border-gray-200">
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                                className={`w-20 px-3 py-2 border ${variantErrors[variant.id]?.stock ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                                min="0"
                                                disabled={!variant.isSelected}
                                            />
                                            {variantErrors[variant.id]?.stock && (
                                                <p className="text-xs text-red-500">{variantErrors[variant.id].stock}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={variant.isActive}
                                            onChange={(e) => updateVariant(variant.id, 'isActive', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            disabled={!variant.isSelected}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttributesSection;