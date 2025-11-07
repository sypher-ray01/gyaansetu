
import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface NotesCardProps {
  topic: string;
  content: string;
}

// A simple markdown to HTML converter
const MarkdownViewer: React.FC<{ text: string }> = ({ text }) => {
  const html = text
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2 list-disc">$1</li>')
    .replace(/(\n- .*)+/g, (match) => `<ul class="list-disc pl-5 my-4">${match.replace(/^- (.*)/gm, '<li>$1</li>')}</ul>`)
    .replace(/\n/g, '<br />')
    .replace(/<br \/>(<h[1-3]>|<li|<ul>)/g, '$1') // remove br before headings and lists
    .replace(/(<\/h[1-3]>|<\/li>|<\/ul>)<br \/>/g, '$1'); // remove br after headings and lists


  return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};


export const NotesCard: React.FC<NotesCardProps> = ({ topic, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white capitalize">
          Notes on: {topic}
        </h2>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isCopied
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <hr className="border-slate-200 dark:border-slate-700 my-4" />
      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
         <MarkdownViewer text={content} />
      </div>
    </div>
  );
};
