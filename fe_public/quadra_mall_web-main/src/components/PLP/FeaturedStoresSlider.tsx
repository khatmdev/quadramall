import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface StoreHomeResponseDTO {
  id: number;
  name: string;
  rating: number;
  slug: string;
  logoUrl: string;
}

interface FeaturedStoresSliderProps {
  stores: StoreHomeResponseDTO[];
  onViewStore: (slug: string) => void;
}

const FeaturedStoresSlider: React.FC<FeaturedStoresSliderProps> = React.memo(
  ({ stores, onViewStore }) => (
    <div className="relative">
      <h2 className="text-2xl font-bold text-[#14532D] mb-4">
        Cửa hàng nổi bật
      </h2>
      <Swiper
        modules={[Navigation]}
        slidesPerView={4}
        spaceBetween={20}
        navigation
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        className="pb-8"
      >
        {stores.map((store) => (
          <SwiperSlide key={store.id} style={{ width: "250px", padding: "10px" }}>
            <div className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow duration-300">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-24 h-24 object-contain mx-auto mb-2"
                loading="lazy"
              />
              <h3 className="text-base font-semibold line-clamp-1">
                {store.name}
              </h3>
              <p className="text-sm text-gray-600">★ {store.rating}</p>
              <button
                onClick={() => onViewStore(store.slug)}
                className="mt-2 px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Xem cửa hàng
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
);

export default FeaturedStoresSlider;