
import React, { useState, useEffect, useCallback } from 'react';
import { PerformanceMetric, Funcionario } from '../types';
import { analyzeFeedbackWithGemini } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface GeminiFeedbackAnalyzerProps {
  performanceMetrics: PerformanceMetric[];
  funcionarios: Funcionario[];
}

const GeminiFeedbackAnalyzer: React.FC<GeminiFeedbackAnalyzerProps> = ({ performanceMetrics, funcionarios }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [feedbackToAnalyze, setFeedbackToAnalyze] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employeeFeedback = performanceMetrics
        .filter(pm => pm.employee_id === selectedEmployeeId)
        .map(pm => pm.feedback)
        .join('\n\n---\n\n'); // Combine multiple feedbacks if any
      setFeedbackToAnalyze(employeeFeedback || 'Nenhum feedback encontrado para este funcionário.');
      setAnalysisResult(''); // Clear previous analysis
      setError(null);
    } else {
      setFeedbackToAnalyze('');
      setAnalysisResult('');
    }
  }, [selectedEmployeeId, performanceMetrics]);

  const handleAnalyze = useCallback(async () => {
    if (!feedbackToAnalyze || feedbackToAnalyze === 'Nenhum feedback encontrado para este funcionário.') {
      setError('Nenhum feedback para analisar.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeFeedbackWithGemini(feedbackToAnalyze);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError('Falha ao analisar o feedback.');
    } finally {
      setIsLoading(false);
    }
  }, [feedbackToAnalyze]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Análise de Feedback com IA (Gemini)</h3>
      
      <div className="mb-4">
        <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">
          Selecione o Funcionário:
        </label>
        <select
          id="employee-select"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">-- Selecione --</option>
          {funcionarios.map(f => (
            <option key={f.employee_id} value={f.employee_id}>{f.name} ({f.employee_id})</option>
          ))}
        </select>
      </div>

      {selectedEmployeeId && (
        <>
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-600 mb-1">Feedback Coletado:</h4>
            <textarea
              readOnly
              value={feedbackToAnalyze}
              className="mt-1 block w-full h-32 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm"
              placeholder="Feedback do funcionário selecionado aparecerá aqui..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !feedbackToAnalyze || feedbackToAnalyze === 'Nenhum feedback encontrado para este funcionário.'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? 'Analisando...' : 'Analisar Feedback com Gemini'}
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      
      {isLoading && <div className="mt-4"><LoadingSpinner /></div>}

      {analysisResult && !isLoading && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-md font-medium text-gray-700 mb-2">Resultado da Análise (Gemini):</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-600">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
};

export default GeminiFeedbackAnalyzer;
