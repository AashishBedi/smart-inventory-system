
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryStats, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getInventoryInsights(stats: InventoryStats[]): Promise<AIInsight[]> {
  try {
    const prompt = `
      Analyze this real-time flash sale inventory state and provide strategic recommendations for each SKU.
      Current Inventory Stats:
      ${JSON.stringify(stats)}

      Identify high demand items, risk of stockout, and suggest if restock or price adjustment is needed.
      Provide output as a JSON array of objects with fields: sku, recommendation, riskLevel (low/medium/high).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sku: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
            },
            required: ["sku", "recommendation", "riskLevel"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Insight Error:", error);
    return stats.map(s => ({
      sku: s.sku,
      recommendation: "Unable to generate insights at this time.",
      riskLevel: "low" as const
    }));
  }
}
