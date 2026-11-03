'use client';

import React, { useState, useMemo } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ProjectFormModal } from './ProjectFormModal';
import { useAppStore } from '../../store/useAppStore';
import { Project, ProjectStatus } from '../../types';
import {
  Search,
  Plus,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
  ExternalLink,
  Layers,
  Users,
} from 'lucide-react';

export const ProjectList: React.FC = () => {
  const projects = useAppStore((state) => state.projects);
  const tasks = useAppStore((state) => state.tasks);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const deleteProject = useAppStore((state) => state.deleteProject);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useAppStore((state) => state.setSelectedProjectId);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  // Local filtering and sorting
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'name'>('deadline');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Filtered and sorted project array
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Combined global and local search
        const query = (localSearch || searchQuery).toLowerCase().trim();
        const matchesQuery =
          !query ||
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.manager.name.toLowerCase().includes(query);

        // Status filter
        const matchesStatus =
          statusFilter === 'ALL' || project.status === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'progress') {
          return b.progress - a.progress;
        }
        return a.name.localeCompare(b.name);
      });
  }, [projects, localSearch, searchQuery, statusFilter, sortBy]);

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setDeletingProject(project);
  };

  const handleCardClick = (project: Project) => {
    if (selectedProjectId === project.id) {
      setSelectedProjectId(null);
    } else {
      setSelectedProjectId(project.id);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Section Header & Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
            Project Portfolio
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary-tint)] text-[var(--primary)] font-semibold">
            {filteredProjects.length}
          </span>
          {selectedProjectId && (
            <button
              onClick={() => setSelectedProjectId(null)}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline ml-2"
            >
              Clear project filter
            </button>
          )}
        </div>

        {/* Filter and Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative w-40 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              title="Search projects by name, description, or assigned manager"
              className="w-full rounded-xl py-1.5 pl-8 pr-3 text-xs glass-input placeholder:text-[var(--muted)]/70"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              title="Filter projects by lifecycle status"
              className="rounded-xl py-1.5 pl-3 pr-7 text-xs glass-input appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">
                All Statuses
              </option>
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
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              title="Sort projects by deadline, progress percentage, or name"
              className="rounded-xl py-1.5 pl-3 pr-7 text-xs glass-input appearance-none cursor-pointer"
            >
              <option value="deadline" className="bg-[var(--surface)] text-[var(--text)]">
                Deadline
              </option>
              <option value="progress" className="bg-[var(--surface)] text-[var(--text)]">
                Progress
              </option>
              <option value="name" className="bg-[var(--surface)] text-[var(--text)]">
                Name
              </option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Add Project Button */}
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            title="Create a new project initiative with manager, deadline, and color"
            onClick={() => {
              setEditingProject(null);
              setIsFormOpen(true);
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Grid of Frosted Glass Project Cards */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel text-center flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--border)]">
          <Layers className="w-8 h-8 text-[var(--muted)]" />
          <p className="text-sm font-medium text-[var(--muted)]">
            No projects match the specified search or filter criteria.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setLocalSearch('');
              setStatusFilter('ALL');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProjects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            return (
              <GlassCard
                key={project.id}
                interactive
                onClick={() => handleCardClick(project)}
                title={`Project: ${project.name} (${project.progress}% progress). Click to focus deliverables in Team Tasks.`}
                className={`p-4 flex flex-col justify-between gap-4 border transition-all duration-200 relative group overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[var(--primary)] border-[var(--primary)] shadow-lg shadow-indigo-500/20'
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                {/* Top Accent Strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: project.color || 'var(--primary)' }}
                />

                {/* Card Title & Status Badge */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {project.name}
                    </h3>
                    <Badge status={project.status} size="sm" />
                  </div>

                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Manager & Deadline */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                        Manager
                      </span>
                      <div
                        className="flex items-center gap-1.5 mt-0.5"
                        title={`Project Manager: ${project.manager.name} (${project.manager.role || 'Lead'})`}
                      >
                        <img
                          src={project.manager.avatarUrl}
                          alt={project.manager.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <span className="text-xs font-medium text-[var(--text)]">
                          {project.manager.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
                      <button
                        onClick={(e) => handleEditClick(e, project)}
                        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit project details, deadline, and assigned manager"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, project)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete project and all associated tasks"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Deadline text */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span>
                      Deadline:{' '}
                      {new Date(project.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] text-[var(--muted)]">Progress</span>
                      <span className="font-semibold text-[var(--text)]">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: project.color || 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* People Involved & Quick Jump to Tasks */}
                  {(() => {
                    const projectTasks = tasks.filter((t) => t.projectId === project.id);
                    const teamPeople = new Map<string, any>();
                    if (project.manager) teamPeople.set(project.manager.id, project.manager);
                    projectTasks.forEach((t) => {
                      if (t.assignee) teamPeople.set(t.assignee.id, t.assignee);
                    });
                    const teamList = Array.from(teamPeople.values());

                    return (
                      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border)] text-xs">
                        <div
                          className="flex items-center gap-1.5"
                          title={`People involved: ${teamList.map((p) => p.name).join(', ')}`}
                        >
                          <div className="flex items-center -space-x-1.5">
                            {teamList.slice(0, 3).map((person) => (
                              <img
                                key={person.id}
                                src={person.avatarUrl}
                                alt={person.name}
                                className="w-4 h-4 rounded-full object-cover ring-1 ring-[var(--surface)]"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-[var(--muted)] font-medium">
                            {teamList.length} team • {projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectId(project.id);
                            const section = document.getElementById('team-tasks-section');
                            if (section) {
                              section.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              setActiveTab('tasks');
                            }
                          }}
                          title={`Focus all ${projectTasks.length} deliverables and team members for ${project.name}`}
                          className="text-[10px] text-[var(--primary)] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          Tasks & Team →
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Project Creation/Edit Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        initialProject={editingProject}
        onSubmit={(data) => {
          if (editingProject) {
            updateProject(editingProject.id, data);
          } else {
            addProject(data);
          }
        }}
      />

      {/* Project Deletion Confirmation Dialog (Cascading delete warning) */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deletingProject?.name}"? Warning: All associated tasks for this project will be deleted in a cascade.`}
        confirmText="Delete Project & Tasks"
        onConfirm={() => {
          if (deletingProject) {
            deleteProject(deletingProject.id);
            setDeletingProject(null);
          }
        }}
      />
    </section>
  );
};

