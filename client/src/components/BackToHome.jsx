import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackToHome = () => {
  return (
    <div className="mb-4">
      <Link 
        to="/" 
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-rose-600 bg-white border border-rose-300 rounded-md shadow-sm hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
    </div>
  );
};

export default BackToHome; 