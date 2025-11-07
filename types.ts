export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  questions: Question[];
}

export interface Source {
  uri: string;
  title: string;
}

export interface Notes {
  content: string;
  sources: Source[];
}

export type ConceptMap = string;

export interface SavedItem {
  id: string;
  type: 'notes' | 'quiz' | 'conceptMap';
  topic: string;
  content: Notes | Quiz | ConceptMap;
  createdAt: string;
}

export interface FileGeneratedContent {
  summary: string;
  quiz: Quiz;
  relatedTopics: string[];
}

export interface PlannerTask {
    id: string;
    topic: string;
    deadline: string; // ISO string format
    priority: 'Low' | 'Medium' | 'High';
    completed: boolean;
}