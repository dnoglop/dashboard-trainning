// src/views/ParticipacaoView.tsx

import React, { useEffect, useState, useMemo } from "react";
import { Enrollment, Funcionario, Treinamento, KPIData } from "../types";
import {
  getEnrollments,
  getFuncionarios,
  getTreinamentos,
} from "../services/dataService";
import Table from "../components/Table";
import LoadingSpinner from "../components/LoadingSpinner";
import ChartWrapper from "../components/ChartWrapper";
import KPICard from "../components/KPICard";
import {
  ClipboardDocumentCheckIcon,
  CheckBadgeIcon,
  XCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const ParticipacaoView: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [enrollData, funcData, trainData] = await Promise.all([
          getEnrollments(),
          getFuncionarios(),
          getTreinamentos(),
        ]);
        setEnrollments(enrollData);
        setFuncionarios(funcData);
        setTreinamentos(trainData);
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
    if (!enrollments.length) return [];
    const totalConcluidos = enrollments.filter(
      (e) => e.completion_status === "Concluído",
    ).length;
    const totalReprovados = enrollments.filter(
      (e) => e.completion_status === "Reprovado",
    ).length;
    return [
      {
        title: "Total de Inscrições",
        value: enrollments.length,
        icon: ClipboardDocumentCheckIcon,
        bgColorClass: "bg-blue-100",
        textColorClass: "text-blue-600",
      },
      {
        title: "Conclusões",
        value: totalConcluidos,
        icon: CheckBadgeIcon,
        bgColorClass: "bg-green-100",
        textColorClass: "text-green-600",
      },
      {
        title: "Reprovações",
        value: totalReprovados,
        icon: XCircleIcon,
        bgColorClass: "bg-red-100",
        textColorClass: "text-red-600",
      },
    ];
  }, [enrollments]);

  const enrollmentColumns = [
    {
      key: "employee_id" as keyof Enrollment,
      header: "Funcionário",
      render: (item: Enrollment) => (
        <span className="font-medium text-gray-900">
          {funcionarios.find((f) => f.employee_id === item.employee_id)?.name ||
            item.employee_id}
        </span>
      ),
    },
    {
      key: "training_id" as keyof Enrollment,
      header: "Treinamento",
      render: (item: Enrollment) =>
        treinamentos.find((t) => t.training_id === item.training_id)
          ?.training_name || item.training_id,
    },
    { key: "completion_status" as keyof Enrollment, header: "Status" },
    { key: "score" as keyof Enrollment, header: "Nota" },
    { key: "date_obtained" as keyof Enrollment, header: "Data de Conclusão" },
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Painel de Participações
        </h2>
        <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150">
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Nova Inscrição
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      <ChartWrapper title="Registros de Participação em Treinamentos">
        <Table<Enrollment>
          data={enrollments}
          columns={enrollmentColumns}
          keyExtractor={(e) => e.enrollment_id}
        />
      </ChartWrapper>
    </div>
  );
};

export default ParticipacaoView;
