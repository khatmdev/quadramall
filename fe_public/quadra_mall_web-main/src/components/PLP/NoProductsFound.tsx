import React from "react";

const NoProductsFound: React.FC = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      Không tìm thấy sản phẩm
    </h2>
    <p className="text-gray-600 mb-4">
      Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
    </p>
    <div className="w-48 h-48 mx-auto mb-4 bg-gray-200 rounded-full">
      <img src="/assets/no-results.png" alt="product-not-found" />
    </div>
    <button
      onClick={() => (window.location.href = "/")}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
    >
      Quay về trang chủ
    </button>
  </div>
);

export default NoProductsFound;