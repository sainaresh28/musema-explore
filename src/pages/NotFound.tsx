import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/>
            <path d="M4 10v11"/><path d="M20 10v11"/>
            <path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/>
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! This page doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
