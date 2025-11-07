import React, { useState, useMemo } from 'react';
import type { PlannerTask } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ExportIcon } from './icons/ExportIcon';
import { exportTasksToCSV } from '../utils/csvExporter';

interface PlannerProps {
  tasks: PlannerTask[];
  onAddTask: (task: Omit<PlannerTask, 'id' | 'completed'>) => void;
  onUpdateTask: (task: PlannerTask) => void;
  onDeleteTask: (id: string) => void;
}

const priorityColors = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

const getDeadlineColor = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 0) return 'text-red-500 font-semibold';
    if (diffDays <= 3) return 'text-yellow-500 font-semibold';
    return 'text-slate-500 dark:text-slate-400';
};

export const Planner: React.FC<PlannerProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [topic, setTopic] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !deadline) return;
    onAddTask({ topic, deadline, priority });
    setTopic('');
    setDeadline('');
    setPriority('Medium');
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Study Task</h3>
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Learn React Hooks"
            required
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          Add Task
        </button>
      </form>

      <hr className="border-slate-200 dark:border-slate-700"/>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Tasks</h3>
            <div className="flex items-center gap-2">
                 <button onClick={() => exportTasksToCSV(tasks)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors">
                    <ExportIcon />
                    Export CSV
                </button>
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value as any)}
                    className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
        <ul className="space-y-3">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <li key={task.id} className={`flex items-center p-3 rounded-lg transition-colors ${task.completed ? 'bg-slate-100 dark:bg-slate-700/50' : 'bg-white dark:bg-slate-800'}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onUpdateTask({ ...task, completed: !task.completed })}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="ml-3 flex-grow">
                <p className={`font-medium ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.topic}</p>
                <p className={`text-sm ${getDeadlineColor(task.deadline)}`}>
                  Due: {new Date(task.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} title={`Priority: ${task.priority}`}></span>
                 <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <TrashIcon />
                 </button>
              </div>
            </li>
          )) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">No tasks to show.</p>
          )}
        </ul>
      </div>
    </div>
  );
};