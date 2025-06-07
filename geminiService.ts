
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

// Ensure API_KEY is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable is not set.");
  // Potentially throw an error or handle this state gracefully in the UI
}
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); // Fallback to prevent crash if undefined, but ideally it's always set

export const analyzeFeedbackWithGemini = async (feedbackText: string): Promise<string> => {
  if (!apiKey) {
    return "Erro: Chave de API do Gemini não configurada.";
  }
  try {
    const model = GEMINI_MODEL_NAME;
    const prompt = `Analise o seguinte feedback de funcionário. Forneça um resumo conciso, identifique os principais pontos positivos, áreas de melhoria e o sentimento geral (Positivo, Neutro, Negativo). Formate a resposta de forma clara e organizada. Feedback: "${feedbackText}"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing feedback with Gemini:", error);
    if (error instanceof Error) {
        return `Erro ao analisar feedback: ${error.message}`;
    }
    return "Erro desconhecido ao analisar feedback com Gemini.";
  }
};
