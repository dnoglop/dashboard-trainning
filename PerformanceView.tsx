import React, { useEffect, useState, useMemo } from 'react';
import { PerformanceMetric, Funcionario, KPIData } from '../types';
import { getPerformanceMetrics, getFuncionarios } from '../services/dataService';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartWrapper from '../components/ChartWrapper';
import GeminiFeedbackAnalyzer from '../components/GeminiFeedbackAnalyzer';
import KPICard from '../components/KPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '../constants';
import { PlusCircleIcon, ClipboardDocumentListIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const PerformanceView: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployeeIdForChart, setSelectedEmployeeIdForChart] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [perfData, funcData] = await Promise.all([
          getPerformanceMetrics(),
          getFuncionarios()
        ]);
        setPerformanceMetrics(perfData);
        setFuncionarios(funcData);
        if (funcData.length > 0 && perfData.length > 0) {
            // Try to find an employee who has performance metrics for the chart
            const employeeWithMetrics = funcData.find(f => perfData.some(pm => pm.employee_id === f.employee_id));
            setSelectedEmployeeIdForChart(employeeWithMetrics ? employeeWithMetrics.employee_id : funcData[0].employee_id);
        } else if (funcData.length > 0) {
            setSelectedEmployeeIdForChart(funcData[0].employee_id);
        }
        setError(null);
      } catch (err) {
        setError('Falha ao carregar dados de performance.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const kpiData = useMemo((): KPIData[] => {
    const totalMetricas = performanceMetrics.length;
    const distinctEmployeesWithFeedback = new Set(
        performanceMetrics.filter(pm => pm.feedback && pm.feedback.trim() !== '').map(pm => pm.employee_id)
    ).size;

    return [
      { title: 'Total de Métricas', value: totalMetricas, icon: ClipboardDocumentListIcon, bgColorClass: 'bg-teal-50', textColorClass: 'text-teal-500' },
      { title: 'Feedbacks para Análise', value: distinctEmployeesWithFeedback, icon: ChatBubbleLeftEllipsisIcon, bgColorClass: 'bg-orange-50', textColorClass: 'text-orange-500' },
    ];
  }, [performanceMetrics]);

  const performanceTrendData = useMemo(() => {
    if (!selectedEmployeeIdForChart || !performanceMetrics.length) return [];
    
    return performanceMetrics
      .filter(pm => pm.employee_id === selectedEmployeeIdForChart)
      .sort((a,b) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime())
      .map(pm => ({
        date: new Date(pm.metric_date).toLocaleDateString('pt-BR', {month: 'short', year: 'numeric', timeZone: 'UTC'}),
        value: pm.metric_value,
        metricType: pm.metric_type,
      }));
  }, [performanceMetrics, selectedEmployeeIdForChart]);


  const performanceColumns = [
    { key: 'employee_id' as keyof PerformanceMetric, header: 'Funcionário', render: (item: PerformanceMetric) => funcionarios.find(f => f.employee_id === item.employee_id)?.name || item.employee_id },
    { key: 'metric_type' as keyof PerformanceMetric, header: 'Tipo de Métrica' },
    { key: 'metric_value' as keyof PerformanceMetric, header: 'Valor' },
    { key: 'metric_date' as keyof PerformanceMetric, header: 'Data da Métrica', render: (item: PerformanceMetric) => new Date(item.metric_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) },
    { key: 'period_type' as keyof PerformanceMetric, header: 'Período' },
    { key: 'feedback' as keyof PerformanceMetric, header: 'Feedback', render: (item: PerformanceMetric) => <p className="truncate w-64" title={item.feedback}>{item.feedback || 'N/A'}</p>},
  ];

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <p className="text-red-500 p-8">{error}</p>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Painel de Performance</h2>
         <button
            onClick={() => alert('Funcionalidade "Adicionar Nova Métrica" em desenvolvimento!')}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Adicionar Nova Métrica
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map(kpi => <KPICard key={kpi.title} kpi={kpi} />)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <GeminiFeedbackAnalyzer performanceMetrics={performanceMetrics} funcionarios={funcionarios} />
        </div>
        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tendência de Performance Individual</h3>
            <div className="mb-4">
                <label htmlFor="employee-chart-select" className="block text-sm font-medium text-gray-700 mb-1">
                Selecione o Funcionário para o Gráfico:
                </label>
                <select
                id="employee-chart-select"
                value={selectedEmployeeIdForChart}
                onChange={(e) => setSelectedEmployeeIdForChart(e.target.value)}
                disabled={funcionarios.length === 0}
                className="mt-1 block w-full md:w-2/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm disabled:bg-gray-100"
                >
                <option value="">-- Selecione --</option>
                {funcionarios.map(f => (
                    <option key={f.employee_id} value={f.employee_id}>{f.name} ({f.employee_id})</option>
                ))}
                </select>
            </div>
            {selectedEmployeeIdForChart && funcionarios.length > 0 ? (
                <ChartWrapper title={`Tendência de Métricas para ${funcionarios.find(f=>f.employee_id === selectedEmployeeIdForChart)?.name || 'Funcionário'}`}>
                {performanceTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" name={performanceTrendData[0]?.metricType || "Métrica"} stroke={CHART_COLORS[2]} activeDot={{ r: 8 }} />
                    </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-gray-500 text-center py-4">Sem dados de tendência para o funcionário selecionado.</p>}
                </ChartWrapper>
            ): (
                 <div className="bg-white p-6 rounded-lg shadow-lg min-h-[300px] flex items-center justify-center">
                    <p className="text-gray-500 text-center py-4">{funcionarios.length === 0 ? "Nenhum funcionário disponível." : "Selecione um funcionário para ver a tendência."}</p>
                 </div>
            )}
        </div>
      </div>


      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Todas as Métricas de Performance</h3>
        <Table<PerformanceMetric>
          data={performanceMetrics}
          columns={performanceColumns}
          keyExtractor={(pm) => pm.performance_id}
        />
      </div>
    </div>
  );
};

export default PerformanceView;