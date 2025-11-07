import type { PlannerTask } from '../types';

export const exportTasksToCSV = (tasks: PlannerTask[]) => {
  if (tasks.length === 0) {
    alert("No tasks to export.");
    return;
  }

  const headers = ['Topic', 'Deadline', 'Priority', 'Status'];
  const rows = tasks.map(task => [
    `"${task.topic.replace(/"/g, '""')}"`, // Escape double quotes
    task.deadline,
    task.priority,
    task.completed ? 'Completed' : 'Active'
  ]);

  let csvContent = "data:text/csv;charset=utf-s8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `StudyMate_Planner_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};