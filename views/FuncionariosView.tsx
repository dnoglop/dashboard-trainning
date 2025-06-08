// src/views/FuncionariosView.tsx

import React, { useEffect, useState, useMemo } from "react";
import { Funcionario, KPIData } from "../types";
import { getFuncionarios } from "../services/dataService";
import Table from "../components/Table";
import LoadingSpinner from "../components/LoadingSpinner";
import ChartWrapper from "../components/ChartWrapper";
import KPICard from "../components/KPICard";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "../constants";
import {
  UsersIcon,
  BuildingOffice2Icon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

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
      } catch (err: any) {
        setError(`Falha ao carregar dados: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const kpiData = useMemo((): KPIData[] => {
    if (!funcionarios.length) return [];
    return [
      {
        title: "Total de Funcionários",
        value: funcionarios.length,
        icon: UsersIcon,
        bgColorClass: "bg-blue-100",
        textColorClass: "text-blue-600",
      },
      {
        title: "Departamentos Únicos",
        value: new Set(funcionarios.map((f) => f.department)).size,
        icon: BuildingOffice2Icon,
        bgColorClass: "bg-purple-100",
        textColorClass: "text-purple-600",
      },
    ];
  }, [funcionarios]);

  const departmentDistribution = useMemo(() => {
    if (!funcionarios.length) return [];
    const counts: Record<string, number> = {};
    funcionarios.forEach((f) => {
      counts[f.department] = (counts[f.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [funcionarios]);

  const funcionarioColumns = [
    {
      key: "name" as keyof Funcionario,
      header: "Nome",
      render: (item: Funcionario) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      ),
    },
    { key: "department" as keyof Funcionario, header: "Departamento" },
    { key: "position" as keyof Funcionario, header: "Cargo" },
    {
      key: "hire_date" as keyof Funcionario,
      header: "Data de Contratação",
      render: (item: Funcionario) =>
        item.hire_date
          ? new Date(item.hire_date).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })
          : "N/A",
    },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Painel de Funcionários
        </h2>
        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150">
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Adicionar Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1">
        <ChartWrapper title="Distribuição por Departamento">
          {departmentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">
              Sem dados para o gráfico.
            </p>
          )}
        </ChartWrapper>
      </div>

      <ChartWrapper title="Lista de Funcionários">
        <Table<Funcionario>
          data={funcionarios}
          columns={funcionarioColumns}
          keyExtractor={(f) => f.employee_id}
        />
      </ChartWrapper>
    </div>
  );
};

export default FuncionariosView;
