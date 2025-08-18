import React from 'react';
import { XCircle } from 'lucide-react';
import type { Shop } from '@/types/shop';

interface LockShopModalProps {
  show: boolean;
  shop: Shop | null;
  lockReason: string;
  setLockReason: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const LockShopModal: React.FC<LockShopModalProps> = ({ show, shop, lockReason, setLockReason, onConfirm, onClose }) => {
  if (!show || !shop) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {shop.status === 'locked' ? 'Mở khóa shop' : 'Khóa shop'}
              </h3>
              <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <img
                    src={shop.avatar}
                    alt={shop.shopName}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{shop.shopName}</p>
                  <p className="text-sm text-gray-600">{shop.ownerName}</p>
                </div>
              </div>

              {shop.status === 'locked' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Shop này hiện đang bị khóa với lý do: <strong>{shop.lockReason}</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Bạn có chắc chắn muốn mở khóa shop này?
                    </p>
                  </div>
              ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do khóa shop <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Nhập lý do khóa shop..."
                        required
                    />
                  </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                  onClick={onConfirm}
                  disabled={shop.status !== 'locked' && !lockReason.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                      shop.status === 'locked'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
              >
                {shop.status === 'locked' ? 'Mở khóa' : 'Khóa shop'}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LockShopModal;