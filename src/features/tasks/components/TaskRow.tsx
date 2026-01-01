import React from 'react';
import { Circle, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import type { Task, TaskPriority } from '../tasks.types';

interface TaskRowProps {
  task: Task;
  isSelected?: boolean;
  onUpdate: (id: string, payload: any) => void;
  onSelect: (task: Task) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, isSelected, onUpdate, onSelect }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';

  const statusIcons = {
    TODO: <Circle className="w-5 h-5 text-slate-300" />,
    IN_PROGRESS: <Clock className="w-5 h-5 text-blue-500 animate-pulse" />,
    DONE: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
  };

  const priorityColors = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-indigo-50 text-indigo-600',
    HIGH: 'bg-orange-50 text-orange-600'
  };

  return (
    <div onClick={() => onSelect(task)}
      className={`group flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-900'
        }`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate(task.id, { status: task.status === 'DONE' ? 'TODO' : 'DONE' });
        }}
        className="flex-shrink-0 transition-transform active:scale-90"
      >
        {statusIcons[task.status]}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold truncate ${task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
              <Clock className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString()}
              {isOverdue && <AlertCircle className="w-3 h-3" />}
            </span>
          )}
        </div>
      </div>

      {/* Priority Quick-Switcher (Hidden until hover for clean UI) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => onUpdate(task.id, { priority: p })}
            className={`w-2 h-2 rounded-full ${p === 'HIGH' ? 'bg-orange-400' : p === 'MEDIUM' ? 'bg-indigo-400' : 'bg-slate-300'} ${task.priority === p ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
          />
        ))}
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  );
};