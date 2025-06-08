
import React from 'react';
import { KPIData } from '../types';

interface KPICardProps {
  kpi: KPIData;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const IconComponent = kpi.icon;

  let changeColorClass = 'text-gray-500';
  if (kpi.changeType === 'positive') changeColorClass = 'text-green-500';
  if (kpi.changeType === 'negative') changeColorClass = 'text-red-500';
  
  return (
    <div className={`p-5 rounded-xl shadow-lg flex items-start space-x-4 ${kpi.bgColorClass || 'bg-white'}`}>
      {IconComponent && (
        <div className={`p-3 rounded-full ${kpi.textColorClass ? kpi.textColorClass.replace('text-', 'bg-').replace('-500', '-100') : 'bg-gray-100'}`}>
          <IconComponent className={`h-6 w-6 ${kpi.textColorClass || 'text-gray-600'}`} />
        </div>
      )}
      <div>
        <p className={`text-sm font-medium ${kpi.textColorClass ? kpi.textColorClass.replace('-500', '-700') : 'text-gray-500'}`}>
          {kpi.title}
        </p>
        <p className={`text-3xl font-bold ${kpi.textColorClass || 'text-gray-800'}`}>
          {kpi.value}
        </p>
        {kpi.change && (
          <p className={`text-xs ${changeColorClass}`}>
            {kpi.change}
          </p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
