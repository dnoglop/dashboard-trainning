
import React, { useEffect, useState, useMemo } from 'react';
import { Treinamento, ChartDataItem, KPIData, TrainingStatus } from '../types';
import { getTreinamentos } from '../services/dataService';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartWrapper from '../components/ChartWrapper';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
import GeminiTrainingEffectivenessAnalyzer from '../components/GeminiTrainingEffectivenessAnalyzer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { CHART_COLORS } from '../constants';
import { CurrencyDollarIcon, CheckCircleIcon, UsersIcon, SparklesIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const TreinamentosView: React.FC = () => {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getTreinamentos();
        setTreinamentos(data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar dados dos treinamentos.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const kpiData = useMemo((): KPIData[] => {
    if (!treinamentos.length) return [];
    
    const totalInvestimento = treinamentos.reduce((sum, t) => sum + t.cost, 0);
    const concluidos = treinamentos.filter(t => t.status === TrainingStatus.CONCLUIDO);
    const totalConcluidos = concluidos.length;
    
    const comSatisfacao = concluidos.filter(t => typeof t.satisfaction_score === 'number');
    const mediaSatisfacao = comSatisfacao.length > 0 
      ? (comSatisfacao.reduce((sum, t) => sum + t.satisfaction_score!, 0) / comSatisfacao.length).toFixed(1) + '/5' 
      : 'N/A';

    const comParticipantes = treinamentos.filter(t => typeof t.number_of_participants === 'number' && typeof t.max_participants === 'number' && t.max_participants! > 0);
    const taxaOcupacaoMedia = comParticipantes.length > 0
      ? ((comParticipantes.reduce((sum, t) => sum + (t.number_of_participants! / t.max_participants!), 0) / comParticipantes.length) * 100).toFixed(0) + '%'
      : 'N/A';

    return [
      { title: 'Investimento Total', value: `R$ ${totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CurrencyDollarIcon, bgColorClass: 'bg-blue-50', textColorClass: 'text-blue-500' },
      { title: 'Treinamentos Concluídos', value: totalConcluidos, icon: CheckCircleIcon, bgColorClass: 'bg-green-50', textColorClass: 'text-green-500' },
      { title: 'Média de Satisfação', value: mediaSatisfacao, icon: SparklesIcon, bgColorClass: 'bg-yellow-50', textColorClass: 'text-yellow-500' },
      { title: 'Taxa de Ocupação Média', value: taxaOcupacaoMedia, icon: UsersIcon, bgColorClass: 'bg-indigo-50', textColorClass: 'text-indigo-500' },
    ];
  }, [treinamentos]);

  const trainingStatusDistribution = useMemo(() => {
    if (!treinamentos.length) return [];
    const counts: Record<string, number> = {};
    Object.values(TrainingStatus).forEach(status => counts[status] = 0); // Initialize all statuses
    treinamentos.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [treinamentos]);

  const costByCategory = useMemo(() => {
    if (!treinamentos.length) return [];
    const costs: Record<string, number> = {};
    treinamentos.forEach(t => {
      costs[t.category] = (costs[t.category] || 0) + t.cost;
    });
    return Object.entries(costs).map(([name, value]) => ({ name, value }));
  }, [treinamentos]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

  const treinamentoColumns = [
    { key: 'training_name' as keyof Treinamento, header: 'Nome do Treinamento', render: (item:Treinamento) => <span className="font-medium">{item.training_name}</span> },
    { key: 'status' as keyof Treinamento, header: 'Status', render: (item: Treinamento) => <StatusBadge status={item.status} /> },
    { key: 'category' as keyof Treinamento, header: 'Categoria' },
    { key: 'target_audience' as keyof Treinamento, header: 'Público Alvo', render: (item: Treinamento) => <span className="text-sm text-gray-600">{item.target_audience}</span> },
    { key: 'participants' as keyof Treinamento, header: 'Participantes', render: (item: Treinamento) => 
        (typeof item.number_of_participants === 'number' && typeof item.max_participants === 'number') 
        ? `${item.number_of_participants}/${item.max_participants}` 
        : (item.max_participants ? `Ate ${item.max_participants}` : 'N/A')
    },
    { key: 'duration_hours' as keyof Treinamento, header: 'Duração (H)' },
    { key: 'cost' as keyof Treinamento, header: 'Custo', render: (item: Treinamento) => `R$ ${item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { key: 'satisfaction_score' as keyof Treinamento, header: 'Satisfação', render: (item: Treinamento) => item.satisfaction_score ? `${item.satisfaction_score}/5` : 'N/A' },
    { key: 'provider' as keyof Treinamento, header: 'Provedor' },
    { key: 'training_date' as keyof Treinamento, header: 'Data', render: (item: Treinamento) => formatDate(item.training_date) },
  ];

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;
  if (error) return <p className="text-red-500 p-8">{error}</p>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Painel de Treinamentos</h2>
        <button
            onClick={() => alert('Funcionalidade "Adicionar Novo Treinamento" em desenvolvimento!')}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Adicionar Novo Treinamento
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map(kpi => <KPICard key={kpi.title} kpi={kpi} />)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <ChartWrapper title="Distribuição de Status dos Treinamentos">
            {trainingStatusDistribution.filter(d => d.value > 0).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={trainingStatusDistribution.filter(d => d.value > 0)} // Only show statuses with count > 0
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                    {trainingStatusDistribution.filter(d => d.value > 0).map((entry, index) => {
                        let color = CHART_COLORS[index % CHART_COLORS.length];
                        if (entry.name === TrainingStatus.CONCLUIDO) color = '#00C49F'; // Green
                        if (entry.name === TrainingStatus.EM_ANDAMENTO) color = '#FFBB28'; // Yellow
                        if (entry.name === TrainingStatus.PLANEJADO) color = '#0088FE'; // Blue
                        if (entry.name === TrainingStatus.CANCELADO) color = '#FF8042'; // Orange/Red
                        return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : <p className="text-gray-500 text-center">Sem dados para o gráfico de status.</p>}
            </ChartWrapper>
        </div>
        <div className="lg:col-span-2">
            <ChartWrapper title="Custo Total por Categoria de Treinamento">
            {costByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costByCategory} margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={70} />
                    <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                    <Tooltip formatter={(value: number) => `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <Legend />
                    <Bar dataKey="value" name="Custo Total" fill={CHART_COLORS[1]} />
                </BarChart>
                </ResponsiveContainer>
            ) : <p className="text-gray-500 text-center">Sem dados para o gráfico de custos.</p>}
            </ChartWrapper>
        </div>
      </div>

      <GeminiTrainingEffectivenessAnalyzer trainings={treinamentos} />

      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Lista Detalhada de Treinamentos</h3>
        <Table<Treinamento>
          data={treinamentos}
          columns={treinamentoColumns}
          keyExtractor={(t) => t.training_id}
        />
      </div>
    </div>
  );
};

export default TreinamentosView;
