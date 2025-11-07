import React from 'react';

export const ChallengeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="32" 
        height="32" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
    >
        <path d="m3.85 8.62 4-1.25a2 2 0 0 1 2.22.56l.56.56a2 2 0 0 0 2.84 0l.56-.56a2 2 0 0 1 2.22-.56l4 1.25"></path>
        <path d="M12 18V8"></path>
        <path d="M6 13.5V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6.5"></path>
    </svg>
);