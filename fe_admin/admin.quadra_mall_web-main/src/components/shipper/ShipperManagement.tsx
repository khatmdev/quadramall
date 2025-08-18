import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Filter, RefreshCw, Eye, Check, X, AlertCircle, Clock, Truck } from 'lucide-react';
import {
  fetchPendingRegistrations,
  approveShipper,
  rejectShipper,
  setSelectedRegistration,
  selectPendingRegistrations,
  selectShipperLoading,
  selectShipperError,
  selectActionLoading,
  ShipperRegistration,
} from '@/store/Shipper/shipperSlice';
import { RootState, AppDispatch } from '@/store';
import { toast } from 'react-hot-toast';
import ShipperRegistrationModal from './ShipperDetailModal';
import ApprovalModal from './ApprovalModal';

const ShipperManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pendingRegistrations = useSelector(selectPendingRegistrations);
  const loading = useSelector(selectShipperLoading);
  const error = useSelector(selectShipperError);
  const actionLoading = useSelector(selectActionLoading);

  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [selectedRegistration, setSelectedRegistrationLocal] = useState<ShipperRegistration | null>(null);

  useEffect(() => {
    loadPendingRegistrations();
  }, [currentPage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadPendingRegistrations = () => {
    dispatch(fetchPendingRegistrations({
      page: currentPage,
      size: 10,
      sort: 'createdAt,desc'
    }));
  };

  const handleViewRegistration = (registration: ShipperRegistration) => {
    setSelectedRegistrationLocal(registration);
    dispatch(setSelectedRegistration(registration));
    setShowRegistrationModal(true);
  };

  const handleApprovalAction = (registration: ShipperRegistration, action: 'approve' | 'reject') => {
    setSelectedRegistrationLocal(registration);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleApprove = async (note?: string) => {
    if (!selectedRegistration) return;
    
    try {
      await dispatch(approveShipper({
        registrationId: selectedRegistration.id,
        request: note ? { note } : undefined
      })).unwrap();
      
      toast.success('Đã duyệt đăng ký shipper thành công');
      setShowApprovalModal(false);
      setSelectedRegistrationLocal(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi duyệt đăng ký');
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRegistration) return;
    
    try {
      await dispatch(rejectShipper({
        registrationId: selectedRegistration.id,
        request: { rejectionReason: reason }
      })).unwrap();
      
      toast.success('Đã từ chối đăng ký shipper');
      setShowApprovalModal(false);
      setSelectedRegistrationLocal(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi từ chối đăng ký');
    }
  };

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'MOTORBIKE': return 'Xe máy';
      case 'CAR': return 'Ô tô';
      case 'BICYCLE': return 'Xe đạp';
      default: return type;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'MOTORBIKE': return '🏍️';
      case 'CAR': return '🚗';
      case 'BICYCLE': return '🚴';
      default: return '🚛';
    }
  };

  const filteredRegistrations = pendingRegistrations.content.filter(registration => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      registration.userFullName.toLowerCase().includes(query) ||
      registration.userEmail.toLowerCase().includes(query) ||
      registration.licensePlate.toLowerCase().includes(query) ||
      registration.idCardNumber.includes(query)
    );
  });

  if (loading && pendingRegistrations.content.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Shipper</h1>
          </div>
          <p className="text-gray-600">Duyệt đăng ký và quản lý đội ngũ giao hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRegistrations.totalElements}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã từ chối hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm theo tên, email, biển số..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={loadPendingRegistrations}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Registration List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Đăng ký chờ duyệt</h2>
            <p className="text-gray-600 mt-1">Danh sách các đăng ký shipper cần được xem xét</p>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có đăng ký nào chờ duyệt</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <div key={registration.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {registration.userFullName.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {registration.userFullName}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Chờ duyệt
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{registration.userEmail}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-lg">{getVehicleIcon(registration.vehicleType)}</span>
                            {getVehicleTypeText(registration.vehicleType)}
                          </span>
                          <span>Biển số: <strong>{registration.licensePlate}</strong></span>
                          <span>CMND: <strong>{registration.idCardNumber}</strong></span>
                          <span>Đăng ký: {new Date(registration.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewRegistration(registration)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleApprovalAction(registration, 'approve')}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check size={16} />
                        Duyệt
                      </button>
                      
                      <button
                        onClick={() => handleApprovalAction(registration, 'reject')}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <X size={16} />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pendingRegistrations.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {pendingRegistrations.number * pendingRegistrations.size + 1} đến{' '}
                  {Math.min((pendingRegistrations.number + 1) * pendingRegistrations.size, pendingRegistrations.totalElements)} của{' '}
                  {pendingRegistrations.totalElements} kết quả
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={pendingRegistrations.first || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md">
                    {pendingRegistrations.number + 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={pendingRegistrations.last || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShipperRegistrationModal
        show={showRegistrationModal}
        registration={selectedRegistration}
        onClose={() => setShowRegistrationModal(false)}
      />

      <ApprovalModal
        show={showApprovalModal}
        action={approvalAction}
        registration={selectedRegistration}
        onClose={() => setShowApprovalModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  );
};

export default ShipperManagement;