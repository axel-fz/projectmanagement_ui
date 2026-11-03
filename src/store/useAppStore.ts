import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Project,
  Task,
  Toast,
  Manager,
  ProjectStatus,
  TaskStatus,
  Priority,
  ViewTab,
} from '../types';
import { INITIAL_MANAGERS, INITIAL_PROJECTS, INITIAL_TASKS } from '../data/initialData';

interface AppState {
  projects: Project[];
  tasks: Task[];
  toasts: Toast[];
  currentManager: Manager;
  activeTab: ViewTab;
  searchQuery: string;
  selectedProjectId: string | null;
  isGuidedTourOpen: boolean;
  isProjectTaskTourOpen: boolean;

  // Project Actions
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void; // Cascading task deletion

  // Task Actions
  addTask: (data: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  // Toast Actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // UI State Actions
  setActiveTab: (tab: ViewTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  setCurrentManager: (manager: Manager) => void;
  setIsGuidedTourOpen: (open: boolean) => void;
  setIsProjectTaskTourOpen: (open: boolean) => void;
  resetToSeedData: () => void;

  // Computed Selectors
  getActiveProjectsCount: () => number;
  getCompletedTasksRatio: () => string;
  getOverdueTasksCount: (referenceDate?: string) => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      toasts: [],
      currentManager: INITIAL_MANAGERS[0],
      activeTab: 'dashboard',
      searchQuery: '',
      selectedProjectId: null,
      isGuidedTourOpen: false,
      isProjectTaskTourOpen: false,

      // Project Actions
      addProject: (data) => {
        const newProject: Project = {
          ...data,
          id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
        }));

        get().addToast({
          message: `Project "${newProject.name}" created successfully.`,
          type: 'success',
        });
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));

        get().addToast({
          message: 'Project updated successfully.',
          type: 'info',
        });
      },

      deleteProject: (id) => {
        const projectToDelete = get().projects.find((p) => p.id === id);
        const name = projectToDelete ? projectToDelete.name : 'Project';

        set((state) => ({
          // Cascade delete: Remove the project AND all associated tasks
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
        }));

        get().addToast({
          message: `Project "${name}" and all associated tasks deleted.`,
          type: 'warning',
        });
      },

      // Task Actions
      addTask: (data) => {
        const newTask: Task = {
          ...data,
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));

        // Recalculate project progress based on completed tasks
        const projectTasks = [...get().tasks.filter((t) => t.projectId === newTask.projectId), newTask];
        const doneTasks = projectTasks.filter((t) => t.status === TaskStatus.DONE);
        const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === newTask.projectId ? { ...p, progress } : p
          ),
        }));

        get().addToast({
          message: `Task "${newTask.title}" added successfully.`,
          type: 'success',
        });
      },

      updateTask: (id, updates) => {
        set((state) => {
          const updatedTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
          return { tasks: updatedTasks };
        });

        // Update project progress
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          const projectTasks = get().tasks.filter((t) => t.projectId === task.projectId);
          const doneTasks = projectTasks.filter((t) => t.status === TaskStatus.DONE);
          const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === task.projectId ? { ...p, progress } : p
            ),
          }));
        }

        get().addToast({
          message: 'Task updated successfully.',
          type: 'info',
        });
      },

      deleteTask: (id) => {
        const taskToDelete = get().tasks.find((t) => t.id === id);
        const projectId = taskToDelete?.projectId;

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));

        if (projectId) {
          const remainingTasks = get().tasks.filter((t) => t.projectId === projectId);
          const doneTasks = remainingTasks.filter((t) => t.status === TaskStatus.DONE);
          const progress = remainingTasks.length > 0 ? Math.round((doneTasks.length / remainingTasks.length) * 100) : 0;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === projectId ? { ...p, progress } : p
            ),
          }));
        }

        get().addToast({
          message: 'Task deleted.',
          type: 'info',
        });
      },

      updateTaskStatus: (id, status) => {
        set((state) => {
          const updatedTasks = state.tasks.map((t) => (t.id === id ? { ...t, status } : t));
          return { tasks: updatedTasks };
        });

        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          const projectTasks = get().tasks.filter((t) => t.projectId === task.projectId);
          const doneTasks = projectTasks.filter((t) => t.status === TaskStatus.DONE);
          const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === task.projectId ? { ...p, progress } : p
            ),
          }));
        }
      },

      // Toast Actions
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const duration = toast.duration || 4000;
        const newToast: Toast = { ...toast, id, duration };

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));

        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
      setCurrentManager: (currentManager) => set({ currentManager }),
      setIsGuidedTourOpen: (isGuidedTourOpen) => set({ isGuidedTourOpen }),
      setIsProjectTaskTourOpen: (isProjectTaskTourOpen) => set({ isProjectTaskTourOpen }),
      resetToSeedData: () => {
        set({
          projects: INITIAL_PROJECTS,
          tasks: INITIAL_TASKS,
          selectedProjectId: null,
          searchQuery: '',
        });
        get().addToast({
          message: 'Workspace reset to default seed data.',
          type: 'info',
        });
      },

      // Computed Getters / Selectors
      getActiveProjectsCount: () => {
        return get().projects.filter((p) => p.status === ProjectStatus.IN_PROGRESS).length;
      },

      getCompletedTasksRatio: () => {
        const tasks = get().tasks;
        const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
        return `${completed}/${tasks.length}`;
      },

      getOverdueTasksCount: (referenceDate?: string) => {
        const today = referenceDate || '2026-11-03';
        return get().tasks.filter(
          (t) => t.status !== TaskStatus.DONE && t.deadline < today
        ).length;
      },
    }),
    {
      name: 'nexaflow-app-data',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        projects: state.projects,
        tasks: state.tasks,
        currentManager: state.currentManager,
      }),
    }
  )
);
