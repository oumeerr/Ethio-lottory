import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabaseClient";

export interface PromoScript {
  title: string;
  script: string;
  hashtags: string[];
  viralFactor: string;
}

/**
 * Generates content via Gemini and stores in Supabase
 */
export const summarizeAndStore = async (userInput: string) => {
  // Use VITE_ environment variables for client-side access
  const apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    throw new Error("VITE_GOOGLE_AI_STUDIO_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userInput,
    });

    const aiResponse = response.text || "";

    // Log the branding change if needed (internal)
    const { data, error } = await supabase
      .from('ai_logs')
      .insert([{ prompt: userInput, response: aiResponse }]);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Gemini-Supabase Integration Error:", error);
    throw error;
  }
};

/**
 * Generates a structured promotional script using Gemini 3 Pro.
 */
export const generatePromoDescription = async (topic: string): Promise<PromoScript | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  const systemInstruction = `You are a world-class creative director and social media strategist for ETHIOLOTTORY BINGO, a high-stakes web Bingo application for the Ethiopian market. 
Your goal is to create high-energy, viral promotional content.
Tone: Energetic, trustworthy, slightly luxurious, and fast-paced.`;

  const prompt = `Create a viral social media post based on this context: "${topic}". 
The post should drive excitement for the weekly 50,000 ETB prize pool.
Mention that ETHIOLOTTORY BINGO is secure and payouts are instant.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Catchy headline."
            },
            script: {
              type: Type.STRING,
              description: "The main body of the social media post."
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Trending hashtags."
            },
            viralFactor: {
              type: Type.STRING,
              description: "Reasoning behind why this post will go viral."
            }
          },
          required: ["title", "script", "hashtags", "viralFactor"]
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as PromoScript;
    }
    return null;
  } catch (error) {
    console.error("Gemini Promo Generation Error:", error);
    return null;
  }
};
