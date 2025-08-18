import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';
import { useHome } from '@/hooks/useHome';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Banner: React.FC = () => {
  const { banners } = useHome();

  if (banners.isLoading) {
    return (
      <div className="w-full h-[300px] md:h-[500px] flex items-center justify-center bg-black/80">
        <RefreshCw className="animate-spin text-white" size={32} />
        <span className="text-white ml-2">Đang tải banner...</span>
      </div>
    );
  }

  if (banners.isError || !banners.data?.length) {
    return (
      <div className="w-full h-[300px] md:h-[500px] flex flex-col items-center justify-center bg-black/80 text-white">
        <AlertCircle size={32} className="text-red-500 mb-2" />
        <p className="text-lg">Không thể tải banner</p>
        <button
          onClick={() => banners.refetch()}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          <RefreshCw size={18} className="animate-spin-slow" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section className="relative w-full h-[300px] md:h-[500px] overflow-hidden mt-[100px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
        }}
        autoplay={{ delay: 5000 }}
        loop
        className="w-full h-full"
      >
        {banners.data.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link
              to={banner.toUrl || `/banner/${banner.id}`}
              className="block w-full h-full"
            >
              <div className="relative w-full h-full group">
                <img
                  src={banner.image}
                  alt={`Banner ${banner.id}`}
                  className="w-full h-full object-cover"
                />
                {banner.description && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-end justify-center mb-10 transition-opacity duration-300">
                    <div className="bg-black/40 backdrop-blur-md rounded-lg px-6 py-4 shadow-lg">
                      <p className="text-white text-xl text-center">
                        👉 {banner.description} {banner.emoji ?? ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <button className="swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:text-green-400 transition-colors">
        <FaArrowAltCircleLeft size={36} />
      </button>
      <button className="swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white hover:text-green-400 transition-colors">
        <FaArrowAltCircleRight size={36} />
      </button>
    </section>
  );
};

export default Banner;
