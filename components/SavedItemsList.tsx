
import React, { useState } from 'react';
import type { SavedItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface SavedItemsListProps {
  items: SavedItem[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedItemsList: React.FC<SavedItemsListProps> = ({ items, onView, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item =>
    item.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-12 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">
        Saved Study Materials
      </h2>
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg">
        {items.length > 0 ? (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic..."
                className="w-full px-4 py-2 text-base bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                aria-label="Search saved materials"
              />
            </div>
            {filteredItems.length > 0 ? (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-4 animate-fade-in">
                    <div className="flex flex-col overflow-hidden mr-4">
                      <span className="font-semibold text-lg text-slate-800 dark:text-slate-200 capitalize truncate">{item.topic}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => onView(item.id)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        aria-label="Delete item"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                No materials found for "{searchQuery}".
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">
            You haven't saved any materials yet.
          </p>
        )}
      </div>
    </div>
  );
};
