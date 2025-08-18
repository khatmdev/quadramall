import React from 'react';
import { FiSearch } from 'react-icons/fi';

const KnowledgeBase: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      {/* Tiêu đề */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-8">Knowledge Base</h2>

      {/* Thanh tìm kiếm nằm dưới tiêu đề */}
      <div className="relative w-full sm:w-320 mb-10">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Các ô Knowledge Base */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-center h-16 mb-2">
            <span className="text-6xl text-gray-500">📄</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">Getting Started</h3>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 text-center">
            <li>Guide to get started</li>
            <li>Video tutorials for beginners</li>
            <li>Move to slot system</li>
            <li>More Tutorials</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-blue-500">
          <div className="flex items-center justify-center h-16 mb-2">
            <span className="text-6xl text-gray-500">👤</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">Personal Settings</h3>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 text-center">
            <li>Setting up your profile</li>
            <li>Changing business name</li>
            <li>Change email address</li>
            <li>More Tutorials</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-center h-16 mb-2">
            <span className="text-6xl text-gray-500">💳</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">Billing</h3>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 text-center">
            <li>Payment declined</li>
            <li>Get refund</li>
            <li>Subscribe</li>
            <li>More Tutorials</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-center h-16 mb-2">
            <span className="text-6xl text-gray-500">🛒</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">Commerce</h3>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 text-center">
            <li>Add products</li>
            <li>Selling guide</li>
            <li>Create categories</li>
            <li>More Tutorials</li>
          </ul>
        </div>
      </div>

      {/* Community Forum và Webinars nằm cùng hàng, căn giữa */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 md:w-1/2 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Forum</h3>
          <p className="text-sm text-gray-600">
            Get answers from community members, ask any questions and join community.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:w-1/2 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Webinars</h3>
          <p className="text-sm text-gray-600">
            Join one of our webinars where you can ask questions live and see a presentation.
          </p>
        </div>
      </div>

      {/* Still Need Help với nút Contact Support */}
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Still Need Help?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get in touch with us and we'll be happy to help you out!
        </p>
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default KnowledgeBase;