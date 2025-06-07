
import React from 'react';

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-72 md:h-96 w-full"> {/* Responsive height for charts */}
        {children}
      </div>
    </div>
  );
};

export default ChartWrapper;
