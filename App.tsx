
import React, { useState, useCallback } from 'react';
import { generateNotes, generateQuiz } from './services/geminiService';
import type { Quiz } from './types';
import { NotesCard } from './components/NotesCard';
import { QuizCard } from './components/QuizCard';
import { Loader } from './components/Loader';

type View = 'notes' | 'quiz' | null;

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>(null);
  const [notes, setNotes] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleGenerateNotes = useCallback(async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setActiveView('notes');
    setQuiz(null);

    try {
      const generatedNotes = await generateNotes(topic);
      setNotes(generatedNotes);
    } catch (e) {
      setError('Failed to generate notes. Please try again.');
      console.error(e);
      setNotes('');
    } finally {
      setIsLoading(false);
    }
  }, [topic, isLoading]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setActiveView('quiz');
    setNotes('');

    try {
      const generatedQuiz = await generateQuiz(topic);
      setQuiz(generatedQuiz);
    } catch (e) {
      setError('Failed to generate quiz. Please try again.');
      console.error(e);
      setQuiz(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, isLoading]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main className="w-full max-w-4xl mx-auto flex-grow">
        <header className="text-center my-8 md:my-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
            StudyMate
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-slate-600 dark:text-slate-400">
            Your AI Study Assistant
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a study topic (e.g., 'Binary Trees')"
              className="flex-grow w-full px-4 py-3 text-lg bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              disabled={isLoading}
            />
            <div className="flex gap-4">
              <button
                onClick={handleGenerateNotes}
                disabled={isLoading || !topic.trim()}
                className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100"
              >
                Generate Notes
              </button>
              <button
                onClick={handleGenerateQuiz}
                disabled={isLoading || !topic.trim()}
                className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              {activeView === 'notes' && notes && (
                <NotesCard topic={topic} content={notes} />
              )}
              {activeView === 'quiz' && quiz && (
                <QuizCard topic={topic} quiz={quiz} />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="w-full text-center p-4 mt-8 text-slate-500 dark:text-slate-400">
        <p>StudyMate – AI Study Assistant</p>
        <p>&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
