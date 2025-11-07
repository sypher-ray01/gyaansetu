import React, { useState } from 'react';
import type { Quiz, Question } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { CheckIcon } from './icons/CheckIcon';

interface QuizCardProps {
  topic: string;
  quiz: Quiz;
  onSave: () => void;
  isSaved: boolean;
}

const QuestionView: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const getOptionClass = (option: string) => {
    if (!isAnswered) {
      return 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700';
    }
    if (option === question.correctAnswer) {
      return 'border-green-500 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    }
    if (option === selectedOption) {
      return 'border-red-500 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
    }
    return 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {index + 1}. {question.question}
      </h3>
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <label
            key={i}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getOptionClass(option)}`}
          >
            <input
              type="radio"
              name={`question-${index}`}
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionSelect(option)}
              disabled={isAnswered}
              className="hidden"
            />
            <span className="text-lg">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};


export const QuizCard: React.FC<QuizCardProps> = ({ topic, quiz, onSave, isSaved }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-b-2xl shadow-lg animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white capitalize">
          Quiz on: {topic}
        </h2>
        {!isSaved ? (
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <SaveIcon />
            Save
          </button>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            <CheckIcon />
            Saved
          </span>
        )}
      </div>
      <div>
        {quiz.questions.map((q, index) => (
          <QuestionView key={index} question={q} index={index} />
        ))}
      </div>
    </div>
  );
};