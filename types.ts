
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CHECKBOX = 'checkbox',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
}

export interface Question {
  type: QuestionType;
  text: string;
  options?: string[];
  is_required?: boolean;
}

export interface FormData {
  title: string;
  description?: string;
  questions: Question[];
}
