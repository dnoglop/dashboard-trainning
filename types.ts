
export interface Funcionario {
  employee_id: string;
  name: string;
  department: string;
  position: string;
  hire_date: string; 
}

export enum TrainingStatus {
  PLANEJADO = "Planejado",
  EM_ANDAMENTO = "Em Andamento",
  CONCLUIDO = "Concluído",
  CANCELADO = "Cancelado",
}

export interface Treinamento {
  training_id: string; 
  training_name: string;
  category: string;
  duration_hours: number;
  cost: number;
  provider: string;
  training_date: string; // Data de início do treinamento
  status: TrainingStatus;
  target_audience: string; // Ex: "Engenharia", "Marketing", "Todos", "Liderança"
  number_of_participants?: number; // Real
  max_participants?: number; // Planejado
  satisfaction_score?: number; // Ex: 0-5 ou 0-10, opcional
  effectiveness_notes?: string; // Observações qualitativas
  prerequisites?: string[]; // Lista de IDs de treinamentos pré-requisitos ou descrições
}

export interface PerformanceMetric {
  performance_id: string; 
  employee_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  period_type: string;
  feedback: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

// For chart data
export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string; // Optional: for custom colors in charts directly with data
}

export interface KPIData {
  title: string;
  value: string | number;
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  bgColorClass?: string;
  textColorClass?: string;
  change?: string; // e.g. "+5%"
  changeType?: 'positive' | 'negative' | 'neutral';
}
