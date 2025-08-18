import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchProductDetail } from '@/api/productApi';
import { ProductDetailDTO } from '@/types/product/product_Detail';
import ProductImages from '@/components/product_detail/ProductImages';
import ProductInfo from '@/components/product_detail/ProductInfo';
import VariantSelector from '@/components/product_detail/VariantSelector';
import AddonSelector from '@/components/product_detail/AddonSelector';
import ReviewsSection from '@/components/product_detail/ReviewsSection';
import RelatedProducts from '@/components/product_detail/RelatedProducts';
import { Button } from '@/components/ui/button';
import ShopInfo from '@/components/product_detail/ShopInfo';
import { mockData } from '@/data/mockData';
import { api } from '@/main';
import { RootState } from '@/store';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import {addToCart} from "@/api/cartApi";

const ProductDescription = React.lazy(() =>
  import('@/components/product_detail/ProductDescription')
);
const Voucher = React.lazy(() => import('@/components/product_detail/Voucher'));

const ProductDetailScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [productDetail, setProductDetail] = useState<ProductDetailDTO | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductDetail = useCallback(async () => {
    if (!slug) {
      setError('Không tìm thấy sản phẩm');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data: ProductDetailDTO = await fetchProductDetail(slug);
      setProductDetail(data);

      if (data.variants && data.variants.length > 0) {
        const defaultAttributes: { [key: string]: string } = {};
        data.availableAttributes?.forEach((attr) => {
          if (attr?.values && attr.values.length > 0) {
            defaultAttributes[attr.name] = attr.values[0];
          }
        });

        const variantAttributeMap: { [variantId: number]: { [attrName: string]: string } } = {};
        data.variantDetails?.forEach((detail) => {
          if (detail) {
            const variantId = detail.variantId;
            const attrName = detail.attributeName;
            const attrValue = detail.attributeValue;
            if (!variantAttributeMap[variantId]) {
              variantAttributeMap[variantId] = {};
            }
            variantAttributeMap[variantId][attrName] = attrValue;
          }
        });

        const matchingVariantId = Object.keys(variantAttributeMap).find((variantId) => {
          return data.availableAttributes?.every((attr) => {
            if (!attr) return false;
            const defaultValue = defaultAttributes[attr.name];
            const variantValue = variantAttributeMap[Number(variantId)]?.[attr.name];
            return !defaultValue || (variantValue !== undefined && defaultValue === variantValue);
          });
        });

        setSelectedVariantId(matchingVariantId ? Number(matchingVariantId) : data.variants[0].id);
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Load product detail error:', err.response?.data || err.message, err.response?.status);
        setError(
          err.response?.data?.message || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.'
        );
        toast.error('Lỗi tải sản phẩm: ' + (err.response?.data?.message || err.message));
      } else {
        console.error('Unexpected error:', err);
        setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.');
        toast.error('Đã xảy ra lỗi không mong muốn.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProductDetail();
  }, [loadProductDetail]);

  const handleRetry = () => {
    loadProductDetail();
  };

  const selectedVariant = productDetail?.variants?.find((v) => v?.id === selectedVariantId);
  const stockQuantity = selectedVariant?.stockQuantity ?? 0;

  const calculateTotalPrice = () => {
    if (!selectedVariant) return 0;

    // Sử dụng discountedPrice nếu có, nếu không thì dùng price
    let totalPrice = selectedVariant.discountedPrice ?? selectedVariant.price ?? 0;
    productDetail?.addonGroups?.forEach((group) => {
      group?.addons?.forEach((addon) => {
        if (addon && selectedAddons.includes(addon.id)) {
          totalPrice += addon.priceAdjust ?? 0;
        }
      });
    });

    return totalPrice * quantity;
  };

  const checkAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện hành động này.');
      navigate('/login');
      return;
    }
    action();
  };

  const handleAddToCart = async () => {
    if (!productDetail?.id || !selectedVariantId) {
      toast.error('Vui lòng chọn phân loại hàng');
      return;
    }

    checkAuth(async () => {
      try {
        const response = await addToCart(productDetail.id, selectedVariantId, quantity, selectedAddons);
        toast.success(response.message || 'Sản phẩm đã được thêm vào giỏ hàng!');
      } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        if (error instanceof AxiosError) {
          toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
        }
      }
    });
  };

  const handleBuyNow = () => {
    if (!productDetail?.id || !selectedVariantId) {
      toast.error('Vui lòng chọn phân loại hàng');
      return;
    }

    checkAuth(() => {
      console.log(
        `Mua ngay: Product ID ${productDetail.id}, Variant ID ${selectedVariantId}, Addons: ${selectedAddons}, Quantity: ${quantity}`
      );
      navigate('/checkout');
    });
  };

  const handleSaveVoucher = async (voucherId: number) => {
    checkAuth(async () => {
      try {
        const response = await api.post('/voucher/save', { voucherId });
        toast.success(response.data.message || 'Voucher đã được lưu!');
      } catch (error) {
        console.error('Lỗi khi lưu voucher:', error);
        if (error instanceof AxiosError) {
          toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
        } else {
          toast.error('Có lỗi xảy ra khi lưu voucher. Vui lòng thử lại!');
        }
      }
    });
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < stockQuantity) setQuantity(quantity + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="w-full h-96 bg-gray-200 rounded-md mb-4"></div>
            <div className="flex gap-2 overflow-x-auto">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="w-20 h-20 bg-gray-200 rounded-md"></div>
                ))}
            </div>
          </div>
          <div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !productDetail) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-600">{error || 'Sản phẩm không tồn tại'}</p>
        <Button onClick={handleRetry} className="mt-4">
          Thử lại
        </Button>
        <p className="text-gray-500 text-sm mt-2">Nếu lỗi tiếp tục, vui lòng liên hệ hỗ trợ.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="p-4 bg-gray-50 shadow rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <ProductImages
              productId={productDetail.id ?? 0}
              images={productDetail.images ?? []}
              thumbnailUrl={productDetail.thumbnailUrl}
              videoUrl={productDetail.videoUrl ?? null}
              selectedVariantId={selectedVariantId}
              variants={productDetail.variants ?? []}
            />
          </div>
          <div className="md:col-span-8">
            <ProductInfo
              product={productDetail}
              store={productDetail.store}
              totalPrice={calculateTotalPrice()}
              stockQuantity={stockQuantity}
              selectedVariantId={selectedVariantId} // Truyền prop để ProductInfo biết variant đã chọn
            />
            {productDetail.availableAttributes && productDetail.availableAttributes.length > 0 && (
              <VariantSelector
                productId={productDetail.id ?? 0}
                attributes={productDetail.availableAttributes}
                variants={productDetail.variants ?? []}
                variantDetails={productDetail.variantDetails ?? []}
                selectedVariantId={selectedVariantId}
                onSelectVariant={setSelectedVariantId}
              />
            )}
            {productDetail.addonGroups && productDetail.addonGroups.length > 0 && (
              <AddonSelector
                variantId={selectedVariantId}
                addonGroups={productDetail.addonGroups}
                selectedAddons={selectedAddons}
                onToggleAddon={(addonId) =>
                  setSelectedAddons((prev) =>
                    prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
                  )
                }
              />
            )}
            <div className="flex gap-4 mt-4 items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-lg font-medium text-red-500">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  disabled={quantity >= stockQuantity}

                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">{stockQuantity} sản phẩm còn sẵn</span>
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                variant="default"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Mua ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 shadow rounded-lg">
        {productDetail.store && <ShopInfo store={productDetail.store} />}
      </div>
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7">
          <Suspense
            fallback={
              <div className="p-4 bg-gray-50 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            }
          >
            {productDetail.description && (
              <ProductDescription
                description={productDetail.description}
                specifications={productDetail.specifications ?? []}
              />
            )}
          </Suspense>
        </div>
        <div className="col-span-3">
          <Suspense
            fallback={
              <div className="p-4 bg-gray-50 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            }
          >
            {productDetail.discountCodes && productDetail.discountCodes.length > 0 && (
              <Voucher discountCodes={productDetail.discountCodes} onSaveVoucher={handleSaveVoucher} />
            )}
          </Suspense>
        </div>
      </div>
      <div className="p-4 bg-gray-50 shadow rounded-lg">
        <ReviewsSection product={productDetail} />
      </div>
      <div className="p-4 bg-gray-50 shadow rounded-lg">
        <RelatedProducts
          relatedProducts={mockData.relatedProducts.filter(
            (rp) => rp.category_id === (productDetail.categoryId ?? 0)
          )}
        />
      </div>
    </div>
  );
};

export default ProductDetailScreen;
