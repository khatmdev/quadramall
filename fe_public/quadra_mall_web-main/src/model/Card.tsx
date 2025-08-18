import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hasShadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hasShadow = true,
}) => {
  const shadowStyle = hasShadow ? 'shadow-md' : '';

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${shadowStyle} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
