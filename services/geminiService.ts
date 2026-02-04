import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const askIslamicAssistant = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: `You are a knowledgeable and respectful Islamic Assistant within the 'Nur' application. 
        Your role is to provide accurate, balanced, and referenced information regarding Islam, Quran, Hadith, and Fiqh.
        
        Guidelines:
        1. Always be respectful and maintain a spiritual tone.
        2. When answering Fiqh (jurisprudence) questions, mention if there are differences of opinion among the major Madhabs (Hanafi, Shafi'i, Maliki, Hanbali) if applicable.
        3. Cite sources (Surah/Ayah numbers, Hadith collection names) where possible.
        4. If a question is extremely sensitive or requires a fatwa for a specific personal situation, advise the user to consult a local scholar.
        5. Format your response with clear paragraphs and bullet points for readability.`,
      },
    });

    return response.text || "I apologize, I could not generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while processing your request. Please try again later.";
  }
};
