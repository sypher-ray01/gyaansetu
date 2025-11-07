import type { Badge, GamificationStats } from '../types';

export const ALL_BADGES: Badge[] = [
    { id: 'first_quiz', name: 'Novice', description: 'Complete your first quiz.' },
    { id: 'quiz_master_10', name: 'Apprentice', description: 'Answer 10 questions correctly.' },
    { id: 'quiz_master_50', name: 'Scholar', description: 'Answer 50 questions correctly.' },
    { id: 'streak_3', name: 'On a Roll', description: 'Get a 3-answer streak.' },
    { id: 'streak_5', name: 'Unstoppable', description: 'Get a 5-answer streak.' },
    { id: 'complete_5', name: 'Dedicated', description: 'Complete 5 quizzes.' },
];

export const checkAndAwardBadges = (stats: GamificationStats, currentBadges: string[]): string[] => {
    const newlyUnlocked: string[] = [];
    const hasBadge = (id: string) => currentBadges.includes(id);

    // First Quiz
    if (stats.quizzesCompleted >= 1 && !hasBadge('first_quiz')) {
        newlyUnlocked.push('first_quiz');
    }
    // Correct Answers
    if (stats.correctAnswers >= 10 && !hasBadge('quiz_master_10')) {
        newlyUnlocked.push('quiz_master_10');
    }
    if (stats.correctAnswers >= 50 && !hasBadge('quiz_master_50')) {
        newlyUnlocked.push('quiz_master_50');
    }
    // Streaks
    if (stats.highestStreak >= 3 && !hasBadge('streak_3')) {
        newlyUnlocked.push('streak_3');
    }
    if (stats.highestStreak >= 5 && !hasBadge('streak_5')) {
        newlyUnlocked.push('streak_5');
    }
    // Quizzes Completed
    if (stats.quizzesCompleted >= 5 && !hasBadge('complete_5')) {
        newlyUnlocked.push('complete_5');
    }
    
    return newlyUnlocked;
};
