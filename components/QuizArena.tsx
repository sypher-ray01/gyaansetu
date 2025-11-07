import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Quiz, Difficulty, QuizMode, GamificationData, Badge } from '../types';
import { generateQuiz } from '../services/geminiService';
import { Loader } from './Loader';
import { McqIcon } from './icons/McqIcon';
import { RapidFireIcon } from './icons/RapidFireIcon';
import { ChallengeIcon } from './icons/ChallengeIcon';
import { LevelProgressBar } from './LevelProgressBar';
import { BadgeIcon } from './icons/BadgeIcon';

interface QuizArenaProps {
    gamificationData: GamificationData;
    xpForLevelUp: number;
    onQuizComplete: (results: { correctCount: number; streak: number; mode: QuizMode }) => void;
    allBadges: Badge[];
}

const RAPID_FIRE_TIMER = 15; // 15 seconds per question

export const QuizArena: React.FC<QuizArenaProps> = ({ gamificationData, xpForLevelUp, onQuizComplete, allBadges }) => {
    const [quizState, setQuizState] = useState<'setup' | 'loading' | 'active' | 'results'>('setup');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [mode, setMode] = useState<QuizMode>('mcq');

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timer, setTimer] = useState(RAPID_FIRE_TIMER);
    
    const [levelBeforeQuiz, setLevelBeforeQuiz] = useState(gamificationData.level);
    const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

    const unlockedBadgeDetails = useMemo(() => {
        return allBadges.filter(b => gamificationData.badges.includes(b.id));
    }, [gamificationData.badges, allBadges]);

    // Timer logic for Rapid Fire mode
    useEffect(() => {
        if (quizState === 'active' && mode === 'rapid' && quiz) {
            if (timer > 0) {
                const interval = setInterval(() => setTimer(t => t - 1), 1000);
                return () => clearInterval(interval);
            } else {
                handleAnswer(null); // Timeout counts as wrong answer
            }
        }
    }, [quizState, mode, timer, quiz]);

    const startQuiz = async () => {
        if (!topic.trim()) return;
        setQuizState('loading');
        try {
            const numQuestions = mode === 'rapid' ? 5 : 3;
            const quizDifficulty = mode === 'challenge' ? 'Hard' : difficulty;
            const generatedQuiz = await generateQuiz(topic, quizDifficulty, numQuestions);
            setQuiz(generatedQuiz);
            setLevelBeforeQuiz(gamificationData.level);
            setNewlyUnlockedBadges([]);
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setScore(0);
            setStreak(0);
            setMaxStreak(0);
            setQuizState('active');
            setTimer(RAPID_FIRE_TIMER);
        } catch (error) {
            console.error(error);
            // TODO: show error message
            setQuizState('setup');
        }
    };
    
    const handleAnswer = useCallback((answer: string | null) => {
        if (!quiz) return;
        const isCorrect = answer === quiz.questions[currentQuestionIndex].correctAnswer;
        
        let currentStreak = streak;
        if (isCorrect) {
            setScore(s => s + 1);
            currentStreak = streak + 1;
            setStreak(currentStreak);
        } else {
            currentStreak = 0;
            setStreak(0);
        }
        setMaxStreak(s => Math.max(s, currentStreak));
        setUserAnswers(prev => [...prev, answer ?? '']);

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            if (mode === 'rapid') setTimer(RAPID_FIRE_TIMER);
        } else {
            // Quiz finished
            const results = { correctCount: isCorrect ? score + 1 : score, streak: Math.max(maxStreak, currentStreak), mode };
            const oldBadges = new Set(gamificationData.badges);
            onQuizComplete(results);
            // We need to wait for the state update to find new badges
            // This is a bit of a hack, a better way would be for onQuizComplete to return the new badges
            setTimeout(() => {
                const updatedData = JSON.parse(localStorage.getItem('studyMate_gamification') || '{}');
                const newBadges = updatedData.badges.filter((b: string) => !oldBadges.has(b));
                setNewlyUnlockedBadges(allBadges.filter(b => newBadges.includes(b.id)));
            }, 100);

            setQuizState('results');
        }
    }, [quiz, currentQuestionIndex, score, streak, maxStreak, mode, onQuizComplete, gamificationData.badges, allBadges]);
    
    const resetArena = () => {
        setQuizState('setup');
        setTopic('');
    };

    if (quizState === 'loading') return <Loader />;

    if (quizState === 'active' && quiz) {
        const question = quiz.questions[currentQuestionIndex];
        return (
            <div className="animate-fade-in">
                <div className="absolute top-4 right-4">
                    <LevelProgressBar level={gamificationData.level} xp={gamificationData.xp} maxXp={xpForLevelUp} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white capitalize">{topic}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                {mode === 'rapid' && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 linear" style={{ width: `${(timer / RAPID_FIRE_TIMER) * 100}%` }}></div>
                    </div>
                )}
                 {mode === 'challenge' && <p className="mb-4 font-semibold text-amber-500">Streak: {streak} 🔥</p>}
                
                <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map(option => (
                        <button key={option} onClick={() => handleAnswer(option)} className="p-4 text-lg text-left bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors">
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    if (quizState === 'results' && quiz) {
         const levelledUp = gamificationData.level > levelBeforeQuiz;
         return (
            <div className="text-center animate-fade-in">
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Quiz Complete!</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">You scored {score} out of {quiz.questions.length}</p>

                {levelledUp && <p className="text-2xl font-bold text-indigo-500 mb-4 animate-bounce">Level Up! You are now Level {gamificationData.level}!</p>}
                
                {newlyUnlockedBadges.length > 0 && (
                    <div className="my-6">
                        <h3 className="text-xl font-semibold mb-2">New Badges Unlocked!</h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {newlyUnlockedBadges.map(badge => (
                                <div key={badge.id} className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300" title={badge.description}>
                                    <BadgeIcon />
                                    <span className="font-semibold ml-2">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={resetArena} className="mt-6 w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    Play Again
                </button>
            </div>
         );
    }

    // Setup View
    return (
        <div className="animate-fade-in">
            <div className="absolute top-4 right-4">
                <LevelProgressBar level={gamificationData.level} xp={gamificationData.xp} maxXp={xpForLevelUp} />
            </div>
            <h2 className="text-2xl text-center font-bold mb-6 text-slate-900 dark:text-white">Welcome to the Quiz Arena</h2>
            
            <div className="space-y-6">
                <div>
                    <label htmlFor="quiz-topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                    <input type="text" id="quiz-topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="What do you want to be quizzed on?" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                
                { mode !== 'challenge' && <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
                    <div className="flex justify-center gap-2">
                        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                            <button key={level} onClick={() => setDifficulty(level)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${difficulty === level ? 'bg-teal-500 text-white shadow' : 'bg-white dark:bg-slate-600 hover:bg-teal-100 dark:hover:bg-slate-500'}`}>
                                {level}
                            </button>
                        ))}
                    </div>
                </div>}

                <div>
                     <label className="block text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-2">Quiz Mode</label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => setMode('mcq')} className={`p-4 rounded-lg border-2 text-center transition-all ${mode === 'mcq' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                            <McqIcon className="mx-auto mb-2" />
                            <h4 className="font-semibold">Classic MCQ</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Standard multiple choice.</p>
                        </button>
                        <button onClick={() => setMode('rapid')} className={`p-4 rounded-lg border-2 text-center transition-all ${mode === 'rapid' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                            <RapidFireIcon className="mx-auto mb-2" />
                            <h4 className="font-semibold">Rapid Fire</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Answer against the clock.</p>
                        </button>
                        <button onClick={() => setMode('challenge')} className={`p-4 rounded-lg border-2 text-center transition-all ${mode === 'challenge' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                            <ChallengeIcon className="mx-auto mb-2" />
                            <h4 className="font-semibold">Challenge</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hard questions, track your streak.</p>
                        </button>
                     </div>
                </div>

                <button onClick={startQuiz} disabled={!topic.trim()} className="w-full px-6 py-4 text-xl font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-all transform hover:scale-105 disabled:scale-100">
                    Start Quiz
                </button>
            </div>

            <div className="mt-12">
                <h3 className="text-xl font-bold text-center mb-4">Unlocked Badges</h3>
                {unlockedBadgeDetails.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-3">
                        {unlockedBadgeDetails.map(badge => (
                             <div key={badge.id} className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-md" title={badge.description}>
                                <BadgeIcon />
                                <span className="text-sm font-medium">{badge.name}</span>
                             </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400">Play quizzes to unlock badges!</p>
                )}
            </div>
        </div>
    );
};
