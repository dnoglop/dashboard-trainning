// src/types.ts

// --- Tipos Principais Baseados nas Suas Planilhas ---

export interface Funcionario {
  employee_id: string;
  name: string;
  department: string;
  position: string;
  hire_date: string;
  last_training_dat: string;
  total_training_hours: number;
}

export enum TrainingStatus {
  CONCLUIDO = "Concluído",
  EM_ANDAMENTO = "Em Andamento",
  AGENDADO = "Agendado",
  CANCELADO = "Cancelado",
  REPROVADO = "Reprovado",
}

export interface Treinamento {
  training_id: string;
  training_name: string;
  category: string;
  duration_hours: number;
  cost: number;
  provider: string;
  training_date: string;
  status: TrainingStatus;
  target_audience: string;
  number_of_participants?: number;
  max_participants?: number;
  effectiveness_notes: string;
  prerequisites: string[];
}

export interface PerformanceMetric {
  employee_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  period_type: string;
  feedback: string;
}

export interface Enrollment {
  enrollment_id: string;
  employee_id: string;
  training_id: string;
  enrollment_date: string;
  completion_status: string;
  date_obtained: string;
  score: string;
}

// --- Tipos Auxiliares para a UI ---

export interface KPIData {
  title: string;
  value: string | number;
  icon: React.ElementType;
  bgColorClass: string;
  textColorClass: string;
}
