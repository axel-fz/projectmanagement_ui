'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TaskFormModal } from './TaskFormModal';
import { useAppStore } from '../../store/useAppStore';
import { Task, TaskStatus, Priority, Manager, Project } from '../../types';
import {
  Search,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Layers,
  Users,
  User,
  X,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';

export const TaskTable: React.FC = () => {
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const updateTaskStatus = useAppStore((state) => state.updateTaskStatus);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useAppStore((state) => state.setSelectedProjectId);

  // Local filtering states
  const [localSearch, setLocalSearch] = useState('');
  const [personFilter, setPersonFilter] = useState<'ALL' | string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Priority>('ALL');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const [todayStr, setTodayStr] = useState('2026-11-03');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Project map for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  // Unique list of all team members / managers involved across projects and tasks
  const allPeople = useMemo(() => {
    const peopleMap = new Map<string, Manager>();
    projects.forEach((p) => {
      if (p.manager) peopleMap.set(p.manager.id, p.manager);
    });
    tasks.forEach((t) => {
      if (t.assignee) peopleMap.set(t.assignee.id, t.assignee);
    });
    return Array.from(peopleMap.values());
  }, [projects, tasks]);

  // Currently selected project
  const selectedProject = useMemo(() => {
    if (!selectedProjectId || selectedProjectId === 'ALL') return null;
    return projectMap.get(selectedProjectId) || null;
  }, [selectedProjectId, projectMap]);

  // People involved in the selected project (Project Lead + Task Assignees)
  const projectTeamInfo = useMemo(() => {
    if (!selectedProject) return null;

    const projectTasks = tasks.filter((t) => t.projectId === selectedProject.id);
    const contributorsMap = new Map<string, { manager: Manager; taskCount: number }>();

    projectTasks.forEach((t) => {
      if (t.assignee) {
        const existing = contributorsMap.get(t.assignee.id);
        if (existing) {
          existing.taskCount += 1;
        } else {
          contributorsMap.set(t.assignee.id, { manager: t.assignee, taskCount: 1 });
        }
      }
    });

    const isLeadAlsoAssignee = contributorsMap.has(selectedProject.manager.id);
    const contributors = Array.from(contributorsMap.values()).filter(
      (c) => c.manager.id !== selectedProject.manager.id
    );

    return {
      projectTasksCount: projectTasks.length,
      lead: selectedProject.manager,
      leadTaskCount: contributorsMap.get(selectedProject.manager.id)?.taskCount || 0,
      contributors,
      totalTeamCount: contributorsMap.size + (isLeadAlsoAssignee ? 0 : 1),
    };
  }, [selectedProject, tasks]);

  // Combined search query (task search input or global search)
  const effectiveQuery = (localSearch || searchQuery).toLowerCase().trim();

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const project = projectMap.get(task.projectId);

      // Search matching across:
      // - Task title
      // - Associated project name
      // - Associated project description
      // - Project manager name & role (person involved)
      // - Task assignee name & role (person involved)
      const matchesQuery =
        !effectiveQuery ||
        task.title.toLowerCase().includes(effectiveQuery) ||
        (project && project.name.toLowerCase().includes(effectiveQuery)) ||
        (project && project.description.toLowerCase().includes(effectiveQuery)) ||
        (project && project.manager.name.toLowerCase().includes(effectiveQuery)) ||
        (project && project.manager.role?.toLowerCase().includes(effectiveQuery)) ||
        (task.assignee && task.assignee.name.toLowerCase().includes(effectiveQuery)) ||
        (task.assignee && task.assignee.role?.toLowerCase().includes(effectiveQuery));

      // Project filter
      const matchesProject =
        !selectedProjectId || selectedProjectId === 'ALL' || task.projectId === selectedProjectId;

      // Person filter
      const matchesPerson =
        personFilter === 'ALL' ||
        (task.assignee && task.assignee.id === personFilter) ||
        (project && project.manager.id === personFilter);

      // Status filter
      const matchesStatus =
        statusFilter === 'ALL' || task.status === statusFilter;

      // Priority filter
      const matchesPriority =
        priorityFilter === 'ALL' || task.priority === priorityFilter;

      return matchesQuery && matchesProject && matchesPerson && matchesStatus && matchesPriority;
    });
  }, [
    tasks,
    effectiveQuery,
    selectedProjectId,
    personFilter,
    statusFilter,
    priorityFilter,
    projectMap,
  ]);

  // People involved in current search results
  const searchMatchedTeam = useMemo(() => {
    if (!effectiveQuery) return [];
    const peopleMap = new Map<string, Manager>();
    filteredTasks.forEach((task) => {
      if (task.assignee) peopleMap.set(task.assignee.id, task.assignee);
      const proj = projectMap.get(task.projectId);
      if (proj?.manager) peopleMap.set(proj.manager.id, proj.manager);
    });
    return Array.from(peopleMap.values());
  }, [filteredTasks, effectiveQuery, projectMap]);

  // Projects involved in current search results
  const searchMatchedProjects = useMemo(() => {
    if (!effectiveQuery) return [];
    const projMap = new Map<string, Project>();
    filteredTasks.forEach((task) => {
      const proj = projectMap.get(task.projectId);
      if (proj) projMap.set(proj.id, proj);
    });
    return Array.from(projMap.values());
  }, [filteredTasks, effectiveQuery, projectMap]);

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((tId) => tId !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setSearchQuery('');
    setSelectedProjectId(null);
    setPersonFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  return (
    <section id="team-tasks-section" className="flex flex-col gap-4 scroll-mt-20">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
            Team Tasks
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary-tint)] text-[var(--primary)] font-semibold">
            {filteredTasks.length}
          </span>
          {(selectedProjectId || personFilter !== 'ALL' || effectiveQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[var(--muted)] hover:text-rose-500 underline ml-2 cursor-pointer transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Filter and Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search Input */}
          <div className="relative w-44 sm:w-56 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search tasks, projects, people..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              title="Search deliverables by task name, project name, or assigned team member"
              className="w-full rounded-xl py-1.5 pl-8 pr-7 text-xs glass-input placeholder:text-[var(--muted)]/70 transition-all focus:ring-1 focus:ring-[var(--primary)]"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                title="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Project Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedProjectId || 'ALL'}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedProjectId(val === 'ALL' ? null : val);
                setPersonFilter('ALL');
              }}
              className="rounded-xl py-1.5 pl-3 pr-7 text-xs glass-input appearance-none cursor-pointer max-w-[150px] truncate"
              title="Filter deliverables by project initiative"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">
                All Projects
              </option>
              {projects.map((proj) => {
                const count = tasks.filter((t) => t.projectId === proj.id).length;
                return (
                  <option
                    key={proj.id}
                    value={proj.id}
                    className="bg-[var(--surface)] text-[var(--text)]"
                  >
                    {proj.name} ({count})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* People Involved Filter Dropdown */}
          <div className="relative">
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="rounded-xl py-1.5 pl-3 pr-7 text-xs glass-input appearance-none cursor-pointer max-w-[140px] truncate"
              title="Filter deliverables by team member (lead or assignee)"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">
                All People
              </option>
              {allPeople.map((person) => (
                <option
                  key={person.id}
                  value={person.id}
                  className="bg-[var(--surface)] text-[var(--text)]"
                >
                  {person.name} ({person.role || 'Member'})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl py-1.5 pl-3 pr-7 text-xs glass-input appearance-none cursor-pointer"
              title="Filter deliverables by lifecycle status"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">
                All Statuses
              </option>
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
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="rounded-xl py-1.5 pl-3 pr-7 text-xs glass-input appearance-none cursor-pointer"
              title="Filter deliverables by priority urgency"
            >
              <option value="ALL" className="bg-[var(--surface)] text-[var(--text)]">
                All Priorities
              </option>
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
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Add Task Button */}
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            title="Create a new deliverable linked to any project initiative"
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* 1. PEOPLE INVOLVED IN SELECTED PROJECT BANNER */}
      {selectedProject && projectTeamInfo && (
        <div className="p-4 rounded-2xl glass-panel border border-[var(--border)] flex flex-col gap-3 transition-all animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: selectedProject.color || 'var(--primary)' }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--primary)]">
                    Project Focused
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                    {selectedProject.name}
                  </h3>
                  <Badge status={selectedProject.status} size="sm" />
                </div>
                <p className="text-xs text-[var(--muted)] line-clamp-1 mt-0.5">
                  {selectedProject.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              <span className="text-xs text-[var(--muted)]">
                Progress:{' '}
                <strong className="text-[var(--text)] font-semibold">
                  {selectedProject.progress}%
                </strong>
              </span>
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setPersonFilter('ALL');
                }}
                className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline font-medium cursor-pointer"
              >
                <span>View All Projects</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* People Involved interactive roster */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)] shrink-0">
              <Users className="w-4 h-4 text-[var(--primary)]" />
              <span>People Involved ({projectTeamInfo.totalTeamCount}):</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* All Team Button */}
              <button
                type="button"
                onClick={() => setPersonFilter('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  personFilter === 'ALL'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/10'
                }`}
              >
                All Team ({projectTeamInfo.projectTasksCount} tasks)
              </button>

              {/* Project Lead Card / Chip */}
              <button
                type="button"
                onClick={() =>
                  setPersonFilter(
                    personFilter === projectTeamInfo.lead.id
                      ? 'ALL'
                      : projectTeamInfo.lead.id
                  )
                }
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                  personFilter === projectTeamInfo.lead.id
                    ? 'bg-[var(--primary-tint)] text-[var(--primary)] border-[var(--primary)] shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--text)] border-transparent hover:border-[var(--border)]'
                }`}
                title={`Project Manager: ${projectTeamInfo.lead.name} (${projectTeamInfo.lead.role || 'Lead'})`}
              >
                <img
                  src={projectTeamInfo.lead.avatarUrl}
                  alt={projectTeamInfo.lead.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-[var(--primary)]"
                />
                <span className="font-semibold">{projectTeamInfo.lead.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--primary)] text-white font-bold tracking-wider uppercase">
                  Lead
                </span>
                {projectTeamInfo.leadTaskCount > 0 && (
                  <span className="text-[10px] text-[var(--muted)]">
                    ({projectTeamInfo.leadTaskCount})
                  </span>
                )}
              </button>

              {/* Contributors / Task Assignees */}
              {projectTeamInfo.contributors.map(({ manager, taskCount }) => {
                const isSelected = personFilter === manager.id;
                return (
                  <button
                    key={manager.id}
                    type="button"
                    onClick={() =>
                      setPersonFilter(isSelected ? 'ALL' : manager.id)
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--primary-tint)] text-[var(--primary)] border-[var(--primary)] shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 text-[var(--text)] border-transparent hover:border-[var(--border)]'
                    }`}
                    title={`${manager.name} (${manager.role || 'Contributor'}) - ${taskCount} assigned tasks`}
                  >
                    <img
                      src={manager.avatarUrl}
                      alt={manager.name}
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20"
                    />
                    <span>{manager.name}</span>
                    <span className="text-[10px] text-[var(--muted)]">
                      ({taskCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC SEARCH RESULTS & MATCHED TEAM SUMMARY (when searching without a single project selected) */}
      {!selectedProject && effectiveQuery && (
        <div className="p-3.5 rounded-2xl glass-panel border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <Search className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="text-[var(--text)] font-medium">
              Search results for:{' '}
              <span className="text-[var(--primary)] font-bold">
                "{localSearch || searchQuery}"
              </span>
            </span>
            <span className="text-[var(--muted)]">
              — {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </span>

            {/* Matched Projects Badges */}
            {searchMatchedProjects.length > 0 && (
              <div className="flex items-center gap-1.5 ml-2 flex-wrap">
                <span className="text-[var(--muted)] font-medium">Projects:</span>
                {searchMatchedProjects.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      setLocalSearch('');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--primary-tint)] text-[var(--primary)] hover:opacity-80 transition-opacity font-semibold cursor-pointer"
                  >
                    <FolderKanban className="w-3 h-3" />
                    <span>{p.name}</span>
                  </button>
                ))}
                {searchMatchedProjects.length > 3 && (
                  <span className="text-[10px] text-[var(--muted)]">
                    +{searchMatchedProjects.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* People involved in matched tasks */}
          <div className="flex items-center gap-2 flex-wrap">
            {searchMatchedTeam.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--muted)]">People involved:</span>
                <div className="flex items-center -space-x-1.5">
                  {searchMatchedTeam.slice(0, 5).map((person) => (
                    <img
                      key={person.id}
                      src={person.avatarUrl}
                      alt={person.name}
                      title={`${person.name} (${person.role || 'Member'})`}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[var(--surface)]"
                    />
                  ))}
                </div>
                <span className="text-[var(--text)] font-medium">
                  {searchMatchedTeam.slice(0, 3).map((p) => p.name).join(', ')}
                  {searchMatchedTeam.length > 3 && ` +${searchMatchedTeam.length - 3}`}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setLocalSearch('');
                setSearchQuery('');
              }}
              className="text-xs text-[var(--muted)] hover:text-rose-500 font-medium underline ml-2 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE TASK TABLE CONTAINER */}
      <GlassCard className="overflow-hidden border border-[var(--border)] p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5 text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredTasks.length > 0 &&
                      selectedTaskIds.length === filteredTasks.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded accent-[var(--primary)] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Task & Associated Project</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">People Involved</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)] text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-7 h-7 opacity-60 text-[var(--muted)]" />
                      <span className="font-medium text-[var(--text)]">
                        No tasks match your search or filter criteria.
                      </span>
                      <p className="text-xs text-[var(--muted)] max-w-sm">
                        Try searching for a different project name, team member, or reset your filters.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={clearAllFilters}
                        className="mt-2"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const isOverdue =
                    task.status !== TaskStatus.DONE && task.deadline < todayStr;
                  const project = projectMap.get(task.projectId);
                  const projectName = project ? project.name : 'Workspace';
                  const projectLead = project?.manager;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors group ${
                        isSelected ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          className="rounded accent-[var(--primary)] cursor-pointer"
                        />
                      </td>

                      {/* Task Title & Project Tag */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`font-semibold text-[var(--text)] line-clamp-1 ${
                              task.status === TaskStatus.DONE
                                ? 'line-through text-[var(--muted)]'
                                : ''
                            }`}
                          >
                            {task.title}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Project Badge */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProjectId(task.projectId);
                                setPersonFilter('ALL');
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors group-hover:text-[var(--text)]"
                              title={`Focus project: ${projectName}`}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    project?.color || 'var(--primary)',
                                }}
                              />
                              <span className="font-medium underline-offset-2 hover:underline">
                                {projectName}
                              </span>
                            </button>

                            {/* Project Lead sub-badge */}
                            {projectLead && (
                              <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                                <span>•</span>
                                <span>Lead: {projectLead.name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge priority={task.priority} />
                      </td>

                      {/* Quick-Toggle Status Pills (To Do | In Progress | Done) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] gap-1">
                          {/* To Do Pill */}
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(task.id, TaskStatus.TODO)}
                            title="Set status to To Do (pending sprint kickoff)"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              task.status === TaskStatus.TODO
                                ? 'bg-[var(--neutral-bg)] text-[var(--neutral-text)] shadow-sm font-semibold'
                                : 'text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                          >
                            To Do
                          </button>

                          {/* In Progress Pill */}
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}
                            title="Set status to In Progress (deliverable in development)"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              task.status === TaskStatus.IN_PROGRESS
                                ? 'bg-[var(--warning-bg)] text-[var(--warning-text)] shadow-sm font-semibold'
                                : 'text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                          >
                            In Progress
                          </button>

                          {/* Done Pill */}
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(task.id, TaskStatus.DONE)}
                            title="Mark task as Done (automatically updates project progress)"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              task.status === TaskStatus.DONE
                                ? 'bg-[var(--success-bg)] text-[var(--success-text)] shadow-sm font-semibold'
                                : 'text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                          >
                            Done
                          </button>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div
                          title={
                            isOverdue
                              ? `Alert: Overdue deliverable! Target deadline was ${task.deadline}`
                              : `Target deadline: ${task.deadline}`
                          }
                          className={`inline-flex items-center gap-1.5 ${
                            isOverdue
                              ? 'text-rose-500 font-semibold'
                              : 'text-[var(--muted)]'
                          }`}
                        >
                          {isOverdue ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {new Date(task.deadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* People Involved (Assignee & Role) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {task.assignee ? (
                          <button
                            type="button"
                            onClick={() => setPersonFilter(task.assignee!.id)}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
                            title={`Assigned to ${task.assignee.name} (${task.assignee.role || 'Member'}). Click to filter their tasks`}
                          >
                            <img
                              src={task.assignee.avatarUrl}
                              alt={task.assignee.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[var(--border)]"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-[var(--text)]">
                                {task.assignee.name}
                              </span>
                              <span className="text-[10px] text-[var(--muted)]">
                                {task.assignee.role || 'Contributor'}
                              </span>
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--muted)] italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit task deliverable details, priority, deadline, or assignee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(task)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Permanently remove this task from the workspace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        defaultProjectId={selectedProjectId || undefined}
        onSubmit={(data) => {
          if (editingTask) {
            updateTask(editingTask.id, data);
          } else {
            addTask(data);
          }
        }}
      />

      {/* Task Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task?"
        message={`Are you sure you want to delete task "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        onConfirm={() => {
          if (deletingTask) {
            deleteTask(deletingTask.id);
            setDeletingTask(null);
          }
        }}
      />
    </section>
  );
};
