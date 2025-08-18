import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ShoppingCartLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content container */}
      <div className="max-w-8xl mx-auto px-4 pb-8">
        {children}
      </div>
    </div>
  );
};

export default ShoppingCartLayout;
