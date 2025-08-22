import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, AlertCircle, Tag } from 'lucide-react';
import { Attribute } from '@/types/api';

interface AttributeSuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (selectedData: {
        selections: {
            [key: string]: { attribute: { name: string; typesValue: 'STRING' | 'NUMBER' | 'ALL' }; values: string[] };
        };
    }) => void;
    productName?: string;
    itemTypeId?: number;
    suggestions?: Attribute[];
}

const AttributeSuggestionModal: React.FC<AttributeSuggestionModalProps> = ({
                                                                               isOpen,
                                                                               onClose,
                                                                               onApply,
                                                                               productName = 'Sản phẩm',
                                                                               itemTypeId = 1,
                                                                               suggestions = [],
                                                                           }) => {
    const [suggestionData, setSuggestionData] = useState<{ attributes: Attribute[] }>({ attributes: [] });
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [finalSelections, setFinalSelections] = useState<{
        [key: string]: { attribute: { name: string; typesValue: 'STRING' | 'NUMBER' | 'ALL' }; values: string[] };
    }>({});
    const [step, setStep] = useState<'attribute' | 'values'>('attribute');

    useEffect(() => {
        if (isOpen) {
            const mappedAttributes = suggestions.map((attr) => ({
                name: attr.name,
                typesValue: attr.typesValue || 'STRING',
                values: attr.values
                    .filter((value) => value != null)
                    .map((value) => String(value)),
                confidence: attr.confidence,
                reasoning: attr.reasoning,
                source: attr.source,
            }));
            setSuggestionData({ attributes: mappedAttributes });
        }
    }, [isOpen, suggestions]);

    if (!isOpen) return null;

    const handleAttributeSelect = (attribute: Attribute) => {
        setSelectedAttribute(attribute);
        setSelectedValues([]);
        setStep('values');
    };

    const handleValueToggle = (value: string) => {
        setSelectedValues((prev) => {
            const isSelected = prev.includes(value);
            if (isSelected) {
                return prev.filter((v) => v !== value);
            } else {
                return [...prev, value];
            }
        });
    };

    const handleConfirmSelection = () => {
        if (selectedAttribute && selectedValues.length > 0) {
            setFinalSelections((prev) => ({
                ...prev,
                [selectedAttribute.name]: {
                    attribute: {
                        name: selectedAttribute.name,
                        typesValue: selectedAttribute.typesValue || 'STRING',
                    },
                    values: selectedValues,
                },
            }));
            setSelectedAttribute(null);
            setSelectedValues([]);
            setStep('attribute');
        }
    };

    const handleRemoveSelection = (attributeName: string) => {
        setFinalSelections((prev) => {
            const newSelections = { ...prev };
            delete newSelections[attributeName];
            return newSelections;
        });
    };

    const handleBackToAttributes = () => {
        setSelectedAttribute(null);
        setSelectedValues([]);
        setStep('attribute');
    };

    const handleApply = () => {
        onApply({ selections: finalSelections });
        onClose();
    };

    const getTotalSelectedCount = () => {
        return Object.values(finalSelections).reduce((sum, selection) => sum + selection.values.length, 0);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <Tag className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Gợi ý thuộc tính
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">{productName}</span> • ID: {itemTypeId}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                                step === 'attribute' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                    step === 'attribute' ? 'bg-indigo-500 text-white' : 'bg-gray-400 text-white'
                                }`}
                            >
                                1
                            </span>
                            <span>Chọn thuộc tính</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <div
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                                step === 'values' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                    step === 'values' ? 'bg-indigo-500 text-white' : 'bg-gray-400 text-white'
                                }`}
                            >
                                2
                            </span>
                            <span>Chọn giá trị</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 max-h-96 overflow-y-auto">
                    {suggestionData.attributes.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Không có thuộc tính nào được gợi ý</p>
                        </div>
                    ) : step === 'attribute' ? (
                        <div className="space-y-6">
                            {Object.keys(finalSelections).length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Đã chọn</h3>
                                    <div className="space-y-3">
                                        {Object.entries(finalSelections).map(([attributeName, selection]) => (
                                            <div
                                                key={attributeName}
                                                className="bg-green-50 border border-green-200 rounded-xl p-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Tag className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-green-900">{selection.attribute.name}</h4>
                                                            <p className="text-sm text-green-700">
                                                                {selection.values.length} giá trị: {selection.values.join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSelection(attributeName)}
                                                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4 text-green-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn thuộc tính</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {suggestionData.attributes
                                        .filter((attr) => !finalSelections[attr.name])
                                        .map((attribute) => (
                                            <button
                                                key={attribute.name}
                                                onClick={() => handleAttributeSelect(attribute)}
                                                className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-left group hover:shadow-md"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-100 group-hover:bg-indigo-100 rounded-lg transition-colors">
                                                        <Tag className="h-4 w-4 text-gray-600 group-hover:text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{attribute.name}</h4>
                                                        <p className="text-sm text-gray-500">{attribute.values.length} giá trị</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        selectedAttribute && (
                            <div className="space-y-6">
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <Tag className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-indigo-900">{selectedAttribute.name}</h3>
                                                <p className="text-sm text-indigo-700">Chọn các giá trị phù hợp</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleBackToAttributes}
                                            className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Chọn giá trị ({selectedValues.length} đã chọn)
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {selectedAttribute.values.map((value) => {
                                            const isSelected = selectedValues.includes(value);
                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleValueToggle(value)}
                                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                                                        isSelected
                                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg transform scale-105'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {isSelected && <Check className="h-4 w-4" />}
                                                        <span>{value}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedValues.length > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-green-900">
                                                    Đã chọn {selectedValues.length} giá trị
                                                </p>
                                                <p className="text-sm text-green-700">
                                                    {selectedValues.join(', ')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleConfirmSelection}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                            >
                                                Xác nhận
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{getTotalSelectedCount()}</span> giá trị từ{' '}
                            <span className="font-medium">{Object.keys(finalSelections).length}</span> thuộc tính
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={Object.keys(finalSelections).length === 0}
                                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    Object.keys(finalSelections).length > 0
                                        ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Áp dụng ({getTotalSelectedCount()})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttributeSuggestionModal;