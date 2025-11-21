import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from '../types';

// Ensure API Key is available
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const suggestCategory = async (description: string): Promise<string> => {
  if (!API_KEY) return 'Other';
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize this transaction description into one of these exact categories: 'Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities', 'Entertainment', 'Health & Wellness', 'Salary', 'Investment', 'Other'. 
      
      Description: "${description}"
      
      Return only the category name as a plain string.`,
    });
    
    const text = response.text?.trim();
    return text || 'Other';
  } catch (error) {
    console.error("Gemini categorization failed:", error);
    return 'Other';
  }
};

export const analyzeFinances = async (transactions: Transaction[], dailyLimit: number, currency: string): Promise<{ title: string; message: string; tone: 'positive' | 'warning' | 'neutral' }> => {
  if (!API_KEY) {
    return {
      title: "Welcome",
      message: "Add your API Key to enable AI insights.",
      tone: "neutral"
    };
  }

  try {
    // Summarize data for the prompt to save tokens
    const recentTransactions = transactions.slice(0, 20);
    const summary = JSON.stringify(recentTransactions.map(t => ({
      t: t.type,
      a: t.amount,
      c: t.category,
      d: t.date
    })));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these recent financial transactions and the user's daily spending limit of ${currency}${dailyLimit}.
      Transactions (JSON): ${summary}

      Provide a short, helpful insight or tip (max 2 sentences). 
      Determine the tone: 'positive' (good habits), 'warning' (overspending), or 'neutral'.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            message: { type: Type.STRING },
            tone: { type: Type.STRING, enum: ['positive', 'warning', 'neutral'] }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
        title: result.title || "Financial Update",
        message: result.message || "Keep tracking your expenses to stay on top of your budget.",
        tone: result.tone || "neutral"
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      title: "Analysis Unavailable",
      message: "Could not generate insights at this moment.",
      tone: "neutral"
    };
  }
};