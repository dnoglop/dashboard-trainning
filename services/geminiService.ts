// src/services/geminiService.ts

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "VITE_GEMINI_API_KEY não configurada. A análise por IA não funcionará.",
  );
}

interface GeminiResponse {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
    finishReason?: string;
  }>;
  error?: { message: string };
}

export const analyzeFeedbackWithGemini = async (
  promptText: string,
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Erro: Chave de API do Gemini não configurada.");
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    const data: GeminiResponse = await response.json();

    if (!response.ok) {
      console.error("Erro da API Gemini:", data);
      throw new Error(
        `Erro da API Gemini (${response.status}): ${data.error?.message || "Ocorreu um erro desconhecido."}`,
      );
    }

    const candidate = data.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      if (candidate.finishReason === "SAFETY") {
        return "A análise foi bloqueada devido às políticas de segurança do Gemini. Tente reformular as notas.";
      }
      return candidate.content.parts[0].text;
    } else {
      console.warn("Resposta do Gemini sem conteúdo válido:", data);
      return "A análise não pôde ser concluída. A resposta pode ter sido bloqueada ou o modelo pode estar indisponível no momento.";
    }
  } catch (error) {
    console.error("Erro na chamada para o Gemini:", error);
    // Lança o erro para que o componente React possa pegá-lo e parar de carregar.
    // Simplificamos removendo a lógica de retentativa que causava o problema.
    // O erro de cota (429) já foi resolvido esperando, então não precisamos de retentativas automáticas.
    throw error;
  }
};
