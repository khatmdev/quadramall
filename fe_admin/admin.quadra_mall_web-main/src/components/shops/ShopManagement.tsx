import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { getStoreManagementData, lockUnlockStore } from '@/services/adminStoreManagementApi';
import { StoreManagementResponseDto } from '@/types/adminStoreManagementTypes';
import type { Shop, ViolationReport } from '@/types/shop';
import { toast } from 'react-toastify';
import Header from './ShopManagement/Header';
import StatsCards from './ShopManagement/StatsCards';
import Tabs from './ShopManagement/Tabs';
import Filters from './ShopManagement/Filters';
import OverviewContent from './ShopManagement/OverviewContent';
import AnalyticsContent from './ShopManagement/AnalyticsContent';
import ShopList from './ShopManagement/ShopList';
import ShopDetailsModal from './ShopManagement/ShopDetailsModal';
import LockShopModal from './ShopManagement/LockShopModal';
import ViolationResponseModal from './ShopManagement/ViolationResponseModal';
import ViolationReportsList from './ShopManagement/ViolationReportsList';

// Mock data for reported tab
const mockShops: Shop[] = [
  {
    id: 1,
    shopName: "Thời Trang Hiện Đại",
    ownerName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    idCardNumber: "123456789",
    address: "123 Nguyễn Huệ, Q1, HCM",
    avatar: "https://via.placeholder.com/40",
    status: "active",
    lockReason: undefined,
    rating: 4.8,
    reviewCount: 1250,
    orderCount: 5420,
    completionRate: 98,
    responseRate: 95,
    totalRevenue: 2500,
    commissionFee: 125,
    serviceFee: 75,
    favoriteCount: 890,
    followersCount: 2340,
    joinedDate: "2023-01-15",
    lastActiveDate: "2024-06-20",
    verificationStatus: "verified",
    products: [
      { id: 1, name: "Áo thun nam", minPrice: 300000, maxPrice: 250000, status: "active", stock: 100, sold: 450 },
      { id: 2, name: "Quần jean nữ", minPrice: 40000, maxPrice: 45000, status: "active", stock: 80, sold: 230 }
    ],
    violationReports: []
  },
  {
    id: 2,
    shopName: "Điện Tử Thông Minh",
    ownerName: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0912345678",
    idCardNumber: "987654321",
    address: "456 Lê Lợi, Q3, HCM",
    avatar: "https://via.placeholder.com/40",
    status: "reported",
    lockReason: "Vi phạm chính sách bán hàng",
    rating: 4.2,
    reviewCount: 680,
    orderCount: 2150,
    completionRate: 92,
    responseRate: 88,
    totalRevenue: 1800,
    commissionFee: 90,
    serviceFee: 54,
    favoriteCount: 445,
    followersCount: 1200,
    joinedDate: "2023-03-20",
    lastActiveDate: "2024-06-18",
    verificationStatus: "verified",
    products: [
      { id: 3, name: "Điện thoại iPhone", minPrice: 300000, maxPrice: 250000, status: "pending", stock: 20, sold: 45 }
    ],
    violationReports: [
      {
        id: 1,
        reporterName: "Khách hàng X",
        reason: "Bán hàng giả",
        description: "Sản phẩm không đúng mô tả",
        evidence: "evidence1.jpg",
        reportedAt: "2024-06-15",
        status: "pending",
        severity: "high"
      }
    ]
  }
];

const ShopManagement: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'locked' | 'inactive' | 'reported' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showShopDetails, setShowShopDetails] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ViolationReport | null>(null);
  const [violationResponse, setViolationResponse] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [lockReason, setLockReason] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    verificationStatus: 'all',
    sortBy: 'revenue',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const response = await getStoreManagementData(filters.status === 'all' ? undefined : filters.status);
        if (response.status === 'success' && response.data) {
          const mappedShops: Shop[] = response.data.map((item: StoreManagementResponseDto) => {
            // Chuyển mảng storeCreatedAt thành chuỗi ISO
            const createdAtArray = item.store?.storeCreatedAt as [number, number, number, number, number] | string | undefined;
            let joinedDate = '';
            if (Array.isArray(createdAtArray)) {
              const [year, month, day, hour, minute] = createdAtArray;
              joinedDate = new Date(year, month - 1, day, hour, minute).toISOString();
            } else {
              joinedDate = createdAtArray ?? '';
            }

            return {
              id: item.store?.storeId ?? 0,
              shopName: item.store?.storeName ?? '',
              ownerName: item.store?.owner?.fullName ?? '',
              email: item.store?.owner?.email ?? '',
              phone: item.store?.owner?.phone ?? '',
              idCardNumber: '',
              address: item.store?.storeAddress ?? '',
              avatar: item.store?.storeLogoUrl ?? '',
              status: item.store?.storeStatus.toLowerCase() ?? '',
              lockReason: item.store?.lockReason ?? undefined,
              rating: item.stats.averageRating,
              reviewCount: 0,
              orderCount: item.stats.totalOrders,
              completionRate: item.stats.completionRate,
              responseRate: 0,
              totalRevenue: item.stats.totalRevenue,
              commissionFee: 0,
              serviceFee: 0,
              favoriteCount: 0,
              followersCount: 0,
              joinedDate,
              lastActiveDate: '',
              verificationStatus: 'verified',
              products: item.products.map(product => ({
                id: product.productId,
                name: product.name,
                minPrice: product.minPrice,
                maxPrice: product.maxPrice,
                status: product.isActive ? 'active' : 'inactive',
                stock: product.totalStock,
                sold: product.totalSold,
              })),
              violationReports: [],
            };
          });
          setShops(activeTab === 'reported' ? mockShops : mappedShops);
        } else {
          setShops(activeTab === 'reported' ? mockShops : []);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
        setShops(activeTab === 'reported' ? mockShops : []);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [filters.status, activeTab]);

  // Statistics calculations
  const stats = {
    totalShops: shops.length,
    activeShops: shops.filter(s => s.status === 'active').length,
    lockedShops: shops.filter(s => s.status === 'locked').length,
    inactiveShops: shops.filter(s => s.status === 'inactive').length,
    reportedShops: mockShops.filter(s => s.status === 'reported').length,
    totalRevenue: shops.reduce((sum, shop) => sum + shop.totalRevenue, 0),
    totalCommission: shops.reduce((sum, shop) => sum + shop.commissionFee, 0),
    averageRating: shops.length > 0 ? shops.reduce((sum, shop) => sum + shop.rating, 0) / shops.length : 0,
  };

  const getFilteredShops = () => {
    let filtered = shops;

    // Apply tab filter
    switch (activeTab) {
      case 'active':
        filtered = shops.filter(s => s.status === 'active');
        break;
      case 'locked':
        filtered = shops.filter(s => s.status === 'locked');
        break;
      case 'inactive':
        filtered = shops.filter(s => s.status === 'inactive');
        break;
      case 'reported':
        // Không áp dụng lọc ở đây vì tab Báo Cáo Vi Phạm sẽ sử dụng ViolationReportsList
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery.trim() && activeTab !== 'reported') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop =>
          shop.shopName.toLowerCase().includes(query) ||
          shop.ownerName.toLowerCase().includes(query) ||
          shop.email.toLowerCase().includes(query) ||
          shop.idCardNumber.includes(query)
      );
    }

    // Apply other filters for non-reported tabs
    if (activeTab !== 'reported') {
      if (filters.status !== 'all') {
        filtered = filtered.filter(shop => shop.status === filters.status);
      }
      if (filters.verificationStatus !== 'all') {
        filtered = filtered.filter(shop => shop.verificationStatus === filters.verificationStatus);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (filters.sortBy) {
          case 'revenue':
            aValue = a.totalRevenue;
            bValue = b.totalRevenue;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'orders':
            aValue = a.orderCount;
            bValue = b.orderCount;
            break;
          case 'joinDate':
            aValue = new Date(a.joinedDate).getTime();
            bValue = new Date(b.joinedDate).getTime();
            break;
          default:
            aValue = a.totalRevenue;
            bValue = b.totalRevenue;
        }
        return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }

    return filtered;
  };

  const getFilteredViolationReports = () => {
    let filteredReports = shops.flatMap(shop =>
        shop.violationReports.map(report => ({ ...report, shop }))
    );

    // Apply search filter for violation reports
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredReports = filteredReports.filter(({ shop, reason, description }) =>
          shop.shopName.toLowerCase().includes(query) ||
          shop.ownerName.toLowerCase().includes(query) ||
          reason.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query)
      );
    }

    return filteredReports;
  };

  const handleLockShop = (shop: Shop) => {
    setSelectedShop(shop);
    setShowLockModal(true);
  };

  const confirmLockShop = async () => {
    if (selectedShop) {
      const newStatus = selectedShop.status === 'locked' ? 'ACTIVE' : 'LOCKED';
      const normalizedStatus: 'active' | 'locked' = newStatus.toLowerCase() as 'active' | 'locked';
      try {
        await lockUnlockStore(selectedShop.id, newStatus, newStatus === 'LOCKED' ? lockReason : undefined);
        setShops(prevShops =>
            prevShops.map(shop =>
                shop.id === selectedShop.id
                    ? { ...shop, status: normalizedStatus, lockReason: newStatus === 'LOCKED' ? lockReason : undefined }
                    : shop
            )
        );
        toast.success(newStatus === 'LOCKED' ? 'Khóa shop thành công!' : 'Mở khóa shop thành công!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
      } catch (error) {
        console.error('Error locking/unlocking shop:', error);
        toast.error('Có lỗi xảy ra khi khóa/mở khóa shop!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
      }
      setShowLockModal(false);
      setLockReason('');
      setSelectedShop(null);
    }
  };

  const handleViolationResponse = (violation: ViolationReport, shop: Shop) => {
    setSelectedViolation(violation);
    setSelectedShop(shop);
    setViolationResponse(violation.response || '');
    setAdminNote(violation.adminNote || '');
    setShowViolationModal(true);
  };

  const submitViolationResponse = () => {
    if (selectedViolation && selectedShop) {
      setShops(prevShops =>
          prevShops.map(shop =>
              shop.id === selectedShop.id
                  ? {
                    ...shop,
                    violationReports: shop.violationReports.map(report =>
                        report.id === selectedViolation.id
                            ? { ...report, response: violationResponse, adminNote, status: 'resolved' }
                            : report
                    )
                  }
                  : shop
          )
      );
      setShowViolationModal(false);
      setViolationResponse('');
      setAdminNote('');
    }
  };

  if (loading) {
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
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StatsCards stats={stats} />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
          {activeTab !== 'overview' && activeTab !== 'analytics' && (
              <Filters filters={filters} setFilters={setFilters} />
          )}
          {activeTab === 'overview' && <OverviewContent shops={shops} />}
          {activeTab === 'analytics' && (
              <AnalyticsContent
                  shops={shops}
                  handleLockShop={handleLockShop}
                  handleViolationResponse={handleViolationResponse}
              />
          )}
          {(activeTab === 'active' || activeTab === 'locked' || activeTab === 'inactive') && (
              <ShopList
                  shops={getFilteredShops()}
                  handleLockShop={handleLockShop}
                  handleViolationResponse={handleViolationResponse}
                  setSelectedShop={setSelectedShop}
                  setShowShopDetails={setShowShopDetails}
              />
          )}
          {activeTab === 'reported' && (
              <ViolationReportsList
                  reports={getFilteredViolationReports()}
                  handleLockShop={handleLockShop}
                  handleViolationResponse={handleViolationResponse}
                  setSelectedShop={setSelectedShop}
                  setShowShopDetails={setShowShopDetails}
              />
          )}
        </div>
        <ShopDetailsModal
            show={showShopDetails}
            shop={selectedShop}
            onClose={() => setShowShopDetails(false)}
        />
        <LockShopModal
            show={showLockModal}
            shop={selectedShop}
            lockReason={lockReason}
            setLockReason={setLockReason}
            onConfirm={confirmLockShop}
            onClose={() => setShowLockModal(false)}
        />
        <ViolationResponseModal
            show={showViolationModal}
            violation={selectedViolation}
            shop={selectedShop}
            violationResponse={violationResponse}
            setViolationResponse={setViolationResponse}
            adminNote={adminNote}
            setAdminNote={setAdminNote}
            onSubmit={submitViolationResponse}
            onClose={() => setShowViolationModal(false)}
        />
      </div>
  );
};

export default ShopManagement;