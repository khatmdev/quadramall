import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import FormInput from './FormInput';
import { ShopFormData } from '@/types/ShopRegistration';

interface Step2PickupAddressProps {
    formData: ShopFormData;
    updateFormData: (updates: Partial<ShopFormData>) => void;
    errors: Record<string, string>;
}

interface AddressItem {
    code: string;
    name: string;
    districts?: AddressItem[];
    wards?: AddressItem[];
}

const Step2PickupAddress: React.FC<Step2PickupAddressProps> = ({ formData, updateFormData, errors }) => {
    const [provinces, setProvinces] = useState<AddressItem[]>([]);
    const [districts, setDistricts] = useState<AddressItem[]>([]);
    const [wards, setWards] = useState<AddressItem[]>([]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/p/');
                if (!response.ok) {
                    throw new Error('Failed to fetch provinces');
                }
                const data: AddressItem[] = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error('Failed to fetch provinces:', error);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (formData.city) {
            const province = provinces.find(p => p.name === formData.city);
            if (province) {
                const fetchDistricts = async () => {
                    try {
                        const response = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch districts');
                        }
                        const data: AddressItem = await response.json();
                        setDistricts(data.districts || []);
                    } catch (error) {
                        console.error('Failed to fetch districts:', error);
                    }
                };
                fetchDistricts();
            }
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [formData.city, provinces]);

    useEffect(() => {
        if (formData.district && formData.city) {
            const district = districts.find(d => d.name === formData.district);
            if (district) {
                const fetchWards = async () => {
                    try {
                        const response = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch wards');
                        }
                        const data: AddressItem = await response.json();
                        setWards(data.wards || []);
                    } catch (error) {
                        console.error('Failed to fetch wards:', error);
                    }
                };
                fetchWards();
            }
        } else {
            setWards([]);
        }
    }, [formData.district, districts]);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Địa chỉ lấy hàng</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-medium text-green-800 mb-1">Địa chỉ lấy hàng</h3>
                        <p className="text-sm text-green-700">
                            Vui lòng cung cấp địa chỉ chính xác để đảm bảo quá trình lấy hàng diễn ra thuận lợi.
                        </p>
                    </div>
                </div>
            </div>
            <FormInput
                label="Họ và tên người liên hệ"
                name="pickupContactName"
                value={formData.pickupContactName}
                onChange={(value) => updateFormData({ pickupContactName: value })}
                placeholder="Nhập họ và tên"
                required
                error={errors.pickupContactName}
            />
            <FormInput
                label="Số điện thoại liên hệ"
                name="pickupContactPhone"
                value={formData.pickupContactPhone}
                onChange={(value) => updateFormData({ pickupContactPhone: value })}
                placeholder="Nhập số điện thoại"
                required
                error={errors.pickupContactPhone}
            />
            <FormInput
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={(value) => updateFormData({ address: value })}
                placeholder="Số nhà, tên đường"
                required
                error={errors.address}
                icon={<MapPin className="w-5 h-5" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Tỉnh/Thành phố
                    </label>
                    <select
                        value={formData.city}
                        onChange={(e) => updateFormData({ city: e.target.value, district: '', ward: '' })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map(province => (
                            <option key={province.code} value={province.name}>{province.name}</option>
                        ))}
                    </select>
                    {errors.city && <p className="mt-2 text-sm text-red-500">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Quận/Huyện
                    </label>
                    <select
                        value={formData.district}
                        onChange={(e) => updateFormData({ district: e.target.value, ward: '' })}
                        disabled={!formData.city}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map(district => (
                            <option key={district.code} value={district.name}>{district.name}</option>
                        ))}
                    </select>
                    {errors.district && <p className="mt-2 text-sm text-red-500">{errors.district}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500 mr-1">*</span>
                        Phường/Xã
                    </label>
                    <select
                        value={formData.ward}
                        onChange={(e) => updateFormData({ ward: e.target.value })}
                        disabled={!formData.district}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-gray-50 ${
                            errors.ward ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn phường/xã</option>
                        {wards.map(ward => (
                            <option key={ward.code} value={ward.name}>{ward.name}</option>
                        ))}
                    </select>
                    {errors.ward && <p className="mt-2 text-sm text-red-500">{errors.ward}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2PickupAddress;