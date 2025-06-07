import { Funcionario, Treinamento, PerformanceMetric, TrainingStatus } from '../types';
import { SPREADSHEET_ID } from '../constants';

const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

if (!GOOGLE_SHEETS_API_KEY) {
  console.warn(
    "GOOGLE_SHEETS_API_KEY environment variable is not set. Google Sheets API calls will fail. " +
    "Ensure this key is set and your Google Sheet is public or shared with 'anyone with the link'."
  );
}

const BASE_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

const fetchSheetData = async (range: string): Promise<any[][]> => {
  if (!GOOGLE_SHEETS_API_KEY) {
    const errorMessage = "Erro: Chave de API do Google Sheets não configurada.";
    console.error(errorMessage);
    // Propagate error to UI by throwing it, so views can display an error state.
    throw new Error(errorMessage);
  }

  const url = `${BASE_API_URL}/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorDetails = `Status: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorDetails += ` - ${errorData?.error?.message || 'No additional error message.'}`;
      } catch (jsonError) {
        // Ignore if error response is not JSON
      }
      console.error("Error fetching sheet data for range " + range + ":", errorDetails);
      throw new Error(`Falha ao buscar dados da planilha (${range}): ${errorDetails}. Verifique se a planilha é pública e a chave API é válida.`);
    }
    const data = await response.json();
    return (data.values || []).slice(1); // Remove header row and handle empty sheet
  } catch (error) {
    console.error(`Falha na requisição ou processamento para ${range}:`, error);
    if (error instanceof Error && error.message.startsWith("Falha ao buscar dados da planilha")) {
      throw error; // Re-throw specific errors
    }
    throw new Error(`Erro de rede ou ao processar dados da planilha para ${range}. Verifique a consola para mais detalhes.`);
  }
};

const parseFuncionarios = (data: any[][]): Funcionario[] => {
  return data.map((row, index) => {
    if (row.length < 5) {
      console.warn(`Linha ${index + 2} da planilha 'Funcionários' tem colunas insuficientes. Esperado 5, recebido ${row.length}. Linha:`, row);
      return null; 
    }
    return {
      employee_id: row[0] || `TEMP_ID_${index}`, // Fallback ID if missing
      name: row[1] || 'Nome Indisponível',
      department: row[2] || 'Departamento Indisponível',
      position: row[3] || 'Cargo Indisponível',
      hire_date: row[4] || new Date().toISOString().split('T')[0], // Fallback date
    };
  }).filter(f => f !== null) as Funcionario[];
};

const parseTreinamentos = (data: any[][]): Treinamento[] => {
  return data.map((row, index) => {
    if (row.length < 14) {
      console.warn(`Linha ${index + 2} da planilha 'Treinamentos' tem colunas insuficientes. Esperado 14, recebido ${row.length}. Linha:`, row);
      return null;
    }
    const statusString = row[7] as string;
    const status = Object.values(TrainingStatus).includes(statusString as TrainingStatus) 
                   ? statusString as TrainingStatus 
                   : TrainingStatus.PLANEJADO; // Fallback status

    return {
      training_id: row[0] || `TEMP_TRAINING_ID_${index}`,
      training_name: row[1] || 'Treinamento Indisponível',
      category: row[2] || 'Categoria Indisponível',
      duration_hours: parseFloat(row[3]) || 0,
      cost: parseFloat(row[4]?.replace ? row[4].replace(/[^0-9,.]/g, '').replace(',', '.') : row[4]) || 0,
      provider: row[5] || 'Provedor Indisponível',
      training_date: row[6] || new Date().toISOString().split('T')[0],
      status: status,
      target_audience: row[8] || 'N/A',
      number_of_participants: row[9] ? parseInt(row[9]) : undefined,
      max_participants: row[10] ? parseInt(row[10]) : undefined,
      satisfaction_score: row[11] ? parseFloat(row[11]) : undefined,
      effectiveness_notes: row[12] || '',
      prerequisites: row[13] ? row[13].split(',').map((p: string) => p.trim()) : [],
    };
  }).filter(t => t !== null) as Treinamento[];
};

const parsePerformanceMetrics = (data: any[][]): PerformanceMetric[] => {
  return data.map((row, index) => {
    if (row.length < 7) {
      console.warn(`Linha ${index + 2} da planilha 'Perfomance' tem colunas insuficientes. Esperado 7, recebido ${row.length}. Linha:`, row);
      return null;
    }
    return {
      performance_id: row[0] || `TEMP_PERF_ID_${index}`,
      employee_id: row[1] || 'Func. Desconhecido',
      metric_type: row[2] || 'Métrica Indisponível',
      metric_value: parseFloat(row[3]) || 0,
      metric_date: row[4] || new Date().toISOString().split('T')[0],
      period_type: row[5] || 'N/A',
      feedback: row[6] || '',
    };
  }).filter(pm => pm !== null) as PerformanceMetric[];
};


export const getFuncionarios = async (): Promise<Funcionario[]> => {
  const rawData = await fetchSheetData('Funcionários!A:E'); // Adjust range as needed, A:E covers 5 columns
  return parseFuncionarios(rawData);
};

export const getTreinamentos = async (): Promise<Treinamento[]> => {
  const rawData = await fetchSheetData('Treinamentos!A:N'); // Adjust range, A:N covers 14 columns
  return parseTreinamentos(rawData);
};

export const getPerformanceMetrics = async (): Promise<PerformanceMetric[]> => {
  const rawData = await fetchSheetData('Perfomance!A:G'); // Adjust range, A:G covers 7 columns
  return parsePerformanceMetrics(rawData);
};
