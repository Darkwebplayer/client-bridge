import React, { useState, useEffect } from 'react';
import { TodoList } from './TodoList';
import { useTodos } from '../../hooks/useTodos';

interface ProjectTasksProps {
  projectId: string;
  onProgressUpdate?: (progress: number) => void;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, onProgressUpdate }) => {
  const { todos, refetch } = useTodos(projectId);

  // Calculate progress stats
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Notify parent component of progress updates
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progress);
    }
  }, [progress, onProgressUpdate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Tasks</h3>
        <p className="text-sm text-gray-600 mb-4 sm:mb-6">
          Track progress with organized tasks and milestones • {completedTasks}/{totalTasks} completed ({progress}%)
        </p>
      </div>
      <TodoList projectId={projectId} onUpdate={refetch} />
    </div>
  );
};