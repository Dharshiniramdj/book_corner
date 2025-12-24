
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client using the process.env.API_KEY strictly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDefinition = async (word: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a clear, concise dictionary definition for the word "${word}". 
      Also detect the language of the word. 
      ${context ? `Consider the context: "${context}"` : ''}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meaning: { type: Type.STRING, description: "The definition of the word" },
            language: { type: Type.STRING, description: "The ISO language name, e.g. English, Japanese, French" },
            synonyms: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["meaning", "language"]
        }
      }
    });

    // Directly access the .text property to retrieve the response content.
    const result = JSON.parse(response.text || '{}');
    return {
      meaning: result.meaning || "No definition found.",
      language: result.language || "Unknown"
    };
  } catch (error) {
    console.error("Gemini Definition Error:", error);
    return {
      meaning: "Could not retrieve definition at this time.",
      language: "Unknown"
    };
  }
};
