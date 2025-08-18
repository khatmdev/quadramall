import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-1 shrink-0">
      <div className="bg-green-900 text-white rounded w-10 h-10 flex items-center justify-center text-xs font-bold">
        <span className='text-xl'>Q</span>
      </div>
      <span className="text-2xl font-medium text-white">QuadraMall</span>
    </Link>
  );
};

export default Logo;