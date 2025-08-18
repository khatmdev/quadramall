import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F0FDF4] pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ShopStyle</h2>
            <p className="text-gray-600 mb-4">Making online shopping easier and more enjoyable.</p>
            <div className="flex space-x-4">
              {/* Social Icons */}
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-..." />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c-..." />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-..." />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop</h3>
            <ul className="text-gray-600 space-y-2">
              <li><a href="#" className="hover:text-gray-900">Men's Clothing</a></li>
              <li><a href="#" className="hover:text-gray-900">Women's Clothing</a></li>
              <li><a href="#" className="hover:text-gray-900">Accessories</a></li>
              <li><a href="#" className="hover:text-gray-900">Footwear</a></li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Help</h3>
            <ul className="text-gray-600 space-y-2">
              <li><a href="#" className="hover:text-gray-900">Customer Service</a></li>
              <li><a href="#" className="hover:text-gray-900">My Account</a></li>
              <li><a href="#" className="hover:text-gray-900">Find a Store</a></li>
              <li><a href="#" className="hover:text-gray-900">Legal & Privacy</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="text-gray-600 space-y-2">
              <li><a href="#" className="hover:text-gray-900">About Us</a></li>
              <li><a href="#" className="hover:text-gray-900">Careers</a></li>
              <li><a href="#" className="hover:text-gray-900">Press</a></li>
              <li><a href="#" className="hover:text-gray-900">Affiliates</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-gray-500 text-sm text-center">
            © 2025 ShopStyle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer
