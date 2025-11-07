import React, { useState, useEffect } from 'react';

interface LevelProgressBarProps {
    level: number;
    xp: number;
    maxXp: number;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ level, xp, maxXp }) => {
    const [isLevelingUp, setIsLevelingUp] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);

    useEffect(() => {
        if (level > prevLevel) {
            setIsLevelingUp(true);
            const timer = setTimeout(() => setIsLevelingUp(false), 1500); // Duration of the animation
            setPrevLevel(level);
            return () => clearTimeout(timer);
        }
    }, [level, prevLevel]);

    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const progress = (xp / maxXp) * circumference;

    return (
        <div 
            className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 shadow-md ${isLevelingUp ? 'animate-level-up' : ''}`}
            title={`Level ${level} | ${xp}/${maxXp} XP`}
        >
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="10"
                    className="stroke-slate-200 dark:stroke-slate-600"
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    strokeWidth="10"
                    className="stroke-indigo-500"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        transition: 'stroke-dashoffset 0.5s ease-out'
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">LVL</span>
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-200">{level}</span>
            </div>
        </div>
    );
};
