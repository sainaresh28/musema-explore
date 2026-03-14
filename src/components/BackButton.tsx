import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Props {
  fallbackPath?: string;
  label?: string;
}

const BackButton: React.FC<Props> = ({ fallbackPath = '/', label = 'Back' }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackPath);
  };
  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className="inline-flex items-center border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
};

export default BackButton;
