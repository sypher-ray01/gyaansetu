import React, { useEffect } from 'react';
import type { ConceptMap } from '../types';
import { SaveIcon } from './icons/SaveIcon';
import { CheckIcon } from './icons/CheckIcon';

declare const mermaid: any;

interface ConceptMapCardProps {
  topic: string;
  mapData: ConceptMap;
  onSave: () => void;
  isSaved: boolean;
  isDarkMode: boolean;
}

export const ConceptMapCard: React.FC<ConceptMapCardProps> = ({ topic, mapData, onSave, isSaved, isDarkMode }) => {
  useEffect(() => {
    if (mapData && typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: false, // We will call run manually
          theme: isDarkMode ? 'dark' : 'default',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
        });
        mermaid.run({
            nodes: document.querySelectorAll('.mermaid')
        });
      } catch (e) {
        console.error("Mermaid rendering error:", e);
      }
    }
  }, [mapData, isDarkMode]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-b-2xl shadow-lg animate-fade-in">
       <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white capitalize">
          Concept Map: {topic}
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
      <hr className="border-slate-200 dark:border-slate-700 my-4" />
      <div key={`${mapData}-${isDarkMode}`} className="mermaid flex justify-center w-full overflow-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        {mapData}
      </div>
    </div>
  );
};