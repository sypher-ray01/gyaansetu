
import React from 'react';
import type { FileGeneratedContent, Question } from '../types';
import { PdfIcon } from './icons/PdfIcon';

// Re-using QuestionView from QuizCard, but defined locally to avoid complex prop drilling/context
const QuestionView: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isAnswered, setIsAnswered] = React.useState<boolean>(false);

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
            <input type="radio" name={`question-${index}`} value={option} checked={selectedOption === option} onChange={() => handleOptionSelect(option)} disabled={isAnswered} className="hidden"/>
            <span className="text-lg">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const MarkdownViewer: React.FC<{ text: string }> = ({ text }) => {
    const html = text
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2 list-disc">$1</li>')
      .replace(/\n/g, '<br />');
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

interface FileResultCardProps {
  fileName: string;
  data: FileGeneratedContent;
  onRelatedTopicClick: (topic: string) => void;
}

declare const jspdf: any;

export const FileResultCard: React.FC<FileResultCardProps> = ({ fileName, data, onRelatedTopicClick }) => {
  const handleDownloadPdf = () => {
    if (typeof jspdf === 'undefined') {
        console.error("jsPDF is not loaded.");
        alert("Could not generate PDF. The PDF library is missing.");
        return;
    }
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Summary of: ${fileName}`, 10, 20);
    
    doc.setFontSize(12);
    // Use splitTextToSize for auto-wrapping
    const splitSummary = doc.splitTextToSize(data.summary, 180);
    doc.text(splitSummary, 10, 30);
    
    doc.save(`StudyMate-Summary-${fileName}.pdf`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg animate-fade-in space-y-8">
      {/* Summary Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Summary</h2>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <PdfIcon />
            Download PDF
          </button>
        </div>
        <hr className="border-slate-200 dark:border-slate-700 my-4" />
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
          <MarkdownViewer text={data.summary} />
        </div>
      </div>

      {/* Quiz Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Quiz</h2>
        <hr className="border-slate-200 dark:border-slate-700 my-4" />
        <div>
          {data.quiz.questions.map((q, index) => (
            <QuestionView key={index} question={q} index={index} />
          ))}
        </div>
      </div>

      {/* Related Topics Section */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Related Topics</h2>
        <hr className="border-slate-200 dark:border-slate-700 my-4" />
        <div className="flex flex-wrap gap-3">
          {data.relatedTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => onRelatedTopicClick(topic)}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
