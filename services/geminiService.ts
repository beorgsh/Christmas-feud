
import { Question } from "../types";

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

export const fetchSingleQuestion = async (): Promise<Question> => {
  // Return a random question from the fixed list if the host needs to swap
  const random = FIXED_QUESTIONS[Math.floor(Math.random() * FIXED_QUESTIONS.length)];
  return {
    ...random,
    id: `replacement-${Date.now()}`,
    answers: random.answers.map(a => ({ ...a, revealed: false }))
  };
}

export const fetchGameContent = async (): Promise<Question[]> => {
  console.log("Loading Fixed Question Set...");
  // Return the full fixed list, ensuring deep copy so game state is fresh
  return FIXED_QUESTIONS.map(q => ({
    ...q,
    answers: q.answers.map(a => ({ ...a, revealed: false }))
  }));
};
