
import { GoogleGenAI, Type } from "@google/genai";
import { FormData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const formSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A concise title for the form.',
    },
    description: {
      type: Type.STRING,
      description: 'An optional brief description or instructions for the form.',
    },
    questions: {
      type: Type.ARRAY,
      description: 'A list of all questions identified in the text.',
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The type of question. Must be one of: 'multiple_choice', 'checkbox', 'short_answer', 'long_answer'.",
            enum: ['multiple_choice', 'checkbox', 'short_answer', 'long_answer'],
          },
          text: {
            type: Type.STRING,
            description: 'The full text of the question.',
          },
          options: {
            type: Type.ARRAY,
            description: 'A list of options for multiple_choice or checkbox questions. Should be empty for other types.',
            items: {
              type: Type.STRING,
            },
          },
          is_required: {
            type: Type.BOOLEAN,
            description: 'Whether the question is mandatory. Defaults to false.',
          },
        },
        required: ['type', 'text'],
      },
    },
  },
  required: ['title', 'questions'],
};


export const generateFormFromText = async (rawText: string): Promise<FormData> => {
  if (!rawText.trim()) {
    throw new Error("Input text cannot be empty.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please set your Gemini API key in the environment variables.");
  }

  const prompt = `
    You are an expert AI assistant named FormGenie. Your task is to analyze the following raw text and convert it into a structured JSON format suitable for creating a web form.

    Instructions:
    1.  Identify a suitable title and an optional description for the form based on the text's content.
    2.  Detect all questions within the text.
    3.  For each question, accurately classify its type as one of: 'multiple_choice', 'checkbox', 'short_answer', or 'long_answer'.
        - 'multiple_choice': Use for questions where only one answer can be selected from a list (e.g., radio buttons).
        - 'checkbox': Use for questions where multiple answers can be selected.
        - 'short_answer': Use for questions requiring a brief, single-line text response.
        - 'long_answer': Use for questions requiring a detailed, multi-line text response.
    4.  Extract all options for 'multiple_choice' and 'checkbox' questions.
    5.  Determine if a question seems mandatory and set 'is_required' to true. Default to false if unsure.
    6.  Return a single, valid JSON object that strictly adheres to the provided schema.

    Raw text to analyze:
    ---
    ${rawText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: formSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as FormData;
  } catch (error) {
    console.error("Error generating form with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate form: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the form.");
  }
};
