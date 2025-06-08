// src/components/ChartWrapper.tsx

import React from "react";

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ title, children }) => {
  return (
    // Adicionado 'flex flex-col' para melhor controle do layout interno
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>

      {/* ================================================================= */}
      {/* CORREÇÃO PRINCIPAL: Removendo a altura fixa e adicionando uma mínima */}
      {/* 'flex-1' permite que o conteúdo se expanda para preencher o espaço  */}
      {/* ================================================================= */}
      <div className="min-h-[300px] flex-1 flex flex-col">{children}</div>
    </div>
  );
};

export default ChartWrapper;
