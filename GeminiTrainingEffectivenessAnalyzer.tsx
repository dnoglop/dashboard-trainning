
import React, { useState, useEffect, useCallback } from 'react';
import { Treinamento } from '../types';
import { analyzeFeedbackWithGemini } from '../services/geminiService'; // Reusing for now, prompt will differ
import LoadingSpinner from './LoadingSpinner';

interface GeminiTrainingEffectivenessAnalyzerProps {
  trainings: Treinamento[];
}

const GeminiTrainingEffectivenessAnalyzer: React.FC<GeminiTrainingEffectivenessAnalyzerProps> = ({ trainings }) => {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [effectivenessNotes, setEffectivenessNotes] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableTrainings = trainings.filter(t => t.effectiveness_notes && t.effectiveness_notes.trim() !== '');

  useEffect(() => {
    if (selectedTrainingId) {
      const training = availableTrainings.find(t => t.training_id === selectedTrainingId);
      setEffectivenessNotes(training?.effectiveness_notes || 'Nenhuma nota de eficácia encontrada para este treinamento.');
      setAnalysisResult(''); 
      setError(null);
    } else {
      setEffectivenessNotes('');
      setAnalysisResult('');
    }
  }, [selectedTrainingId, availableTrainings]);

  const handleAnalyze = useCallback(async () => {
    if (!effectivenessNotes || effectivenessNotes === 'Nenhuma nota de eficácia encontrada para este treinamento.') {
      setError('Nenhuma nota de eficácia para analisar.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Custom prompt for training effectiveness
      const prompt = `Analise as seguintes notas sobre a eficácia de um treinamento. Forneça um resumo conciso, identifique os pontos fortes da eficácia do treinamento, áreas que precisam de melhoria na eficácia, e sugestões para otimizar futuras sessões deste treinamento. Notas de Eficácia: "${effectivenessNotes}"`;
      const result = await analyzeFeedbackWithGemini(prompt); // The service function is generic enough if we pass the full prompt
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError('Falha ao analisar as notas de eficácia.');
    } finally {
      setIsLoading(false);
    }
  }, [effectivenessNotes]);

  if (availableTrainings.length === 0) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Análise de Eficácia de Treinamento com IA (Gemini)</h3>
            <p className="text-gray-500">Nenhum treinamento com notas de eficácia disponível para análise.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Análise de Eficácia de Treinamento com IA (Gemini)</h3>
      
      <div className="mb-4">
        <label htmlFor="training-select" className="block text-sm font-medium text-gray-700 mb-1">
          Selecione o Treinamento:
        </label>
        <select
          id="training-select"
          value={selectedTrainingId}
          onChange={(e) => setSelectedTrainingId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">-- Selecione um Treinamento --</option>
          {availableTrainings.map(t => (
            <option key={t.training_id} value={t.training_id}>{t.training_name} ({t.training_id})</option>
          ))}
        </select>
      </div>

      {selectedTrainingId && (
        <>
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-600 mb-1">Notas de Eficácia Coletadas:</h4>
            <textarea
              readOnly
              value={effectivenessNotes}
              className="mt-1 block w-full h-32 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm"
              placeholder="Notas de eficácia do treinamento selecionado aparecerão aqui..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !effectivenessNotes || effectivenessNotes === 'Nenhuma nota de eficácia encontrada para este treinamento.'}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? 'Analisando...' : 'Analisar Eficácia com Gemini'}
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

export default GeminiTrainingEffectivenessAnalyzer;
