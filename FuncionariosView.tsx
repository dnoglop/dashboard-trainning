import React, { useEffect, useState, useMemo } from 'react';
import { Funcionario, ChartDataItem, KPIData } from '../types';
import { getFuncionarios } from '../services/dataService';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartWrapper from '../components/ChartWrapper';
import KPICard from '../components/KPICard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '../constants';
import { UsersIcon, BuildingOffice2Icon, PlusCircleIcon } from '@heroicons/react/24/outline';

const FuncionariosView: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getFuncionarios();
        setFuncionarios(data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar dados dos funcionários.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const kpiData = useMemo((): KPIData[] => {
    const totalFuncionarios = funcionarios.length;
    const numDepartamentos = new Set(funcionarios.map(f => f.department)).size;

    return [
      { title: 'Total de Funcionários', value: totalFuncionarios, icon: UsersIcon, bgColorClass: 'bg-blue-50', textColorClass: 'text-blue-500' },
      { title: 'Número de Departamentos', value: numDepartamentos, icon: BuildingOffice2Icon, bgColorClass: 'bg-purple-50', textColorClass: 'text-purple-500' },
    ];
  }, [funcionarios]);

  const departmentDistribution = useMemo(() => {
    if (!funcionarios.length) return [];
    const counts: Record<string, number> = {};
    funcionarios.forEach(f => {
      counts[f.department] = (counts[f.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [funcionarios]);

  const funcionarioColumns = [
    { key: 'employee_id' as keyof Funcionario, header: 'ID' },
    { key: 'name' as keyof Funcionario, header: 'Nome' },
    { key: 'department' as keyof Funcionario, header: 'Departamento' },
    { key: 'position' as keyof Funcionario, header: 'Cargo' },
    { key: 'hire_date' as keyof Funcionario, header: 'Data de Contratação', render: (item: Funcionario) => item.hire_date ? new Date(item.hire_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A' },
  ];

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <p className="text-red-500 p-8">{error}</p>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Painel de Funcionários</h2>
        <button
            onClick={() => alert('Funcionalidade "Adicionar Novo Funcionário" em desenvolvimento!')}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Adicionar Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map(kpi => <KPICard key={kpi.title} kpi={kpi} />)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Simplified grid for now */}
        <ChartWrapper title="Distribuição por Departamento">
          {departmentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-4">Nenhum dado disponível para o gráfico.</p>}
        </ChartWrapper>
        
        {/* Placeholder for another chart or summary if needed in the future */}
        {/* <div className="bg-white p-6 rounded-lg shadow-lg">
           <h3 className="text-xl font-semibold text-gray-700 mb-4">Outro Resumo/Gráfico</h3>
           <p className="text-gray-500 text-center py-4">Conteúdo futuro aqui.</p>
        </div> */}
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Lista de Funcionários</h3>
        <Table<Funcionario>
          data={funcionarios}
          columns={funcionarioColumns}
          keyExtractor={(f) => f.employee_id}
        />
      </div>
    </div>
  );
};

export default FuncionariosView;