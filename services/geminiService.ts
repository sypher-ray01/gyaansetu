
import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNotes = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate concise and informative study notes on the topic: "${topic}". The notes should be well-structured and easy for a beginner to understand. Use markdown for formatting, including a main heading for the topic, subheadings for key concepts, bold text for important terms, and bullet points for lists.`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};

export const generateQuiz = async (topic: string): Promise<Quiz> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 3-question multiple-choice quiz on the topic: "${topic}". For each question, provide 4 options and indicate the correct answer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The quiz question."
                  },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING
                    },
                    description: "An array of 4 possible answers."
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "The correct answer, which must be one of the provided options."
                  }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Quiz;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to communicate with the AI model and parse the quiz.");
  }
};
