import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question } from "../types";

// Comprehensive Static List for Paskong Pinoy
const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'static-1',
    text: "Ano ang karaniwang handa tuwing Noche Buena?",
    answers: [
      { text: "Hamón / Ham", points: 30, revealed: false },
      { text: "Queso de Bola", points: 20, revealed: false },
      { text: "Spaghetti", points: 15, revealed: false },
      { text: "Lechon", points: 12, revealed: false },
      { text: "Fruit Salad", points: 10, revealed: false },
      { text: "Bibingka / Puto Bumbong", points: 8, revealed: false },
      { text: "Lumpia", points: 5, revealed: false },
    ]
  },
  {
    id: 'static-2',
    text: "Sino ang inaasahang magbibigay ng aguinaldo?",
    answers: [
      { text: "Ninong / Ninang", points: 40, revealed: false },
      { text: "Lolo / Lola", points: 20, revealed: false },
      { text: "Magulang (Parents)", points: 15, revealed: false },
      { text: "Tito / Tita", points: 10, revealed: false },
      { text: "Boss", points: 8, revealed: false },
      { text: "Kapatid / Ate / Kuya", points: 7, revealed: false },
    ]
  },
  {
    id: 'static-3',
    text: "Ano ang makikita sa loob ng bahay tuwing Pasko?",
    answers: [
      { text: "Christmas Tree", points: 35, revealed: false },
      { text: "Parol", points: 25, revealed: false },
      { text: "Christmas Lights", points: 15, revealed: false },
      { text: "Belen", points: 10, revealed: false },
      { text: "Regalo / Gifts", points: 8, revealed: false },
      { text: "Medyas / Socks", points: 7, revealed: false },
    ]
  },
  {
    id: 'static-4',
    text: "Anong kanta o singer ang naririnig pagsapit ng 'Ber' months?",
    answers: [
      { text: "Jose Mari Chan", points: 50, revealed: false },
      { text: "Christmas in Our Hearts", points: 20, revealed: false },
      { text: "Ang Pasko Ay Sumapit", points: 15, revealed: false },
      { text: "Jingle Bells", points: 8, revealed: false },
      { text: "All I Want for Christmas", points: 7, revealed: false },
    ]
  },
  {
    id: 'static-5',
    text: "Ano ang ginagawa pagkatapos ng Simbang Gabi?",
    answers: [
      { text: "Kumain (Bibingka/Puto)", points: 45, revealed: false },
      { text: "Umuwi / Matulog", points: 25, revealed: false },
      { text: "Mag-almusal / Kape", points: 15, revealed: false },
      { text: "Mag-picture", points: 10, revealed: false },
      { text: "Mag-jogging / Exercise", points: 5, revealed: false },
    ]
  }
];

export const fetchGameContent = async (): Promise<Question[]> => {
  // Check for missing or placeholder API key
  if (!process.env.API_KEY || process.env.API_KEY.includes('YOUR_API_KEY')) {
    console.log("Using Static Paskong Pinoy Content (No Valid API Key)");
    return FALLBACK_QUESTIONS;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The question text in Tagalog or Taglish." },
        answers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The answer text (short)." },
              points: { type: Type.INTEGER, description: "Points for this answer (1-100)." },
            },
            required: ["text", "points"],
          },
        },
      },
      required: ["text", "answers"],
    },
  };

  try {
    let response;
    let error;

    // Retry logic: Attempt up to 3 times
    for (let i = 0; i < 3; i++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Generate 5 Family Feud style questions related to Filipino Christmas Traditions (Paskong Pinoy). Questions should be in Tagalog or Taglish. Answers should be the most popular survey responses. Ensure high variety.",
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            systemInstruction: "You are a game show writer for Family Feud Philippines. Create fun, culturally relevant questions about Christmas in the Philippines.",
          },
        });
        // If successful, break the loop
        if (response && response.text) break;
      } catch (e) {
        error = e;
        console.warn(`Attempt ${i + 1} failed, retrying...`);
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response || !response.text) {
      throw error || new Error("Failed to generate content after retries");
    }

    const rawData = response.text;
    const parsedData = JSON.parse(rawData);
    
    // Transform into our app's internal format
    return parsedData.map((q: any, index: number) => ({
      id: `g-${index}-${Date.now()}`,
      text: q.text,
      answers: q.answers.map((a: any) => ({
        text: a.text,
        points: a.points,
        revealed: false
      })).sort((a: any, b: any) => b.points - a.points).slice(0, 8) // Ensure max 8 and sorted
    }));

  } catch (error) {
    // Graceful fallback without crashing the app or showing scary errors
    console.warn("Gemini API currently unavailable or network error. Switching to static content.");
    return FALLBACK_QUESTIONS;
  }
};