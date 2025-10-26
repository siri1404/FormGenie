
import React from 'react';
import { FormData, Question, QuestionType } from '../types';

interface FormPreviewProps {
  formData: FormData | null;
}

const renderQuestion = (question: Question, index: number) => {
  const { type, text, options, is_required } = question;

  const questionLabel = (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      {text}
      {is_required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return (
        <div key={index}>
          {questionLabel}
          <div className="space-y-2">
            {options?.map((option, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${index}`}
                  id={`q-${index}-o-${i}`}
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  disabled
                />
                <label htmlFor={`q-${index}-o-${i}`} className="ml-3 block text-sm text-slate-600 dark:text-slate-400">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    case QuestionType.CHECKBOX:
      return (
        <div key={index}>
          {questionLabel}
          <div className="space-y-2">
            {options?.map((option, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="checkbox"
                  name={`question-${index}`}
                  id={`q-${index}-o-${i}`}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  disabled
                />
                <label htmlFor={`q-${index}-o-${i}`} className="ml-3 block text-sm text-slate-600 dark:text-slate-400">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    case QuestionType.SHORT_ANSWER:
      return (
        <div key={index}>
          {questionLabel}
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Your answer"
            disabled
          />
        </div>
      );
    case QuestionType.LONG_ANSWER:
      return (
        <div key={index}>
          {questionLabel}
          <textarea
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Your detailed answer"
            disabled
          />
        </div>
      );
    default:
      return null;
  }
};

const FormPreview: React.FC<FormPreviewProps> = ({ formData }) => {
  if (!formData) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Form Preview</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your generated form will appear here.</p>
        </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{formData.title}</h2>
        {formData.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{formData.description}</p>}
      </div>
      <div className="space-y-6">
        {formData.questions.map(renderQuestion)}
      </div>
    </div>
  );
};

export default FormPreview;
