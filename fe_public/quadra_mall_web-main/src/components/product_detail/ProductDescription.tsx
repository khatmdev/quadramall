import React from 'react';
import { SpecificationDTO } from '@/types/product/product_Detail';

interface DescriptionItem {
  type: 'text' | 'image';
  content?: string;
  url?: string;
}

interface ProductDescriptionProps {
  description: string | null;
  specifications: SpecificationDTO[];
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ description, specifications }) => {
  let descriptionItems: DescriptionItem[] = [];

  try {
    if (description) {
      descriptionItems = JSON.parse(description) as DescriptionItem[];
    }
  } catch (error) {
    console.error('Error parsing description:', error);
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow">
      <div className="space-y-6">
        {/* CHI TIẾT SẢN PHẨM Section */}
        {specifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
                CHI TIẾT SẢN PHẨM
              </h1>
            </div>
            <div className="p-6">
              <div className="grid gap-3">
                {specifications.map((spec) => (
                  <div key={spec.name} className="flex items-start py-2 border-b border-gray-50 last:border-b-0">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{spec.name}:</span>
                      <span className="ml-2 text-gray-600">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MÔ TẢ SẢN PHẨM Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-green-500 rounded-full mr-3"></span>
              MÔ TẢ SẢN PHẨM
            </h3>
          </div>
          <div className="p-6">
            {descriptionItems.length > 0 ? (
              <div className="prose prose-gray max-w-none space-y-4">
                {descriptionItems.map((item, index) => (
                  <div key={index}>
                    {item.type === 'text' && item.content && (
                      <p className="text-gray-700 leading-relaxed text-base">{item.content}</p>
                    )}
                    {item.type === 'image' && item.url && (
                      <img
                        src={item.url}
                        alt="Product description"
                        className="max-w-full h-auto rounded-lg shadow-md"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Không có mô tả sản phẩm.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
