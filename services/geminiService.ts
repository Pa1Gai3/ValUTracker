import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult, BudgetCategory } from "../types";

// We will use a singleton instance pattern for the service to manage the API key and client
class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async parseTransactionText(text: string, existingCategories: BudgetCategory[]): Promise<AIParseResult> {
    const model = "gemini-2.5-flash";
    const categoryNames = existingCategories.map(c => c.name).join(", ");
    
    const prompt = `
      Analyze the following transaction text.
      Extract the merchant/description, amount, date (YYYY-MM-DD), and infer the best category name and type.
      
      Context: User is in India. Currency is INR (₹).
      
      Existing User Categories: [${categoryNames}]. 
      If the transaction fits one of these, use that EXACT name. Otherwise, suggest a new one.
      
      The category types must be one of: 'income', 'bill', 'expense', 'savings', 'debt'.
      
      Also determine if this looks like a recurring bill based on the context (e.g., "monthly", "subscription", "bill").

      Text: "${text}"
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              categoryName: { type: Type.STRING },
              categoryType: { 
                type: Type.STRING, 
                enum: ['income', 'bill', 'expense', 'savings', 'debt'] 
              },
              date: { type: Type.STRING },
              isRecurring: { type: Type.BOOLEAN }
            },
            required: ['merchant', 'amount', 'categoryName', 'categoryType', 'date'],
          },
        },
      });

      const result = JSON.parse(response.text || "{}") as AIParseResult;
      return result;
    } catch (error) {
      console.error("Error parsing text with Gemini:", error);
      throw new Error("Failed to parse transaction text.");
    }
  }

  async parseTransactionImage(base64Image: string, existingCategories: BudgetCategory[]): Promise<AIParseResult> {
    const model = "gemini-2.5-flash";
    const categoryNames = existingCategories.map(c => c.name).join(", ");
    
    // Remove header if present (data:image/png;base64,)
    const base64Data = base64Image.includes("base64,") 
      ? base64Image.split("base64,")[1] 
      : base64Image;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg", 
                data: base64Data,
              },
            },
            {
              text: `Analyze this receipt/screenshot. Extract merchant, amount, date. 
                     Context: India, INR (₹).
                     Match against existing categories: [${categoryNames}] if possible.
                     Detect if it's a recurring bill.`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              categoryName: { type: Type.STRING },
              categoryType: { 
                type: Type.STRING, 
                enum: ['income', 'bill', 'expense', 'savings', 'debt'] 
              },
              date: { type: Type.STRING },
              isRecurring: { type: Type.BOOLEAN }
            },
            required: ['merchant', 'amount', 'categoryName', 'categoryType', 'date'],
          },
        },
      });

      const result = JSON.parse(response.text || "{}") as AIParseResult;
      return result;
    } catch (error) {
      console.error("Error parsing image with Gemini:", error);
      throw new Error("Failed to parse transaction image.");
    }
  }
}

export const geminiService = new GeminiService();