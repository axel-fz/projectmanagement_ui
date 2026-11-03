'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Project, ProjectStatus, Manager } from '../../types';
import { INITIAL_MANAGERS } from '../../data/initialData';
import { Calendar, User, FolderPlus } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  initialProject?: Project | null;
}

const PRESET_COLORS = [
  '#7F77DD', // Purple
  '#38BDF8', // Cyan
  '#2DD4BF', // Teal
  '#FAC775', // Amber
  '#F472B6', // Pink
  '#C0DD97', // Lime
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState(INITIAL_MANAGERS[0].id);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.IN_PROGRESS);
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description);
      setManagerId(initialProject.manager.id);
      setDeadline(initialProject.deadline);
      setStatus(initialProject.status);
      setProgress(initialProject.progress);
      setColor(initialProject.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setDescription('');
      setManagerId(INITIAL_MANAGERS[0].id);
      // default deadline 30 days ahead
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDeadline(d.toISOString().split('T')[0]);
      setStatus(ProjectStatus.IN_PROGRESS);
      setProgress(50);
      setColor(PRESET_COLORS[0]);
    }
    setErrors({});
  }, [initialProject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Project name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!deadline) newErrors.deadline = 'Deadline is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedManager =
      INITIAL_MANAGERS.find((m) => m.id === managerId) || INITIAL_MANAGERS[0];

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      manager: selectedManager,
      deadline,
      status,
      progress: Number(progress),
      color,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProject ? 'Edit Project' : 'Create New Project'}
      description="Define the scope, manager, deadline, and tracking milestone."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Project Name */}
        <Input
          label="Project Title"
          placeholder="e.g. Next-Gen API Gateway"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--muted)]">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of the deliverables and milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl py-2 px-3.5 text-sm glass-input placeholder:text-[var(--muted)]/70 resize-none transition-all focus:ring-1 focus:ring-[var(--primary)]"
          />
          {errors.description && (
            <span className="text-xs text-rose-500">{errors.description}</span>
          )}
        </div>

        {/* Row: Manager & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)]">
              Assigned Manager
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

        {/* Row: Status & Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--muted)]">
              Project Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-xl py-2 pl-3.5 pr-8 text-sm glass-input appearance-none cursor-pointer"
              >
                <option value={ProjectStatus.IN_PROGRESS} className="bg-[var(--surface)] text-[var(--text)]">
                  In Progress
                </option>
                <option value={ProjectStatus.PENDING} className="bg-[var(--surface)] text-[var(--text)]">
                  Pending
                </option>
                <option value={ProjectStatus.COMPLETED} className="bg-[var(--surface)] text-[var(--text)]">
                  Completed
                </option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                ▼
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-[var(--muted)]">Progress Milestone</span>
              <span className="text-[var(--primary)] font-bold">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[var(--primary)] h-2 bg-black/10 dark:bg-white/10 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Accent Color Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--muted)]">
            Accent Brand Color
          </label>
          <div className="flex items-center gap-3">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105'
                }`}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)] mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

