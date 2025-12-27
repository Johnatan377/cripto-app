
import { GoogleGenAI, Type } from "@google/genai";
import { PortfolioData, Asset, AnalysisResult } from "../types";

// Always initialize the GoogleGenAI client right before making an API call 
// to ensure the most up-to-date API key is used.

export const analyzePortfolioWithGemini = async (portfolio: PortfolioData[]): Promise<string> => {
  if (!process.env.API_KEY) return "API Key not found.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const portfolioSummary = portfolio.map(p => 
    `- ${p.name}: ${p.quantity} units, $${p.totalValue.toFixed(2)}, Allocation: ${p.allocation.toFixed(1)}%, PnL: ${p.pnlPercentage.toFixed(2)}%`
  ).join('\n');

  const prompt = `Analise este portfólio de criptomoedas em Português: \n\n${portfolioSummary}\n\nForneça uma análise de risco (1-10), verificação de diversificação e 3 sugestões acionáveis.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex reasoning task
      contents: prompt,
    });
    // The response.text property is a getter, not a method.
    return response.text || "Análise indisponível.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a IA.";
  }
};

export const analyzePortfolio = async (assets: Asset[]): Promise<AnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const portfolioSummary = assets.map(a => `- ${a.name}: ${a.amount} units, $${a.currentPrice}`).join('\n');
    const prompt = `Analyze this portfolio and provide: riskScore (1-10), marketSentiment, summary, suggestions (array). \n\n${portfolioSummary}`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", // Complex reasoning task
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        riskScore: { type: Type.INTEGER },
                        marketSentiment: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["riskScore", "marketSentiment", "summary", "suggestions"]
                }
            }
        });
        // The response.text property is a getter, not a method.
        return response.text ? JSON.parse(response.text) : {
            riskScore: 0,
            marketSentiment: "Unknown",
            summary: "Analysis failed",
            suggestions: []
        };
    } catch (error) {
        console.error("Analysis failed", error);
        throw error;
    }
};
