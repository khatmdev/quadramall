// components/layout/Coupon/DiscountModal.tsx - FIXED PRODUCT SELECTION VERSION
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store';
import {
  setModalOpen,
  setSelectedDiscount,
  createDiscountCode,
  updateDiscountCode,
  fetchDiscountCodes,
  DiscountCodeDTO,
  ProductDTO
} from '@/store/Discount/discountSlice';
import {
  CreateDiscountCodeRequest,
  UpdateDiscountCodeRequest,
  parseBackendDateTimeToLocal,
  convertLocalToBackendDateTime,
  createDefaultDateTimeValues,
  validateDateTimeRange,
  previewDateTimeFromLocal
} from '@/services/discountService';
import { useToast } from '@/components/ui/toast';
import {
  X,
  ShoppingBag,
  Tag,
  Percent,
  DollarSign,
  Info,
  Calendar,
  Search,
  Check,
  Clock,
  MapPin,
  AlertCircle,
  Package
} from 'lucide-react';

interface DiscountFormData {
  description: string;
  code: string;
  appliesTo: 'SHOP' | 'PRODUCTS';
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountValue: number;
  quantity: number;
  maxUses: number;
  usagePerCustomer: number;
  startDate: string; // datetime-local format: "2024-12-25T14:30"
  endDate: string;   // datetime-local format: "2024-12-25T14:30"
  autoApply: boolean;
  priority: number;
  productIds: number[];
  isActive: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const DiscountModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isModalOpen,
    selectedDiscount,
    products,
    isLoading
  } = useSelector((state: RootState) => state.discounts);

  const { storeId } = useSelector((state: RootState) => state.auth);
  const currentStoreId = storeId || parseInt(localStorage.getItem('selectedStoreId') || '1');
  const toast = useToast();

  const [formData, setFormData] = useState<DiscountFormData>({
    description: '',
    code: '',
    appliesTo: 'SHOP',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountValue: 0,
    quantity: 1,
    maxUses: 1,
    usagePerCustomer: 1,
    startDate: '',
    endDate: '',
    autoApply: false,
    priority: 0,
    productIds: [],
    isActive: true
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Helper function to normalize product IDs
  const normalizeProductIds = (productIds: any): number[] => {
    if (!productIds) return [];
    
    console.log('🔍 Normalizing productIds:', productIds, 'Type:', typeof productIds);
    
    // If it's already an array of numbers
    if (Array.isArray(productIds)) {
      const normalized = productIds.map(id => {
        if (typeof id === 'number') return id;
        if (typeof id === 'string') return parseInt(id, 10);
        if (typeof id === 'object' && id.id) return parseInt(id.id, 10);
        return 0;
      }).filter(id => id > 0);
      
      console.log('✅ Normalized array productIds:', normalized);
      return normalized;
    }
    
    // If it's a string (comma-separated IDs)
    if (typeof productIds === 'string') {
      const normalized = productIds.split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id) && id > 0);
      
      console.log('✅ Normalized string productIds:', normalized);
      return normalized;
    }
    
    console.log('⚠️ Could not normalize productIds, returning empty array');
    return [];
  };

  // Reset form when modal opens/closes or selected discount changes
  useEffect(() => {
    if (selectedDiscount) {
      console.log('🔄 Loading selected discount for edit:', selectedDiscount);
      
      // Convert backend datetime to local format for Vietnam timezone
      const startDateLocal = parseBackendDateTimeToLocal(selectedDiscount.startDate);
      const endDateLocal = parseBackendDateTimeToLocal(selectedDiscount.endDate);

      // Normalize product IDs from backend
      const normalizedProductIds = normalizeProductIds(selectedDiscount.productIds);

      console.log('📦 Product selection details:', {
        appliesTo: selectedDiscount.appliesTo,
        rawProductIds: selectedDiscount.productIds,
        normalizedProductIds,
        productNames: selectedDiscount.productNames
      });

      setFormData({
        description: selectedDiscount.description || '',
        code: selectedDiscount.code,
        appliesTo: selectedDiscount.appliesTo,
        discountType: selectedDiscount.discountType,
        discountValue: selectedDiscount.discountValue,
        minOrderAmount: selectedDiscount.minOrderAmount,
        maxDiscountValue: selectedDiscount.maxDiscountValue || 0,
        quantity: selectedDiscount.quantity,
        maxUses: selectedDiscount.maxUses,
        usagePerCustomer: selectedDiscount.usagePerCustomer,
        startDate: startDateLocal,
        endDate: endDateLocal,
        autoApply: selectedDiscount.autoApply,
        priority: selectedDiscount.priority,
        productIds: normalizedProductIds,
        isActive: selectedDiscount.isActive
      });

      // Show product selection if it's a PRODUCTS discount
      if (selectedDiscount.appliesTo === 'PRODUCTS') {
        setShowProductSelection(true);
        console.log('✅ Enabled product selection for PRODUCTS discount');
      } else {
        setShowProductSelection(false);
      }
    } else {
      // Reset form for new discount with Vietnam timezone defaults
      const defaultDateTime = createDefaultDateTimeValues();
      
      
      setFormData({
        description: '',
        code: '',
        appliesTo: 'SHOP',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountValue: 0,
        quantity: 1,
        maxUses: 1,
        usagePerCustomer: 1,
        startDate: defaultDateTime.startDate,
        endDate: defaultDateTime.endDate,
        autoApply: false,
        priority: 0,
        productIds: [],
        isActive: true
      });
      setShowProductSelection(false);
    }
    
    setErrors({});
    setProductSearchQuery('');
  }, [selectedDiscount, isModalOpen]);


  // Filtered products for selection
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return products;
    return products.filter((product: ProductDTO) =>
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [products, productSearchQuery]);

  // Get selected products for display
  const selectedProducts = useMemo(() => {
    if (!formData.productIds.length) return [];
    
    const selected = products.filter((product: ProductDTO) => 
      formData.productIds.includes(product.id)
    );
    
    console.log('📦 Selected products for display:', selected.map(p => ({ id: p.id, name: p.name })));
    return selected;
  }, [products, formData.productIds]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Tên mã giảm giá là bắt buộc';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã giảm giá là bắt buộc';
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'Mã giảm giá chỉ được chứa chữ hoa, số, dấu gạch dưới và gạch ngang';
    }

    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'Giá trị giảm giá phải lớn hơn 0';
    }

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      newErrors.discountValue = 'Phần trăm giảm giá không được vượt quá 100%';
    }

    if (formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = 'Số tiền đơn hàng tối thiểu không được âm';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }

    if (formData.maxUses < 1) {
      newErrors.maxUses = 'Số lần sử dụng tối đa phải lớn hơn 0';
    }

    if (formData.usagePerCustomer < 1) {
      newErrors.usagePerCustomer = 'Số lần sử dụng của 1 khách hàng phải lớn hơn 0';
    }

    // Validate datetime range with Vietnam timezone
    const dateTimeErrors = validateDateTimeRange(
      formData.startDate, 
      formData.endDate, 
      !selectedDiscount // isNewDiscount
    );
    Object.assign(newErrors, dateTimeErrors);

    if (formData.appliesTo === 'PRODUCTS' && formData.productIds.length === 0) {
      newErrors.productIds = 'Phải chọn ít nhất một sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Dữ liệu không hợp lệ', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    try {
      // Convert local datetime to backend format (Vietnam timezone)
      const backendStartDate = convertLocalToBackendDateTime(formData.startDate);
      const backendEndDate = convertLocalToBackendDateTime(formData.endDate);

      console.log('🚀 Submitting with data:', {
        ...formData,
        productIds: formData.appliesTo === 'PRODUCTS' ? formData.productIds : [],
        dates: { start: backendStartDate, end: backendEndDate }
      });

      if (selectedDiscount) {
        // Update discount
        const updateData: UpdateDiscountCodeRequest = {
          description: formData.description,
          discountValue: formData.discountValue,
          minOrderAmount: formData.minOrderAmount,
          maxDiscountValue: formData.discountType === 'PERCENTAGE' ? formData.maxDiscountValue : undefined,
          startDate: backendStartDate,
          endDate: backendEndDate,
          autoApply: formData.autoApply,
          priority: formData.priority,
          productIds: formData.appliesTo === 'PRODUCTS' ? formData.productIds : [],
          isActive: formData.isActive
        };

        await dispatch(updateDiscountCode({ id: selectedDiscount.id, data: updateData })).unwrap();
        toast.success('Cập nhật thành công', `Mã giảm giá "${formData.code}" đã được cập nhật`);
      } else {
        // Create new discount
        const createData: CreateDiscountCodeRequest = {
          storeId: currentStoreId,
          quantity: formData.quantity,
          maxUses: formData.maxUses,
          usagePerCustomer: formData.usagePerCustomer,
          code: formData.code,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          minOrderAmount: formData.minOrderAmount,
          maxDiscountValue: formData.discountType === 'PERCENTAGE' ? formData.maxDiscountValue : undefined,
          startDate: backendStartDate,
          endDate: backendEndDate,
          appliesTo: formData.appliesTo,
          autoApply: formData.autoApply,
          priority: formData.priority,
          productIds: formData.appliesTo === 'PRODUCTS' ? formData.productIds : []
        };

        await dispatch(createDiscountCode(createData)).unwrap();
        toast.success('Tạo thành công', `Mã giảm giá "${formData.code}" đã được tạo`);
      }

      // Refresh discount list
      dispatch(fetchDiscountCodes({ storeId: currentStoreId, page: 0, size: 10 }));
      handleClose();
    } catch (error: any) {
      const errorMessage = error.message || (selectedDiscount ? 'Có lỗi xảy ra khi cập nhật mã giảm giá' : 'Có lỗi xảy ra khi tạo mã giảm giá');
      toast.error(selectedDiscount ? 'Cập nhật thất bại' : 'Tạo thất bại', errorMessage);
      console.error('❌ Error saving discount:', error);
    }
  };

  const handleClose = () => {
    dispatch(setModalOpen(false));
    dispatch(setSelectedDiscount(null));
  };

  const handleInputChange = (field: keyof DiscountFormData, value: any) => {
    console.log(`🔄 Input change: ${field} =`, value);
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Special handling for appliesTo change
    if (field === 'appliesTo') {
      if (value === 'SHOP') {
        console.log('🏪 Switching to SHOP - clearing productIds');
        setFormData(prev => ({ ...prev, productIds: [] }));
        setShowProductSelection(false);
      } else {
        console.log('📦 Switching to PRODUCTS - showing product selection');
        setShowProductSelection(true);
      }
    }

    // Clear maxDiscountValue when switching to FIXED type
    if (field === 'discountType' && value === 'FIXED') {
      setFormData(prev => ({ ...prev, maxDiscountValue: 0 }));
    }
  };

  const generateDiscountCode = () => {
    const code = 'DISCOUNT' + Math.random().toString(36).substr(2, 6).toUpperCase();
    handleInputChange('code', code);
  };

  const handleProductToggle = (productId: number) => {
    console.log(`📦 Toggling product:`, productId);
    
    const updatedProducts = formData.productIds.includes(productId)
      ? formData.productIds.filter(id => id !== productId)
      : [...formData.productIds, productId];

    console.log('📦 Updated productIds:', updatedProducts);
    handleInputChange('productIds', updatedProducts);
  };

  const handleSelectAllProducts = () => {
    const allProductIds = filteredProducts.map(p => p.id);
    console.log('📦 Select all products:', allProductIds);
    handleInputChange('productIds', allProductIds);
  };

  const handleClearAllProducts = () => {
    console.log('📦 Clear all products');
    handleInputChange('productIds', []);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedDiscount ? 'Chỉnh sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}
            </h2>
            <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
              <MapPin size={14} />
              <span>Múi giờ: Việt Nam (UTC+7)</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Discount Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Phạm vi áp dụng <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.appliesTo === 'SHOP'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('appliesTo', 'SHOP')}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    formData.appliesTo === 'SHOP' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <ShoppingBag className={
                      formData.appliesTo === 'SHOP' ? 'text-green-600' : 'text-gray-600'
                    } size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Toàn Shop</h3>
                    <p className="text-sm text-gray-600">Áp dụng cho tất cả sản phẩm</p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.appliesTo === 'PRODUCTS'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('appliesTo', 'PRODUCTS')}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    formData.appliesTo === 'PRODUCTS' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Tag className={
                      formData.appliesTo === 'PRODUCTS' ? 'text-orange-600' : 'text-gray-600'
                    } size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Sản Phẩm Cụ Thể</h3>
                    <p className="text-sm text-gray-600">Chỉ áp dụng cho sản phẩm được chọn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên mã giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="VD: Giảm giá mùa hè 2024"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã giảm giá <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="VD: SUMMER2024"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!selectedDiscount}
                />
                {!selectedDiscount && (
                  <button
                    type="button"
                    onClick={generateDiscountCode}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Tạo mã tự động"
                  >
                    Auto
                  </button>
                )}
              </div>
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Discount Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.discountType === 'PERCENTAGE'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('discountType', 'PERCENTAGE')}
              >
                <div className="flex items-center gap-3">
                  <Percent className={
                    formData.discountType === 'PERCENTAGE' ? 'text-blue-600' : 'text-gray-600'
                  } size={20} />
                  <div>
                    <span className="font-medium">Giảm theo phần trăm</span>
                    <p className="text-sm text-gray-600">VD: Giảm 20%</p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.discountType === 'FIXED'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('discountType', 'FIXED')}
              >
                <div className="flex items-center gap-3">
                  <DollarSign className={
                    formData.discountType === 'FIXED' ? 'text-purple-600' : 'text-gray-600'
                  } size={20} />
                  <div>
                    <span className="font-medium">Giảm số tiền cố định</span>
                    <p className="text-sm text-gray-600">VD: Giảm 50,000đ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'} 
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange('discountValue', Number(e.target.value))}
                  min="0"
                  max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                  step={formData.discountType === 'PERCENTAGE' ? "1" : "1000"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.discountValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
                )}
              </div>

              {formData.discountType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountValue}
                    onChange={(e) => handleInputChange('maxDiscountValue', Number(e.target.value))}
                    min="0"
                    step="1000"
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Để trống nếu không giới hạn</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn hàng tối thiểu (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => handleInputChange('minOrderAmount', Number(e.target.value))}
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.minOrderAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.minOrderAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.minOrderAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Selection for PRODUCTS type */}
          {formData.appliesTo === 'PRODUCTS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sản phẩm áp dụng <span className="text-red-500">*</span>
              </label>
              
              {/* Product Search and Actions */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllProducts}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllProducts}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Bỏ chọn
                  </button>
                </div>

                {/* Selected Products Summary */}
                {formData.productIds.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="text-green-600" size={16} />
                      <span className="font-medium text-green-800">
                        Đã chọn {formData.productIds.length} sản phẩm
                      </span>
                    </div>
                    
                    {/* Show selected product names */}
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedProducts.slice(0, 5).map((product) => (
                          <span
                            key={product.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            <Package size={12} />
                            {product.name}
                            <button
                              type="button"
                              onClick={() => handleProductToggle(product.id)}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        {selectedProducts.length > 5 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            +{selectedProducts.length - 5} sản phẩm khác
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Product List */}
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Tag className="mx-auto mb-2" size={24} />
                      <p>Không tìm thấy sản phẩm nào</p>
                      {productSearchQuery && (
                        <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
                      )}
                    </div>
                  ) : (
                    filteredProducts.map((product: ProductDTO) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <img
                          src={product.image || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{formatCurrency(product.minPrice)}</span>
                            {product.minPrice !== product.maxPrice && (
                              <span>- {formatCurrency(product.maxPrice)}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Kho: {product.totalStock} | {product.itemType}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          product.status ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    ))
                  )}
                </div>

                {errors.productIds && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.productIds}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usage Settings - Only show for new discounts */}
          {!selectedDiscount && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tổng lượt sử dụng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => handleInputChange('maxUses', Number(e.target.value))}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.maxUses ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxUses && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxUses}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lượt dùng/khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.usagePerCustomer}
                  onChange={(e) => handleInputChange('usagePerCustomer', Number(e.target.value))}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.usagePerCustomer ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.usagePerCustomer && (
                  <p className="text-red-500 text-sm mt-1">{errors.usagePerCustomer}</p>
                )}
              </div>
            </div>
          )}

          {/* Date Time Settings - VIETNAM TIMEZONE VERSION */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-blue-600" size={20} />
              <h3 className="font-medium text-blue-900">Thời gian áp dụng</h3>
              <div className="ml-auto flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                <MapPin size={12} />
                <span>Múi giờ Việt Nam (UTC+7)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Ngày giờ bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
                {formData.startDate && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">🇻🇳 Giờ Việt Nam:</p>
                    <p className="text-sm text-blue-800 font-medium">{previewDateTimeFromLocal(formData.startDate)}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Ngày giờ kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
                {formData.endDate && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">🇻🇳 Giờ Việt Nam:</p>
                    <p className="text-sm text-blue-800 font-medium">{previewDateTimeFromLocal(formData.endDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timezone Info */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <div className="flex items-start gap-2">
                <Info className="text-yellow-600 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-yellow-800">Lưu ý về múi giờ:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• Thời gian được nhập theo múi giờ Việt Nam (UTC+7)</li>
                    <li>• Hệ thống sẽ tự động xử lý chuyển đổi múi giờ</li>
                    <li>• Mã giảm giá sẽ active/expire theo giờ Việt Nam</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Độ ưu tiên
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Số càng cao, độ ưu tiên càng lớn</p>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.autoApply}
                  onChange={(e) => handleInputChange('autoApply', e.target.checked)}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Tự động áp dụng</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Kích hoạt ngay</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-medium text-gray-900">Tóm tắt mã giảm giá</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>Mã:</strong> {formData.code || 'Chưa nhập'}</p>
                <p><strong>Phạm vi:</strong> {formData.appliesTo === 'SHOP' ? 'Toàn shop' : 'Sản phẩm cụ thể'}</p>
                <p>
                  <strong>Giảm giá:</strong>{' '}
                  {formData.discountType === 'PERCENTAGE'
                    ? `${formData.discountValue}%${formData.maxDiscountValue ? ` (tối đa ${formatCurrency(formData.maxDiscountValue)})` : ''}`
                    : formatCurrency(formData.discountValue)
                  }
                </p>
                {formData.minOrderAmount > 0 && (
                  <p><strong>Đơn hàng tối thiểu:</strong> {formatCurrency(formData.minOrderAmount)}</p>
                )}
              </div>
              <div className="space-y-2">
                {!selectedDiscount && (
                  <>
                    <p><strong>Số lượng:</strong> {formData.quantity}</p>
                    <p><strong>Tổng lượt sử dụng:</strong> {formData.maxUses}</p>
                    <p><strong>Lượt dùng/khách:</strong> {formData.usagePerCustomer}</p>
                  </>
                )}
                <p><strong>Thời gian hiệu lực (Giờ VN):</strong></p>
                <div className="text-xs text-gray-600 pl-4 space-y-1">
                  {formData.startDate && (
                    <p>Từ: <span className="font-medium">{previewDateTimeFromLocal(formData.startDate)}</span></p>
                  )}
                  {formData.endDate && (
                    <p>Đến: <span className="font-medium">{previewDateTimeFromLocal(formData.endDate)}</span></p>
                  )}
                </div>
                {formData.appliesTo === 'PRODUCTS' && formData.productIds.length > 0 && (
                  <p><strong>Sản phẩm áp dụng:</strong> {formData.productIds.length} sản phẩm</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {selectedDiscount ? 'Cập nhật' : 'Tạo mã giảm giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;