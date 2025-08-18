import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { storeService } from '@/api/storeService';
import { ShopDetailDto } from '@/types/store_detail/interfaces';
import MainLayout from '@/components/ShopDetail/MainLayout';
import type { RootState } from '@/store';

const Shopdetail: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const userId = useSelector((state: RootState) => state.auth.user?.userId); // Lấy userId từ Redux
  const [shopData, setShopData] = useState<ShopDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeSlug) {
        setError('Không tìm thấy slug cửa hàng');
        setLoading(false);
        return;
      }

      try {
        const data = await storeService.getStoreBySlug(storeSlug);
        setShopData(data);
      } catch (err) {
        setError('Không thể tải thông tin cửa hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeSlug]); // Chỉ phụ thuộc vào storeSlug

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error || !shopData || !storeSlug) {
    return <div className="text-center py-10 text-red-500">{error || 'Không tìm thấy cửa hàng'}</div>;
  }

  return (
    <div className="App">
      <MainLayout shopData={shopData} storeSlug={storeSlug} userId={userId} />
    </div>
  );
};

export default Shopdetail;
