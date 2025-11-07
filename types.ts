
export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  questions: Question[];
}
