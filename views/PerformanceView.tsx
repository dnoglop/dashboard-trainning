// src/views/PerformanceView.tsx

import React, { useEffect, useState, useMemo } from "react";
import { PerformanceMetric, Funcionario, KPIData } from "../types";
import {
  getPerformanceMetrics,
  getFuncionarios,
} from "../services/dataService";
import Table from "../components/Table";
import LoadingSpinner from "../components/LoadingSpinner";
import ChartWrapper from "../components/ChartWrapper";
import GeminiFeedbackAnalyzer from "../components/GeminiFeedbackAnalyzer";
import KPICard from "../components/KPICard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "../constants";
import {
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

const PerformanceView: React.FC = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployeeIdForChart, setSelectedEmployeeIdForChart] =
    useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [perfData, funcData] = await Promise.all([
          getPerformanceMetrics(),
          getFuncionarios(),
        ]);
        setPerformanceMetrics(perfData);
        setFuncionarios(funcData);
        if (funcData.length > 0) {
          const employeeWithMetrics = funcData.find((f) =>
            perfData.some((pm) => pm.employee_id === f.employee_id),
          );
          setSelectedEmployeeIdForChart(
            employeeWithMetrics ? employeeWithMetrics.employee_id : "",
          );
        }
        setError(null);
      } catch (err: any) {
        setError(`Falha ao carregar dados: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const employeesWithFeedback = useMemo(() => {
    const employeeIdsWithFeedback = new Set(
      performanceMetrics
        .filter((pm) => pm.feedback && pm.feedback.trim() !== "")
        .map((pm) => pm.employee_id),
    );
    return funcionarios.filter((f) =>
      employeeIdsWithFeedback.has(f.employee_id),
    );
  }, [performanceMetrics, funcionarios]);

  const kpiData = useMemo((): KPIData[] => {
    return [
      {
        title: "Total de Métricas",
        value: performanceMetrics.length,
        icon: ClipboardDocumentListIcon,
        bgColorClass: "bg-teal-100",
        textColorClass: "text-teal-600",
      },
      {
        title: "Feedbacks para Análise",
        value: employeesWithFeedback.length,
        icon: ChatBubbleLeftEllipsisIcon,
        bgColorClass: "bg-orange-100",
        textColorClass: "text-orange-600",
      },
    ];
  }, [performanceMetrics, employeesWithFeedback]);

  const performanceTrendData = useMemo(() => {
    if (!selectedEmployeeIdForChart) return [];
    return performanceMetrics
      .filter((pm) => pm.employee_id === selectedEmployeeIdForChart)
      .sort(
        (a, b) =>
          new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime(),
      )
      .map((pm) => ({
        date: new Date(pm.metric_date).toLocaleDateString("pt-BR", {
          month: "short",
          timeZone: "UTC",
        }),
        value: pm.metric_value,
        type: pm.metric_type,
      }));
  }, [performanceMetrics, selectedEmployeeIdForChart]);

  const performanceColumns = [
    {
      key: "employee_id" as keyof PerformanceMetric,
      header: "Funcionário",
      render: (item: PerformanceMetric) => (
        <span className="font-medium text-gray-900">
          {funcionarios.find((f) => f.employee_id === item.employee_id)?.name ||
            item.employee_id}
        </span>
      ),
    },
    { key: "metric_type" as keyof PerformanceMetric, header: "Métrica" },
    { key: "metric_value" as keyof PerformanceMetric, header: "Valor" },
    {
      key: "metric_date" as keyof PerformanceMetric,
      header: "Data",
      render: (item: PerformanceMetric) =>
        new Date(item.metric_date).toLocaleDateString("pt-BR", {
          timeZone: "UTC",
        }),
    },
    {
      key: "feedback" as keyof PerformanceMetric,
      header: "Feedback",
      render: (item: PerformanceMetric) => (
        <p className="w-40 truncate" title={item.feedback}>
          {item.feedback || "–"}
        </p>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Painel de Performance
        </h2>
        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150">
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Adicionar Métrica
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      {/* ================================================================= */}
      {/* CORREÇÃO PRINCIPAL: Adicionando uma nova div de grid para a tabela */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartWrapper title="Análise de Feedback com IA (Gemini)">
          <GeminiFeedbackAnalyzer
            performanceMetrics={performanceMetrics}
            availableEmployees={employeesWithFeedback}
          />
        </ChartWrapper>

        <ChartWrapper title="Tendência de Performance Individual">
          <select
            value={selectedEmployeeIdForChart}
            onChange={(e) => setSelectedEmployeeIdForChart(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">-- Selecione para o Gráfico --</option>
            {funcionarios.map((f) => (
              <option key={f.employee_id} value={f.employee_id}>
                {f.name}
              </option>
            ))}
          </select>
          {performanceTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={performanceTrendData[0]?.type || "Valor"}
                  stroke={CHART_COLORS[2]}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">
              Sem dados de tendência para este funcionário.
            </p>
          )}
        </ChartWrapper>
      </div>

      {/* Esta div agora garante que a tabela fique em uma nova linha, abaixo dos outros elementos */}
      <div className="grid grid-cols-1">
        <ChartWrapper title="Registros de Performance">
          <Table<PerformanceMetric>
            data={performanceMetrics}
            columns={performanceColumns}
            keyExtractor={(pm) =>
              `${pm.employee_id}-${pm.metric_type}-${pm.metric_date}`
            }
          />
        </ChartWrapper>
      </div>
    </div>
  );
};

export default PerformanceView;
