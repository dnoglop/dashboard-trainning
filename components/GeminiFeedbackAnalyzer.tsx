// src/components/GeminiFeedbackAnalyzer.tsx

import React, { useState, useEffect, useCallback } from "react";
import { PerformanceMetric, Funcionario } from "../types";
import { analyzeFeedbackWithGemini } from "../services/geminiService";
import LoadingSpinner from "./LoadingSpinner";
// NOVO: Importando o componente de Markdown
import ReactMarkdown from "react-markdown";

interface GeminiFeedbackAnalyzerProps {
  performanceMetrics: PerformanceMetric[];
  availableEmployees: Funcionario[];
}

const GeminiFeedbackAnalyzer: React.FC<GeminiFeedbackAnalyzerProps> = ({
  performanceMetrics,
  availableEmployees,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [feedbackToAnalyze, setFeedbackToAnalyze] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employeeFeedback = performanceMetrics
        .filter(
          (pm) =>
            pm.employee_id === selectedEmployeeId &&
            pm.feedback &&
            pm.feedback.trim() !== "",
        )
        .map(
          (pm) =>
            `Feedback em ${new Date(pm.metric_date).toLocaleDateString("pt-BR")}: "${pm.feedback}"`,
        )
        .join("\n");
      setFeedbackToAnalyze(
        employeeFeedback || "Nenhum feedback encontrado para este funcionário.",
      );
    } else {
      setFeedbackToAnalyze("");
    }
    setAnalysisResult("");
    setError(null);
  }, [selectedEmployeeId, performanceMetrics]);

  const handleAnalyze = useCallback(async () => {
    if (
      !feedbackToAnalyze ||
      feedbackToAnalyze.includes("Nenhum feedback encontrado")
    ) {
      setError("Nenhum feedback para analisar.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const prompt = `Como um analista de RH, analise os seguintes feedbacks de performance para um funcionário. Resuma os pontos chave, identifique temas recorrentes (positivos e negativos) e sugira pontos para discussão em uma reunião de 1-on-1. Formate a resposta com clareza usando Markdown (use ** para negrito e * para listas). Feedbacks:\n\n${feedbackToAnalyze}`;
      const result = await analyzeFeedbackWithGemini(prompt);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError("Falha ao analisar o feedback.");
    } finally {
      setIsLoading(false);
    }
  }, [feedbackToAnalyze]);

  if (availableEmployees.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        Nenhum funcionário com feedback para análise.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="employee-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Selecione o Funcionário:
        </label>
        <select
          id="employee-select"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">-- Selecione --</option>
          {availableEmployees.map((f) => (
            <option key={f.employee_id} value={f.employee_id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployeeId && (
        <>
          <textarea
            readOnly
            value={feedbackToAnalyze}
            className="w-full h-24 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={
              isLoading ||
              !feedbackToAnalyze ||
              feedbackToAnalyze.includes("Nenhum feedback encontrado")
            }
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analisando..." : "Analisar com Gemini"}
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      {isLoading && (
        <div className="mt-4">
          <LoadingSpinner />
        </div>
      )}

      {/* ========================================================= */}
      {/* CORREÇÃO PRINCIPAL: Usando ReactMarkdown para renderizar  */}
      {/* ========================================================= */}
      {analysisResult && !isLoading && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Análise do Gemini:
          </h4>
          {/* A 'div' com a classe 'prose' aplica estilos bonitos para o texto */}
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiFeedbackAnalyzer;
