import React, { useState, useCallback, useEffect } from 'react';
import { generateNotes, generateQuiz, generateFromFileContent, generateConceptMap } from './services/geminiService';
import { readFileContent } from './utils/fileReader';
import type { Quiz, SavedItem, Notes, FileGeneratedContent, ConceptMap, PlannerTask, GamificationData } from './types';
import { NotesCard } from './components/NotesCard';
import { QuizCard } from './components/QuizCard';
import { ConceptMapCard } from './components/ConceptMapCard';
import { Loader } from './components/Loader';
import { SavedItemsList } from './components/SavedItemsList';
import { FileUpload } from './components/FileUpload';
import { FileResultCard } from './components/FileResultCard';
import { ThemeToggle } from './components/ThemeToggle';
import { Planner } from './components/Planner';
import { GeneratorIcon } from './components/icons/GeneratorIcon';
import { PlannerIcon } from './components/icons/PlannerIcon';
import { BookmarksList } from './components/BookmarksList';
import { StarIcon } from './components/icons/StarIcon';
import { StarFilledIcon } from './components/icons/StarFilledIcon';
import { QuizArena } from './components/QuizArena';
import { QuizArenaIcon } from './components/icons/QuizArenaIcon';
import { checkAndAwardBadges, ALL_BADGES } from './utils/badges';

type View = 'topic' | 'file' | null;
type MainView = 'generator' | 'planner' | 'quizArena';
type TopicView = 'notes' | 'quiz' | 'map';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const XP_PER_CORRECT_ANSWER = 10;
const XP_FOR_LEVEL_UP = 100;

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>(null);
  const [mainView, setMainView] = useState<MainView>('generator');
  const [activeTopicView, setActiveTopicView] = useState<TopicView>('notes');
  
  // State for topic-based generation
  const [notes, setNotes] = useState<Notes | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [conceptMap, setConceptMap] = useState<ConceptMap | null>(null);
  
  // State for file-based generation
  const [fileGeneratedContent, setFileGeneratedContent] = useState<FileGeneratedContent | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>([]);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [isCurrentContentSaved, setIsCurrentContentSaved] = useState<boolean>(false);
  
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    level: 1,
    xp: 0,
    badges: [],
    stats: {
        quizzesCompleted: 0,
        correctAnswers: 0,
        highestStreak: 0,
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load saved items, planner tasks, bookmarks, and game data from localStorage
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('studyMateHistory');
      if (storedItems) setSavedItems(JSON.parse(storedItems));
      
      const storedTasks = localStorage.getItem('studyMate_planner');
      if (storedTasks) setPlannerTasks(JSON.parse(storedTasks));
      
      const storedBookmarks = localStorage.getItem('studyMate_bookmarks');
      if (storedBookmarks) setBookmarkedTopics(JSON.parse(storedBookmarks));
      
      const storedGameData = localStorage.getItem('studyMate_gamification');
      if (storedGameData) {
        // Merge with default to ensure new fields are present
        const parsedData = JSON.parse(storedGameData);
        setGamificationData(prev => ({...prev, ...parsedData}));
      }

    } catch (e) {
      console.error("Failed to load saved items from localStorage", e);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('studyMateHistory', JSON.stringify(savedItems));
    } catch (e) {
      console.error("Failed to save items to localStorage", e);
    }
  }, [savedItems]);

  // Save planner tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('studyMate_planner', JSON.stringify(plannerTasks));
    } catch (e) {
      console.error("Failed to save planner tasks to localStorage", e);
    }
  }, [plannerTasks]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('studyMate_bookmarks', JSON.stringify(bookmarkedTopics));
    } catch (e) {
      console.error("Failed to save bookmarks to localStorage", e);
    }
  }, [bookmarkedTopics]);
  
  // Save gamification data to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('studyMate_gamification', JSON.stringify(gamificationData));
    } catch (e) {
        console.error("Failed to save gamification data to localStorage", e);
    }
  }, [gamificationData]);


  const clearAllOutputs = () => {
    setNotes(null);
    setQuiz(null);
    setConceptMap(null);
    setFileGeneratedContent(null);
    setIsCurrentContentSaved(false);
  }
  
  const clearTopicOutputs = () => {
    setNotes(null);
    setQuiz(null);
    setConceptMap(null);
    setIsCurrentContentSaved(false);
  };

  const handleGenerateNotes = useCallback(async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setFileGeneratedContent(null);
    setActiveView('topic');
    setActiveTopicView('notes');
    try {
      const generatedNotes = await generateNotes(topic);
      setNotes(generatedNotes);
      setIsCurrentContentSaved(false);
    } catch (e) {
      setError('Failed to generate notes. Please try again.');
      console.error(e);
      setNotes(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, isLoading]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setFileGeneratedContent(null);
    setActiveView('topic');
    setActiveTopicView('quiz');
    try {
      const generatedQuiz = await generateQuiz(topic, difficulty, 3);
      setQuiz(generatedQuiz);
      setIsCurrentContentSaved(false);
    } catch (e) {
      setError('Failed to generate quiz. Please try again.');
      console.error(e);
      setQuiz(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, isLoading, difficulty]);
  
  const handleGenerateConceptMap = useCallback(async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setFileGeneratedContent(null);
    setActiveView('topic');
    setActiveTopicView('map');
    try {
      const generatedMap = await generateConceptMap(topic);
      setConceptMap(generatedMap);
      setIsCurrentContentSaved(false);
    } catch (e) {
      setError('Failed to generate concept map. Please try again.');
      console.error(e);
      setConceptMap(null);
    } finally {
      setIsLoading(false);
    }
  }, [topic, isLoading]);

  const handleGenerateFromFile = useCallback(async (file: File) => {
    if (!file || isLoading) return;
    setIsLoading(true);
    setError(null);
    clearTopicOutputs();
    setActiveView('file');
    setTopic(file.name);
    try {
        const fileContent = await readFileContent(file);
        const generatedContent = await generateFromFileContent(fileContent);
        setFileGeneratedContent(generatedContent);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to process file. ${errorMessage}`);
      console.error(e);
      setFileGeneratedContent(null);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading]);

  const handleRelatedTopicClick = (newTopic: string) => {
    setTopic(newTopic);
    clearAllOutputs();
    setMainView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => handleGenerateNotes(), 0);
  };

  const handleSaveContent = useCallback(() => {
    if (activeView !== 'topic') return;
    let newItem: SavedItem | null = null;
    
    if (activeTopicView === 'notes' && notes) {
      newItem = { id: `${Date.now()}-${topic}`, type: 'notes', topic, content: notes, createdAt: new Date().toISOString() };
    } else if (activeTopicView === 'quiz' && quiz) {
      newItem = { id: `${Date.now()}-${topic}`, type: 'quiz', topic, content: quiz, createdAt: new Date().toISOString() };
    } else if (activeTopicView === 'map' && conceptMap) {
      newItem = { id: `${Date.now()}-${topic}`, type: 'conceptMap', topic, content: conceptMap, createdAt: new Date().toISOString() };
    }

    if (newItem) {
      setSavedItems(prev => [newItem, ...prev]);
      setIsCurrentContentSaved(true);
    }
  }, [activeView, activeTopicView, topic, notes, quiz, conceptMap]);

  const handleViewSavedItem = useCallback((id: string) => {
    const item = savedItems.find(i => i.id === id);
    if (item) {
      setIsLoading(false);
      setError(null);
      clearAllOutputs();
      setTopic(item.topic);
      setActiveView('topic');
      setMainView('generator');
      
      if (item.type === 'notes') {
        setActiveTopicView('notes');
        setNotes(item.content as Notes);
      } else if (item.type === 'quiz') {
        setActiveTopicView('quiz');
        setQuiz(item.content as Quiz);
      } else if (item.type === 'conceptMap') {
        setActiveTopicView('map');
        setConceptMap(item.content as ConceptMap);
      }
      
      setIsCurrentContentSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savedItems]);

  const handleDeleteSavedItem = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setSavedItems(prev => prev.filter(item => item.id !== id));
    }
  }, []);

  const handleAddTask = (task: Omit<PlannerTask, 'id' | 'completed'>) => {
    const newTask: PlannerTask = { ...task, id: Date.now().toString(), completed: false };
    setPlannerTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: PlannerTask) => {
    setPlannerTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        setPlannerTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleToggleBookmark = useCallback((topicToBookmark: string) => {
    if (!topicToBookmark.trim()) return;
    setBookmarkedTopics(prev => {
        const isBookmarked = prev.includes(topicToBookmark);
        if (isBookmarked) {
            return prev.filter(b => b !== topicToBookmark);
        } else {
            return [topicToBookmark, ...prev];
        }
    });
  }, []);

  const handleBookmarkClick = (bookmarkedTopic: string) => {
      setTopic(bookmarkedTopic);
      clearAllOutputs();
      setActiveView(null);
      setMainView('generator');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleQuizComplete = useCallback((results: { correctCount: number; streak: number; mode: string }) => {
    setGamificationData(prev => {
        const newXp = prev.xp + (results.correctCount * XP_PER_CORRECT_ANSWER);
        const newLevel = prev.level + Math.floor(newXp / XP_FOR_LEVEL_UP);
        const remainingXp = newXp % XP_FOR_LEVEL_UP;

        const newStats = {
            quizzesCompleted: (prev.stats?.quizzesCompleted || 0) + 1,
            correctAnswers: (prev.stats?.correctAnswers || 0) + results.correctCount,
            highestStreak: Math.max(prev.stats?.highestStreak || 0, results.streak),
        };

        const newlyUnlockedBadges = checkAndAwardBadges(newStats, prev.badges);
        
        return {
            ...prev,
            level: newLevel,
            xp: remainingXp,
            stats: newStats,
            badges: [...prev.badges, ...newlyUnlockedBadges],
        };
    });
  }, []);

  const toggleTheme = () => setIsDarkMode(prevMode => !prevMode);
  
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTopic = e.target.value;
    setTopic(newTopic);
    if (newTopic.trim() !== topic.trim()) {
        clearTopicOutputs();
        setActiveView(null);
    }
  };
  
  const isTopicBookmarked = bookmarkedTopics.includes(topic);

  const renderGeneratorView = () => (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
            <input
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="Enter a study topic..."
              className="w-full px-4 py-3 text-lg bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
              disabled={isLoading}
            />
            <button
                onClick={() => handleToggleBookmark(topic)}
                disabled={!topic.trim()}
                className="p-3 rounded-full text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={isTopicBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                title={isTopicBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
                {isTopicBookmarked ? <StarFilledIcon /> : <StarIcon />}
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          <button
            onClick={handleGenerateNotes}
            disabled={isLoading || !topic.trim()}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
          >
            Generate Notes
          </button>
          <button
            onClick={handleGenerateConceptMap}
            disabled={isLoading || !topic.trim()}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
          >
            Concept Map
          </button>
          <div className="flex flex-col gap-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
            <label className="font-semibold text-center text-slate-700 dark:text-slate-300">
              Quiz Difficulty
            </label>
            <div className="flex justify-center gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 disabled:cursor-not-allowed ${
                    difficulty === level
                      ? 'bg-teal-500 text-white shadow'
                      : 'bg-white dark:bg-slate-600 hover:bg-teal-100 dark:hover:bg-slate-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={isLoading || !topic.trim()}
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>
      <div className="my-8 text-center">
        <span className="text-slate-500 dark:text-slate-400 font-semibold">OR</span>
      </div>
      <FileUpload onFileUpload={handleGenerateFromFile} isLoading={isLoading} />
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <main className="w-full max-w-4xl mx-auto flex-grow">
        <header className="text-center my-8 md:my-12 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
            StudyMate
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-slate-600 dark:text-slate-400">
            Your AI Study Assistant
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full">
           <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setMainView('generator')}
                    className={`flex-1 py-4 px-2 text-lg font-semibold flex items-center justify-center gap-2 transition-colors ${mainView === 'generator' ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-900/50 rounded-tl-2xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                    <GeneratorIcon />
                    Generator
                </button>
                 <button 
                    onClick={() => setMainView('quizArena')}
                    className={`flex-1 py-4 px-2 text-lg font-semibold flex items-center justify-center gap-2 transition-colors ${mainView === 'quizArena' ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-900/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                    <QuizArenaIcon />
                    Quiz Arena
                </button>
                <button 
                    onClick={() => setMainView('planner')}
                    className={`flex-1 py-4 px-2 text-lg font-semibold flex items-center justify-center gap-2 transition-colors ${mainView === 'planner' ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-900/50 rounded-tr-2xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                    <PlannerIcon />
                    Planner
                </button>
           </div>
           <div className="p-6 relative">
                {mainView === 'generator' && renderGeneratorView()}
                {mainView === 'planner' && (
                    <Planner 
                        tasks={plannerTasks} 
                        onAddTask={handleAddTask} 
                        onUpdateTask={handleUpdateTask} 
                        onDeleteTask={handleDeleteTask}
                    />
                )}
                {mainView === 'quizArena' && (
                    <QuizArena
                        gamificationData={gamificationData}
                        xpForLevelUp={XP_FOR_LEVEL_UP}
                        onQuizComplete={handleQuizComplete}
                        allBadges={ALL_BADGES}
                    />
                )}
           </div>
        </div>

        {mainView === 'generator' && (
          <>
            <div className="mt-8">
                {activeView === 'topic' && (notes || quiz || conceptMap) && !isLoading && !error && (
                    <div className="bg-white dark:bg-slate-800 px-4 pt-4 sm:px-6 rounded-t-2xl shadow-lg animate-fade-in flex border-b border-slate-200 dark:border-slate-700">
                        {notes && (
                            <button onClick={() => setActiveTopicView('notes')} className={`px-4 py-3 font-semibold transition-colors ${activeTopicView === 'notes' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500'}`}>Notes</button>
                        )}
                        {conceptMap && (
                            <button onClick={() => setActiveTopicView('map')} className={`px-4 py-3 font-semibold transition-colors ${activeTopicView === 'map' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400 hover:text-purple-500'}`}>Concept Map</button>
                        )}
                        {quiz && (
                            <button onClick={() => setActiveTopicView('quiz')} className={`px-4 py-3 font-semibold transition-colors ${activeTopicView === 'quiz' ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 hover:text-teal-500'}`}>Quiz</button>
                        )}
                    </div>
                )}
              {isLoading ? (
                <Loader />
              ) : error ? (
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
                  {error}
                </div>
              ) : (
                <>
                  {activeView === 'topic' && activeTopicView === 'notes' && notes && (
                    <NotesCard topic={topic} content={notes} onSave={handleSaveContent} isSaved={isCurrentContentSaved} />
                  )}
                  {activeView === 'topic' && activeTopicView === 'quiz' && quiz && (
                    <QuizCard topic={topic} quiz={quiz} onSave={handleSaveContent} isSaved={isCurrentContentSaved} />
                  )}
                   {activeView === 'topic' && activeTopicView === 'map' && conceptMap && (
                    <ConceptMapCard topic={topic} mapData={conceptMap} onSave={handleSaveContent} isSaved={isCurrentContentSaved} isDarkMode={isDarkMode} />
                  )}
                  {activeView === 'file' && fileGeneratedContent && (
                     <FileResultCard
                        fileName={topic}
                        data={fileGeneratedContent}
                        onRelatedTopicClick={handleRelatedTopicClick}
                    />
                  )}
                </>
              )}
            </div>
            
            <BookmarksList
                bookmarks={bookmarkedTopics}
                onBookmarkClick={handleBookmarkClick}
                onToggleBookmark={handleToggleBookmark}
            />

            <SavedItemsList 
              items={savedItems}
              onView={handleViewSavedItem}
              onDelete={handleDeleteSavedItem}
            />
          </>
        )}
      </main>

      <footer className="w-full text-center p-4 mt-8 text-slate-500 dark:text-slate-400">
        <p>StudyMate – AI Study Assistant</p>
        <p>&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;