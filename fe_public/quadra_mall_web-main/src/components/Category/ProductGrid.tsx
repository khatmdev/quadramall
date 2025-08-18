import React from 'react';

interface ProductGridProps {
  children: React.ReactNode;
}

const ProductGrid: React.FC<ProductGridProps> = ({ children }) => (
  <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
    {children}
  </div>
);

export default ProductGrid;
