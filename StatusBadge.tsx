
import React from 'react';
import { TrainingStatus } from '../types';

interface StatusBadgeProps {
  status: TrainingStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';

  switch (status) {
    case TrainingStatus.CONCLUIDO:
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case TrainingStatus.EM_ANDAMENTO:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      break;
    case TrainingStatus.PLANEJADO:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      break;
    case TrainingStatus.CANCELADO:
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
  }

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
