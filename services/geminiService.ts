import { GoogleGenAI, Chat } from "@google/genai";
import { Language } from "../types";

const BASE_INSTRUCTION = `
You are "Sol", the friendly and knowledgeable AI assistant for "Alicante Wheels", a premier car rental agency in Alicante, Spain.

Your goals:
1. Help customers choose the right rental car for their needs (families, couples, adventure).
2. Explain our clear pricing: All rentals include full insurance (zero excess) and unlimited mileage.
3. Provide local driving tips for Alicante and the Costa Blanca region (e.g., parking in the city center, visiting the Santa Bárbara Castle, driving to Benidorm or Torrevieja).
4. Be concise, polite, and use a sunny, welcoming tone.

Key Info:
- We are located at Alicante Airport (ALC) and the City Center train station.
- We offer compact cars, SUVs, convertibles, and luxury vans.
- No hidden fees.
- Open 24/7.

If asked about specific prices not in the context, give a rough estimate but advise checking the search form for exact dates.
`;

let chatSession: Chat | null = null;
let currentLanguage: Language = 'en';

export const getChatSession = (language: Language): Chat => {
  if (!chatSession || currentLanguage !== language) {
    currentLanguage = language;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const languageInstruction = language === 'es' 
      ? "IMPORTANT: You MUST converse with the user in SPANISH. The user is viewing the Spanish version of the website." 
      : "IMPORTANT: You MUST converse with the user in ENGLISH.";

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `${BASE_INSTRUCTION}\n\n${languageInstruction}`,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string, language: Language): Promise<string> => {
  try {
    const chat = getChatSession(language);
    const result = await chat.sendMessage({ message });
    return result.text || (language === 'es' ? "Lo siento, no he podido procesar tu solicitud en este momento." : "I'm sorry, I couldn't process that request right now.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'es' 
      ? "Tengo problemas para conectarme con el servidor. Por favor, inténtalo de nuevo en un momento."
      : "I'm having trouble connecting to our servers. Please try again in a moment.";
  }
};
