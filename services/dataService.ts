// src/services/dataService.ts

import {
  Funcionario,
  Treinamento,
  PerformanceMetric,
  Enrollment,
  TrainingStatus,
} from "../types";

const SPREADSHEET_ID = "1vXXOEjtkYtFzfC6sAnyDqp9QUvUUK0tAC23QAOowo_c"; // ID da sua planilha
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

if (!GOOGLE_SHEETS_API_KEY) {
  console.error("ERRO CRÍTICO: VITE_GOOGLE_SHEETS_API_KEY não foi encontrada.");
}

const BASE_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

const fetchSheetData = async (range: string): Promise<any[][]> => {
  if (!GOOGLE_SHEETS_API_KEY)
    throw new Error("Chave de API do Google Sheets não configurada.");
  const url = `${BASE_API_URL}/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Falha ao buscar dados (${range}): ${errorData?.error?.message}`,
    );
  }
  const data = await response.json();
  return (data.values || []).slice(1);
};

// --- PARSERS FINAIS E CORRIGIDOS ---

const parseFuncionarios = (data: any[][]): Funcionario[] => {
  return data
    .map((row) => {
      if (row.length < 5) return null;
      return {
        employee_id: row[0],
        name: row[1],
        department: row[2],
        position: row[3],
        hire_date: row[4],
        last_training_dat: row[5],
        total_training_hours: parseInt(row[6]) || 0,
      };
    })
    .filter((f) => f !== null) as Funcionario[];
};

const parseTreinamentos = (data: any[][]): Treinamento[] => {
  return data
    .map((row) => {
      if (row.length < 13) return null;
      const statusString = row[7] as string;
      const status = Object.values(TrainingStatus).includes(
        statusString as TrainingStatus,
      )
        ? (statusString as TrainingStatus)
        : TrainingStatus.AGENDADO;
      return {
        training_id: row[0],
        training_name: row[1],
        category: row[2],
        duration_hours: parseFloat(row[3]) || 0,
        cost:
          parseFloat(
            row[4]?.replace
              ? row[4].replace(/[^0-9,.]/g, "").replace(",", ".")
              : row[4],
          ) || 0,
        provider: row[5],
        training_date: row[6],
        status: status,
        target_audience: row[8],
        number_of_participants: row[9] ? parseInt(row[9]) : undefined,
        max_participants: row[10] ? parseInt(row[10]) : undefined,
        effectiveness_notes: row[11],
        prerequisites: row[12]
          ? row[12].split(",").map((p: string) => p.trim())
          : [],
      };
    })
    .filter((t) => t !== null) as Treinamento[];
};

const parsePerformanceMetrics = (data: any[][]): PerformanceMetric[] => {
  return data
    .map((row) => {
      if (row.length < 6) return null;
      return {
        employee_id: row[0],
        metric_type: row[1],
        metric_value: parseFloat(String(row[2]).replace("%", "")) || 0,
        metric_date: row[3],
        period_type: row[4],
        feedback: row[5],
      };
    })
    .filter((pm) => pm !== null) as PerformanceMetric[];
};

const parseEnrollments = (data: any[][]): Enrollment[] => {
  return data
    .map((row) => {
      if (row.length < 7) return null;
      return {
        enrollment_id: row[0],
        employee_id: row[1],
        training_id: row[2],
        enrollment_date: row[3],
        completion_status: row[4],
        date_obtained: row[5],
        score: row[6],
      };
    })
    .filter((e) => e !== null) as Enrollment[];
};

// --- FUNÇÕES DE EXPORTAÇÃO FINAIS ---

export const getFuncionarios = async (): Promise<Funcionario[]> => {
  const rawData = await fetchSheetData("Funcionários!A:G");
  return parseFuncionarios(rawData);
};

export const getTreinamentos = async (): Promise<Treinamento[]> => {
  const rawData = await fetchSheetData("Treinamentos!A:M");
  return parseTreinamentos(rawData);
};

export const getPerformanceMetrics = async (): Promise<PerformanceMetric[]> => {
  const rawData = await fetchSheetData("Perfomance!A:F");
  return parsePerformanceMetrics(rawData);
};

export const getEnrollments = async (): Promise<Enrollment[]> => {
  const rawData = await fetchSheetData("Participacao_Treinamentos!A:G");
  return parseEnrollments(rawData);
};
