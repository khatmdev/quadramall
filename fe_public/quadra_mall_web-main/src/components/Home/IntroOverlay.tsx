import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHome } from '@/hooks/useHome'; // Điều chỉnh path nếu cần
import { RefreshCw, AlertCircle } from 'lucide-react';

const INTRO_SEEN_KEY = 'intro_seen';

const IntroOverlay: React.FC = () => {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { introBanner } = useHome();

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem(INTRO_SEEN_KEY);
    if (!hasSeenIntro) {
      setShow(true);
      sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    }
  }, []);

  const handleClose = () => setShow(false);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  if (!show) return null;

  if (introBanner.isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto text-white animate-spin mb-4" />
          <p className="text-white text-lg">Đang tải banner intro...</p>
        </div>
      </div>
    );
  }

  if (introBanner.isError || !introBanner.data) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center" onClick={handleClose}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-white text-lg">Không thể tải banner intro</p>
          <button
            onClick={() => introBanner.refetch()}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mx-auto"
          >
            <RefreshCw size={18} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const banner = introBanner.data;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
      onClick={handleClickOutside}
    >
      <div
        ref={containerRef}
        className="relative max-w-4xl w-full mx-4 rounded-lg overflow-hidden shadow-2xl"
      >
        <Link to={banner.toUrl || '#'}>
         <div className="w-full aspect-[4/1] bg-black">
            <img
              src={banner.image}
              alt={`Intro banner ${banner.id}`}
              className="w-full h-full object-cover"
            />
          </div> 
          {banner.description && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-md px-6 py-4 rounded-lg text-white text-center shadow-lg">
              <p className="text-xl drop-shadow-md">
                👉 {banner.description} {banner.emoji ?? ''}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white text-xl rounded-full p-2 transition"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default IntroOverlay;