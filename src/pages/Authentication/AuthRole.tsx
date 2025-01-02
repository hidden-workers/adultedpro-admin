import React from 'react';
import { Link } from 'react-router-dom';
import useMobile from '../../hooks/useMobile';

export const AuthRole: React.FC = () => {
  const [isMobile] = useMobile();

  return (
    <div
      style={{ height: 'calc(100vh - 7rem)' }}
      className="flex justify-center items-center h-screen bg-white px-4 sm:px-0"
    >
      <div
        className={`flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 ${
          isMobile ? 'mt-20' : ''
        }`}
      >
        <Link
          to="/institution/signin"
          className={`text-xl sm:text-2xl font-medium text-black bg-white rounded flex justify-center items-center border border-stroke shadow-lg hover:scale-105 hover:shadow-xl hover:bg-[#1C2434] hover:text-white transition p-4 ${
            isMobile ? 'w-50 h-50' : 'w-full sm:w-80 h-80'
          }`}
        >
          Institution Sign In
        </Link>

        <Link
          to="/employer/signin"
          className={`text-xl sm:text-2xl font-medium text-black bg-white rounded flex justify-center items-center border border-stroke shadow-lg hover:scale-105 hover:shadow-xl hover:bg-[#1C2434] hover:text-white transition p-4 ${
            isMobile ? 'w-50 h-50' : 'w-full sm:w-80 h-80'
          }`}
        >
          Employer Sign In
        </Link>
      </div>
    </div>
  );
};
