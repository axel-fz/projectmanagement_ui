'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Task, TaskStatus, Priority, Manager } from '../../types';
import { INITIAL_MANAGERS } from '../../data/initialData';
import { useAppStore } from '../../store/useAppStore';
import { Calendar } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id'>) => void;
  initialTask?: Task | null;
  defaultProjectId?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultProjectId,
}) => {
  const projects = useAppStore((state) => state.projects);

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id ?? ''));
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [deadline, setDeadline] = useState('');
  const [managerId, setManagerId] = useState(INITIAL_MANAGERS[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setProjectId(initialTask.projectId);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setDeadline(initialTask.deadline);
      setManagerId(initialTask.assignee?.id || INITIAL_MANAGERS[0].id);
    } else {
      setTitle('');
      setProjectId(defaultProjectId || (projects[0]?.id ?? ''));
      setPriority(Priority.MEDIUM);
      setStatus(TaskStatus.TODO);
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDeadline(d.toISOString().split('T')[0]);
      setManagerId(INITIAL_MANAGERS[0].id);
    }
    setErrors({});
  }, [initialTask, isOpen, defaultProjectId, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Task title is required';
    if (!projectId) newErrors.projectId = 'Please select a project';
    if (!deadline) newErrors.deadline = 'Deadline is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignee =
      INITIAL_MANAGERS.find((m) => m.id === managerId) || INITIAL_MANAGERS[0];

    onSubmit({
      title: title.trim(),
      projectId,
      priority,
      status,
      deadline,
      assignee,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Add New Task'}
      description="Assign team members, set priority, and schedule deadlines."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <Input
          label="Task Description"
          placeholder="e.g. Implement OAuth Login"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        {/* Project Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--muted)]">
            Associated Project
          </label>
          <div className="relative">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-xl py-2 pl-3.5 pr-8 text-sm glass-input appearance-none cursor-pointer"
            >
              {projects.map((proj) => (
                <option
                  key={proj.id}
                  value={proj.id}
                  className="bg-[var(--surface)] text-[var(--text)]"
                >
                  {proj.name} ({proj.status})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
              ▼
            </div>
          </div>
          {errors.projectId && (
            <span className="text-xs text-rose-500">{errors.projectId}</span>
          )}
        </div>

        {/* Row: Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)]">
              Priority
            </label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl py-2 pl-3.5 pr-8 text-sm glass-input appearance-none cursor-pointer"
              >
                <option value={Priority.HIGH} className="bg-[var(--surface)] text-[var(--text)]">
                  High Priority
                </option>
                <option value={Priority.MEDIUM} className="bg-[var(--surface)] text-[var(--text)]">
                  Medium Priority
                </option>
                <option value={Priority.LOW} className="bg-[var(--surface)] text-[var(--text)]">
                  Low Priority
                </option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                ▼
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)]">
              Initial Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl py-2 pl-3.5 pr-8 text-sm glass-input appearance-none cursor-pointer"
              >
                <option value={TaskStatus.TODO} className="bg-[var(--surface)] text-[var(--text)]">
                  To Do
                </option>
                <option value={TaskStatus.IN_PROGRESS} className="bg-[var(--surface)] text-[var(--text)]">
                  In Progress
                </option>
                <option value={TaskStatus.DONE} className="bg-[var(--surface)] text-[var(--text)]">
                  Done
                </option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Row: Assignee & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)]">
              Assignee
            </label>
            <div className="relative">
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full rounded-xl py-2 pl-3.5 pr-8 text-sm glass-input appearance-none cursor-pointer"
              >
                {INITIAL_MANAGERS.map((mgr) => (
                  <option
                    key={mgr.id}
                    value={mgr.id}
                    className="bg-[var(--surface)] text-[var(--text)]"
                  >
                    {mgr.name} ({mgr.role})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                ▼
              </div>
            </div>
          </div>

          <Input
            label="Target Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            error={errors.deadline}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)] mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialTask ? 'Save Task' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

