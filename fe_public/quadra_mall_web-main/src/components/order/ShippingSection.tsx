import { Truck, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface ShippingSectionProps {
  shippingMethod: string;
  setShippingMethod: (method: string) => void;
  totalShipping: number;
}

const ShippingSection: React.FC<ShippingSectionProps> = ({ shippingMethod, setShippingMethod, totalShipping }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Truck className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-800">Phương thức vận chuyển</h2>
      </div>
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="shipping"
            value="STANDARD"
            checked={shippingMethod === 'STANDARD'}
            onChange={(e) => setShippingMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800">Giao hàng tiêu chuẩn</p>
              <p className="text-sm font-medium text-gray-800">{formatCurrency(totalShipping)}</p>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              3-5 ngày làm việc
            </p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            name="shipping"
            value="EXPRESS"
            checked={shippingMethod === 'EXPRESS'}
            onChange={(e) => setShippingMethod(e.target.value)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800">Giao hàng nhanh</p>
              <p className="text-sm font-medium text-gray-800">{formatCurrency(totalShipping + 20000)}</p>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              1-2 ngày làm việc
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ShippingSection;