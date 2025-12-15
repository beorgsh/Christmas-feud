
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// --- SAFE API KEY ACCESS ---
// This prevents "ReferenceError: process is not defined" in browser environments
const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if process is not accessible
  }
  return undefined;
};

const API_KEY = getApiKey();

// Initialize AI with a fallback key if missing to prevent instant crash.
// Actual calls are guarded below.
const ai = new GoogleGenAI({ apiKey: API_KEY || 'MISSING_KEY_FALLBACK' });

// Fixed Question List provided by user
const FIXED_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: "Name Something Na Kumikislap",
    answers: [
      { text: "BITUIN", points: 27, revealed: false },
      { text: "CHRISTMAS LIGHT", points: 18, revealed: false },
      { text: "KURYENTE", points: 14, revealed: false },
      { text: "ILAW", points: 11, revealed: false },
      { text: "ALITAPTAP", points: 10, revealed: false },
      { text: "GOLD/DIAMONDS", points: 9, revealed: false },
      { text: "MATA", points: 6, revealed: false },
    ]
  },
  {
    id: 'q2',
    text: "Pagsinabing Ang Tigas Naman Ng Muka Mo, Sin Tigas Kaya Ng Ano?",
    answers: [
      { text: "BATO", points: 66, revealed: false },
      { text: "SEMENTO", points: 16, revealed: false },
      { text: "BAKAL", points: 5, revealed: false },
      { text: "KAHOY", points: 5, revealed: false },
      { text: "YELO", points: 4, revealed: false },
    ]
  },
  {
    id: 'q3',
    text: "Name A Reason Employees Love Payday",
    answers: [
      { text: "BILLS PAYMENT", points: 32, revealed: false },
      { text: "FOOD TRIP", points: 20, revealed: false },
      { text: "SHOPPING", points: 16, revealed: false },
      { text: "SAVINGS", points: 12, revealed: false },
      { text: "SENDING MONEY TO FAMILY", points: 10, revealed: false },
      { text: "TREATING ONESELF", points: 6, revealed: false },
      { text: "LOAN REPAYMENT", points: 4, revealed: false },
    ]
  },
  {
    id: 'q4',
    text: "Name Something A Coworker Might Borrow From You",
    answers: [
      { text: "PEN", points: 40, revealed: false },
      { text: "CHARGER", points: 25, revealed: false },
      { text: "PAPER", points: 12, revealed: false },
      { text: "UMBRELLA", points: 10, revealed: false },
      { text: "SCISSORS/TAPE", points: 7, revealed: false },
      { text: "MONEY", points: 4, revealed: false },
      { text: "ALCOHOL/SANITIZER", points: 2, revealed: false },
    ]
  },
  {
    id: 'q5',
    text: "Name A Sound You Hear In An Office All The Time",
    answers: [
      { text: "KEYBOARD TYPING", points: 35, revealed: false },
      { text: "MOUSE CLICKING", points: 25, revealed: false },
      { text: "PRINTER HUMMING", points: 15, revealed: false },
      { text: "PEOPLE WHISPERING", points: 10, revealed: false },
      { text: "AIRCON HUMMING", points: 8, revealed: false },
      { text: "SOMEONE LAUGHING", points: 5, revealed: false },
      { text: "SOMEONE SIGHING LOUDLY", points: 2, revealed: false },
    ]
  }
];

// Schema for Gemini JSON Output
const questionSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "The Family Feud style question text in Taglish/Tagalog" },
        answers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "Answer text" },
                    points: { type: Type.INTEGER, description: "Survey points" }
                }
            }
        }
    },
    required: ["text", "answers"]
};

const gameContentSchema = {
    type: Type.ARRAY,
    items: questionSchema
};

const SYSTEM_INSTRUCTION = `
You are a game show host for "Family Feud Philippines: Paskong Pinoy Edition". 
Your task is to generate survey questions related to Filipino Christmas traditions, foods, habits, and culture.
The questions should be relatable to Filipinos (masa culture to corporate culture).
Use "Taglish" (Tagalog-English mix) for the questions to make them sound authentic and conversational.
Answers should be in English or Tagalog (whichever is more common).
Points should roughly total 100 for each question.
Provide 5-8 answers per question.
`;

// Helper: Normalize points to ensure they strictly equal 100
const normalizeQuestionPoints = (question: Question): Question => {
  if (!question.answers || question.answers.length === 0) return question;

  const currentSum = question.answers.reduce((sum, a) => sum + a.points, 0);
  const diff = 100 - currentSum;

  if (diff !== 0) {
    // Clone answers to avoid mutation
    const newAnswers = [...question.answers];
    
    // Adjust the answer with the highest points to absorb the difference
    // This maintains the relative distribution best
    let targetIndex = 0;
    let maxPoints = -Infinity;
    
    newAnswers.forEach((a, idx) => {
        if (a.points > maxPoints) {
            maxPoints = a.points;
            targetIndex = idx;
        }
    });

    newAnswers[targetIndex] = {
        ...newAnswers[targetIndex],
        points: Math.max(1, newAnswers[targetIndex].points + diff) // Ensure it doesn't drop to 0 or negative
    };
    
    // Double check if normalization caused < 100 due to Math.max(1) clamp (rare edge case)
    // If we still have discrepancy, just force it on the first one
    const checkSum = newAnswers.reduce((sum, a) => sum + a.points, 0);
    if (checkSum !== 100) {
        newAnswers[0].points += (100 - checkSum);
    }

    return { ...question, answers: newAnswers };
  }

  return question;
};

// Returns the predefined list of questions, formatted correctly
export const fetchFixedGameSet = (): Question[] => {
  return FIXED_QUESTIONS.map(q => normalizeQuestionPoints({
    ...q,
    answers: q.answers.map(a => ({ ...a, revealed: false }))
  }));
};

// Helper to get random fixed question
export const fetchQuestionFromList = (): Question => {
  const random = FIXED_QUESTIONS[Math.floor(Math.random() * FIXED_QUESTIONS.length)];
  const rawQuestion = {
    ...random,
    id: `replacement-fixed-${Date.now()}`,
    answers: random.answers.map(a => ({ ...a, revealed: false }))
  };
  return normalizeQuestionPoints(rawQuestion);
};

// Helper to get AI question
export const fetchQuestionFromAI = async (): Promise<Question> => {
  try {
    if (!API_KEY) throw new Error("No API Key available in environment");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 1 unique Family Feud question about Filipino Christmas.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 1.0, 
      },
    });

    const json = JSON.parse(response.text || '{}');
    if (json.text && Array.isArray(json.answers)) {
       const rawQuestion = {
         id: `ai-${Date.now()}`,
         text: json.text,
         answers: json.answers.map((a: any) => ({ text: a.text.toUpperCase(), points: a.points, revealed: false }))
       };
       return normalizeQuestionPoints(rawQuestion);
    }
    throw new Error("Invalid JSON structure");

  } catch (error) {
    console.warn("AI generation failed, using fallback.", error);
    return fetchQuestionFromList();
  }
}

// Kept for backward compatibility if needed, or initial load
export const fetchSingleQuestion = async (): Promise<Question> => {
    return fetchQuestionFromAI();
}

export const fetchGameContent = async (): Promise<Question[]> => {
  try {
    // Fallback immediately if key is missing to prevent API errors
    if (!API_KEY) {
        console.warn("No API Key found, using fixed question set.");
        return fetchFixedGameSet();
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 5 unique Family Feud questions about Filipino Christmas.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: gameContentSchema,
        temperature: 0.9,
      },
    });

    const json = JSON.parse(response.text || '[]');
    if (Array.isArray(json) && json.length > 0) {
      return json.map((q: any, index: number) => normalizeQuestionPoints({
        id: `ai-set-${Date.now()}-${index}`,
        text: q.text,
        answers: q.answers.map((a: any) => ({ text: a.text.toUpperCase(), points: a.points, revealed: false }))
      }));
    }
    
    throw new Error("Invalid AI response");

  } catch (error) {
    console.warn("AI generation failed, loading fixed set.", error);
    return fetchFixedGameSet();
  }
};
