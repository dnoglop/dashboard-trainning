// src/components/GeminiTrainingEffectivenessAnalyzer.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Treinamento } from "../types";
import { analyzeFeedbackWithGemini } from "../services/geminiService";
import LoadingSpinner from "./LoadingSpinner";
import ReactMarkdown from "react-markdown";

interface GeminiTrainingEffectivenessAnalyzerProps {
  trainings: Treinamento[];
}

const GeminiTrainingEffectivenessAnalyzer: React.FC<
  GeminiTrainingEffectivenessAnalyzerProps
> = ({ trainings }) => {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [effectivenessNotes, setEffectivenessNotes] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableTrainings = trainings.filter(
    (t) => t.effectiveness_notes && t.effectiveness_notes.trim() !== "",
  );

  useEffect(() => {
    if (selectedTrainingId) {
      const training = availableTrainings.find(
        (t) => t.training_id === selectedTrainingId,
      );
      setEffectivenessNotes(training?.effectiveness_notes || "");
      setAnalysisResult("");
      setError(null);
    } else {
      setEffectivenessNotes("");
      setAnalysisResult("");
    }
  }, [selectedTrainingId, availableTrainings]);

  const handleAnalyze = useCallback(async () => {
    if (!effectivenessNotes.trim()) {
      setError("Nenhuma nota de eficácia para analisar.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Você é um especialista em RH analisando a eficácia de um treinamento corporativo. Com base nas notas a seguir, forneça uma análise estruturada. Use Markdown para formatação (negrito com ** e listas com *).
      Estruture sua resposta com os seguintes tópicos:
      - **Resumo Executivo:** Um parágrafo conciso sobre a eficácia geral.
      - **Pontos Fortes:** Principais sucessos ou resultados positivos observados.
      - **Áreas de Melhoria:** Pontos onde o treinamento pode ser otimizado.
      - **Ações Sugeridas:** Recomendações práticas para futuras sessões.

      **Notas de Eficácia:**
      ---
      ${effectivenessNotes}
      ---
      `;

      const result = await analyzeFeedbackWithGemini(prompt);
      setAnalysisResult(result);
    } catch (e: any) {
      console.error("Erro capturado pelo componente:", e);
      setError(e.message || "Ocorreu uma falha desconhecida na análise.");
    } finally {
      setIsLoading(false);
    }
  }, [effectivenessNotes]);

  if (availableTrainings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Nenhum treinamento com notas de eficácia disponível para análise.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="training-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Selecione o Treinamento:
        </label>
        <select
          id="training-select"
          value={selectedTrainingId}
          onChange={(e) => setSelectedTrainingId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">-- Selecione um Treinamento --</option>
          {availableTrainings.map((t) => (
            <option key={t.training_id} value={t.training_id}>
              {t.training_name} ({t.training_id})
            </option>
          ))}
        </select>
      </div>

      {selectedTrainingId && (
        <>
          <textarea
            readOnly
            value={effectivenessNotes}
            className="w-full h-32 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
          />
          {/* ==================================================================== */}
          {/* CORREÇÃO FINAL: Desabilitando o botão enquanto está carregando */}
          {/* ==================================================================== */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !effectivenessNotes.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Analisando..." : "Analisar Eficácia com Gemini"}
          </button>
        </>
      )}

      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      {isLoading && (
        <div className="mt-4">
          <LoadingSpinner />
        </div>
      )}

      {analysisResult && !isLoading && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Análise do Gemini:
          </h4>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiTrainingEffectivenessAnalyzer;
