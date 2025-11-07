import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, Notes, Source, FileGeneratedContent, ConceptMap } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNotes = async (topic: string): Promise<Notes> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate concise and informative study notes on the topic: "${topic}". The notes should be well-structured and easy for a beginner to understand. Use markdown for formatting, including a main heading for the topic, subheadings for key concepts, bold text for important terms, and bullet points for lists.`,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.5,
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter((web): web is Source => !!web?.uri && !!web.title) ?? [];

    return {
        content: response.text,
        sources: sources,
    };
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};

export const generateQuiz = async (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Quiz> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 3-question ${difficulty.toLowerCase()} multiple-choice quiz on the topic: "${topic}". The questions should be appropriate for the selected difficulty level. For each question, provide 4 options and indicate the correct answer.`,
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

export const generateConceptMap = async (topic: string): Promise<ConceptMap> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a concept map for the topic: "${topic}". The output should be in Mermaid.js graph syntax (using "graph TD;"). The map should start with the main topic and branch out to key concepts, sub-topics, and important details. Keep it concise but informative. Only output the Mermaid syntax code block, without the markdown backticks.`,
        config: {
          temperature: 0.3,
        }
      });
  
      // Clean up the response to get only the mermaid code
      const mermaidCode = response.text.replace(/```mermaid\n|```/g, '').trim();
      return mermaidCode;
    } catch (error) {
      console.error("Error generating concept map:", error);
      throw new Error("Failed to communicate with the AI model for the concept map.");
    }
  };

export const generateFromFileContent = async (fileContent: string): Promise<FileGeneratedContent> => {
  try {
    // Truncate content to avoid exceeding token limits
    const truncatedContent = fileContent.length > 30000 ? fileContent.substring(0, 30000) : fileContent;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following document content, please provide:
      1. A concise summary of the key points, formatted in markdown.
      2. A 3-question multiple-choice quiz with 4 options each, and indicate the correct answer. The difficulty should be medium.
      3. A list of 3 related topics for further study.
      
      Document Content:
      ---
      ${truncatedContent}
      ---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A concise markdown-formatted summary of the provided text."
            },
            quiz: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer"]
                  }
                }
              },
              required: ["questions"]
            },
            relatedTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A single related topic."
              },
              description: "An array of 3 related topic strings."
            }
          },
          required: ["summary", "quiz", "relatedTopics"]
        }
      }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FileGeneratedContent;
  } catch (error) {
    console.error("Error generating from file content:", error);
    throw new Error("Failed to communicate with the AI model for file processing.");
  }
};
