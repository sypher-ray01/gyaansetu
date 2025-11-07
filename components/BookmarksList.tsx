import React from 'react';
import { StarFilledIcon } from './icons/StarFilledIcon';

interface BookmarksListProps {
  bookmarks: string[];
  onBookmarkClick: (topic: string) => void;
  onToggleBookmark: (topic: string) => void;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({ bookmarks, onBookmarkClick, onToggleBookmark }) => {
  return (
    <div className="mt-12 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">
        Bookmarked Topics
      </h2>
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg">
        {bookmarks.length > 0 ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {bookmarks.map((topic) => (
              <li key={topic} className="flex items-center justify-between py-3 animate-fade-in">
                <button 
                  onClick={() => onBookmarkClick(topic)}
                  className="text-left flex-grow text-lg font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 capitalize truncate transition-colors"
                  title={`Load topic: ${topic}`}
                >
                  {topic}
                </button>
                <button 
                  onClick={() => onToggleBookmark(topic)}
                  className="p-2 text-yellow-500 hover:bg-yellow-100/50 dark:hover:bg-slate-700 rounded-full transition-colors"
                  aria-label={`Remove bookmark for ${topic}`}
                  title={`Remove bookmark`}
                >
                  <StarFilledIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">
            Click the star next to the topic input to bookmark important topics.
          </p>
        )}
      </div>
    </div>
  );
};